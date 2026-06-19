import { H as Hls } from './hls-vendor.js';

function setMessage(player, message) {
  var messageNode = player.querySelector('[data-player-message]');

  if (messageNode) {
    messageNode.textContent = message || '';
  }
}

function startPlayer(player) {
  var video = player.querySelector('video');
  var source = player.getAttribute('data-src');

  if (!video || !source) {
    setMessage(player, '播放源暂时不可用');
    return;
  }

  player.classList.add('playing');
  setMessage(player, '正在加载播放源...');

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setMessage(player, '');
      video.play().catch(function () {
        setMessage(player, '请点击播放器开始播放');
      });
    });

    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        setMessage(player, '播放加载失败，请刷新页面后重试');
        hls.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', function () {
      setMessage(player, '');
      video.play().catch(function () {
        setMessage(player, '请点击播放器开始播放');
      });
    }, { once: true });
  } else {
    setMessage(player, '当前浏览器不支持 HLS 播放');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var button = player.querySelector('[data-play-button]');
    var started = false;

    if (!button) {
      return;
    }

    button.addEventListener('click', function () {
      if (started) {
        return;
      }

      started = true;
      startPlayer(player);
    });
  });
});
