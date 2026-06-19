(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenus() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll(".movie-grid, .rank-list"));
    var input = document.querySelector("[data-search-input]");
    var typeWrap = document.querySelector("[data-type-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var empty = document.querySelector("[data-empty-state]");
    if (!grids.length || (!input && !typeWrap && !yearSelect)) {
      return;
    }
    var activeType = "all";
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var activeYear = yearSelect ? yearSelect.value : "all";
      var visible = 0;
      grids.forEach(function (grid) {
        Array.prototype.slice.call(grid.querySelectorAll("[data-card]")).forEach(function (card) {
          var text = card.textContent.toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchType = activeType === "all" || cardType.indexOf(activeType) !== -1;
          var matchYear = activeYear === "all" || cardYear === activeYear;
          var matched = matchQuery && matchType && matchYear;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", apply);
    }
    if (typeWrap) {
      Array.prototype.slice.call(typeWrap.querySelectorAll("button")).forEach(function (button) {
        button.addEventListener("click", function () {
          activeType = button.getAttribute("data-type-value") || "all";
          Array.prototype.slice.call(typeWrap.querySelectorAll("button")).forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
    }
    apply();
  }

  window.initMoviePlayer = function (videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video || !streamUrl) {
      return;
    }
    var shell = video.closest(".player-shell");
    var button = shell ? shell.querySelector(".play-cover") : null;
    var loaded = false;
    function load() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }
    function start() {
      load();
      if (shell) {
        shell.classList.add("is-playing");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });
  };

  ready(function () {
    initMenus();
    initHero();
    initFilters();
  });
})();
