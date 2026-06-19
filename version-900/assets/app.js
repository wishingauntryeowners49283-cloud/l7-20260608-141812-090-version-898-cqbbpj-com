(() => {
    const onReady = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    const initMobileNav = () => {
        const button = document.querySelector("[data-mobile-toggle]");
        const panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", () => {
            panel.classList.toggle("is-open");
        });
    };

    const initHero = () => {
        const slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        const prev = slider.querySelector("[data-hero-prev]");
        const next = slider.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;
        const show = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === index);
                dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
            });
        };
        const start = () => {
            timer = window.setInterval(() => show(index + 1), 5000);
        };
        const restart = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };
        prev?.addEventListener("click", () => {
            show(index - 1);
            restart();
        });
        next?.addEventListener("click", () => {
            show(index + 1);
            restart();
        });
        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                show(dotIndex);
                restart();
            });
        });
        start();
    };

    const initLocalFilters = () => {
        const forms = Array.from(document.querySelectorAll("[data-local-filter]"));
        forms.forEach((form) => {
            const input = form.querySelector("[data-filter-input]");
            const select = form.querySelector("[data-sort-select]");
            const list = document.querySelector("[data-sort-list]");
            if (!list) {
                return;
            }
            const cards = Array.from(list.children);
            const normalize = (value) => String(value || "").trim().toLowerCase();
            const applyFilter = () => {
                const query = normalize(input?.value);
                cards.forEach((card) => {
                    const haystack = normalize(card.dataset.search);
                    card.hidden = query ? !haystack.includes(query) : false;
                });
            };
            const applySort = () => {
                const mode = select?.value || "latest";
                const sorted = Array.from(list.children).sort((left, right) => {
                    if (mode === "title") {
                        return String(left.dataset.title || "").localeCompare(String(right.dataset.title || ""), "zh-Hans-CN");
                    }
                    const leftYear = Number(left.dataset.year || 0);
                    const rightYear = Number(right.dataset.year || 0);
                    return mode === "oldest" ? leftYear - rightYear : rightYear - leftYear;
                });
                sorted.forEach((card) => list.appendChild(card));
            };
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                applyFilter();
            });
            input?.addEventListener("input", applyFilter);
            select?.addEventListener("change", () => {
                applySort();
                applyFilter();
            });
        });
    };

    onReady(() => {
        initMobileNav();
        initHero();
        initLocalFilters();
    });
})();
