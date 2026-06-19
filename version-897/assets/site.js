(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-nav-panel]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-thumb]'));
    var index = 0;
    var timer = null;

    function activate(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-dot')) || 0);
        play();
      });
    });

    hero.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    hero.addEventListener('mouseleave', play);
    activate(0);
    play();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  document.querySelectorAll('[data-card-grid]').forEach(function (grid) {
    var area = grid.parentElement || document;
    var search = area.querySelector('[data-search]');
    var sort = area.querySelector('[data-sort]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

    function applyFilter() {
      var query = normalize(search ? search.value : '');
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        card.classList.toggle('hide-card', query && text.indexOf(query) === -1);
      });
    }

    function applySort() {
      if (!sort) {
        return;
      }
      var value = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (value === 'title') {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
        }
        var ay = Number(a.getAttribute('data-year')) || 0;
        var by = Number(b.getAttribute('data-year')) || 0;
        if (value === 'year-asc') {
          return ay - by;
        }
        return by - ay;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      applyFilter();
    }

    if (search) {
      search.addEventListener('input', applyFilter);
    }

    if (sort) {
      sort.addEventListener('change', applySort);
    }
  });

  function startPlayer(shell) {
    if (!shell || shell.classList.contains('playing')) {
      return;
    }
    var video = shell.querySelector('[data-video]');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      shell.classList.add('playing');
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('playing');
        });
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', stream);
      }
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsReady) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsReady = true;
      }
      playVideo();
      return;
    }

    video.setAttribute('src', stream);
    playVideo();
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var trigger = shell.querySelector('[data-play]');
    var video = shell.querySelector('[data-video]');

    if (trigger) {
      trigger.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.seeking && video.currentTime === 0) {
          shell.classList.remove('playing');
        }
      });
    }
  });
}());
