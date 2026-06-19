(function () {
  function setupPlayer(box) {
    var video = box.querySelector("video");
    var trigger = box.querySelector(".player-overlay");
    var stream = box.getAttribute("data-stream");
    var ready = false;
    var engine = null;

    function attach() {
      if (ready || !video || !stream) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        engine = new window.Hls();
        engine.loadSource(stream);
        engine.attachMedia(video);
      } else {
        video.src = stream;
      }
      ready = true;
      if (engine) {
        box.dataset.ready = "hls";
      }
    }

    function start() {
      attach();
      box.classList.add("is-playing");
      video.controls = true;
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready || video.paused) {
          start();
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(setupPlayer);
  });
})();
