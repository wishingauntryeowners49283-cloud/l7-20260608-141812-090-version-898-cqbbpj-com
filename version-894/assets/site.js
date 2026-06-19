(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function unique(values) {
    return values.filter(function (value, index, array) {
      return value && array.indexOf(value) === index;
    }).sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-CN");
    });
  }

  function setupMenu() {
    var button = one(".menu-toggle");
    var menu = one(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
    });
  }

  function setupHero() {
    var slider = one(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = all(".hero-slide", slider);
    var dots = all(".hero-dot", slider);
    var prev = one(".hero-prev", slider);
    var next = one(".hero-next", slider);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    unique(values).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupCatalog(area) {
    var cards = all(".movie-card", area);
    if (!cards.length) {
      return;
    }
    var search = one(".catalog-search", area);
    var region = one(".catalog-region", area);
    var type = one(".catalog-type", area);
    var year = one(".catalog-year", area);
    var category = one(".catalog-category", area);
    var reset = one(".catalog-reset", area);
    var empty = one(".empty-state", area);

    fillSelect(region, cards.map(function (card) { return card.dataset.region; }));
    fillSelect(type, cards.map(function (card) { return card.dataset.type; }));
    fillSelect(year, cards.map(function (card) { return card.dataset.year; }));

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var selectedRegion = region ? region.value : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";
      var selectedCategory = category ? category.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;
        if (keyword && card.dataset.search.indexOf(keyword) === -1) {
          ok = false;
        }
        if (selectedRegion && card.dataset.region !== selectedRegion) {
          ok = false;
        }
        if (selectedType && card.dataset.type !== selectedType) {
          ok = false;
        }
        if (selectedYear && card.dataset.year !== selectedYear) {
          ok = false;
        }
        if (selectedCategory && card.dataset.category !== selectedCategory) {
          ok = false;
        }
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [search, region, type, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        [search, region, type, year, category].forEach(function (control) {
          if (control) {
            control.value = "";
          }
        });
        apply();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    all(".catalog-area").forEach(setupCatalog);
  });
})();
