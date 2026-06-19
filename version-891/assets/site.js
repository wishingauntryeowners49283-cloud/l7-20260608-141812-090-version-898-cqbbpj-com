(function () {
  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        schedule();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        schedule();
      });
    }

    showSlide(0);
    schedule();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var list = panel.parentElement.querySelector('[data-movie-list]');

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var searchInput = panel.querySelector('[data-filter-search]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var regionInput = panel.querySelector('[data-filter-region]');
      var count = panel.querySelector('[data-filter-count]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');

      if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
      }

      function applyFilter() {
        var keyword = normalize(searchInput && searchInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionInput && regionInput.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-category'),
            card.textContent
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || normalize(card.getAttribute('data-year')).indexOf(year) !== -1;
          var matchType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1 || haystack.indexOf(type) !== -1;
          var matchRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
          var isVisible = matchKeyword && matchYear && matchType && matchRegion;

          card.classList.toggle('hidden-by-filter', !isVisible);

          if (isVisible) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
        }
      }

      [searchInput, yearSelect, typeSelect, regionInput].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
  });
})();
