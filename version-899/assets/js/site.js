(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');
    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var homeSearch = document.querySelector('[data-home-search]');
    if (homeSearch) {
        homeSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = homeSearch.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = './all-movies.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;
        var activate = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        };
        if (prev) {
            prev.addEventListener('click', function () {
                activate(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                activate(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                restart();
            });
        });
        activate(0);
        restart();
    }

    var input = document.querySelector('[data-search-input]');
    var sort = document.querySelector('[data-sort-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var count = document.querySelector('[data-result-count]');
    var empty = document.querySelector('[data-empty-state]');
    var activeFilter = '';
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
        input.value = params.get('q');
    }
    var applyCards = function () {
        if (!cards.length) {
            return;
        }
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
            var searchText = card.getAttribute('data-search') || '';
            var category = card.getAttribute('data-category') || '';
            var matchedQuery = !query || searchText.indexOf(query) !== -1;
            var matchedFilter = !activeFilter || category === activeFilter;
            var show = matchedQuery && matchedFilter;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });
        if (count) {
            count.textContent = String(visible);
        }
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    };
    var sortCards = function () {
        if (!sort || !cards.length) {
            return;
        }
        var list = document.querySelector('[data-card-list]');
        if (!list) {
            return;
        }
        var value = sort.value;
        var sorted = cards.slice().sort(function (a, b) {
            if (value === 'year-desc') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }
            if (value === 'year-asc') {
                return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
            }
            if (value === 'title') {
                return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
            }
            return 0;
        });
        sorted.forEach(function (card) {
            list.appendChild(card);
        });
        cards = sorted;
        applyCards();
    };
    if (input) {
        input.addEventListener('input', applyCards);
    }
    if (sort) {
        sort.addEventListener('change', sortCards);
    }
    Array.prototype.slice.call(document.querySelectorAll('[data-filter]')).forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || '';
            Array.prototype.slice.call(document.querySelectorAll('[data-filter]')).forEach(function (other) {
                other.classList.toggle('active', other === button);
            });
            applyCards();
        });
    });
    applyCards();

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play]');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-hls') || '';
        var hideButton = function () {
            player.classList.add('is-playing');
            if (button) {
                button.classList.add('is-hidden');
            }
        };
        var startPlayback = function () {
            if (!source) {
                return;
            }
            var begin = function () {
                hideButton();
                var playRequest = video.play();
                if (playRequest && typeof playRequest.catch === 'function') {
                    playRequest.catch(function () {});
                }
            };
            if (window.Hls && window.Hls.isSupported()) {
                if (!video.hlsController) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    video.hlsController = hls;
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, begin);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                            video.hlsController = null;
                        }
                    });
                } else {
                    begin();
                }
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.src) {
                    video.src = source;
                    video.load();
                    video.addEventListener('loadedmetadata', begin, { once: true });
                } else {
                    begin();
                }
            } else {
                if (!video.src) {
                    video.src = source;
                    video.load();
                }
                begin();
            }
        };
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayback();
            });
        }
        video.addEventListener('play', hideButton);
        video.addEventListener('click', function () {
            if (!video.src && !video.hlsController) {
                startPlayback();
            }
        });
    });
})();
