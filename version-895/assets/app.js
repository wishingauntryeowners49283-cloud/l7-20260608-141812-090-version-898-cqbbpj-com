(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === current);
            });

            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var clearSearch = document.querySelector('[data-clear-search]');

    if (searchInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        function filterCards() {
            var keyword = searchInput.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                card.classList.toggle('is-hidden-card', keyword && text.indexOf(keyword) === -1);
            });
        }

        searchInput.addEventListener('input', filterCards);

        if (clearSearch) {
            clearSearch.addEventListener('click', function () {
                searchInput.value = '';
                filterCards();
                searchInput.focus();
            });
        }
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play]');
        var stream = player.getAttribute('data-stream');
        var ready = false;
        var hlsInstance = null;

        function loadStream() {
            if (!video || !stream || ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function playVideo() {
            loadStream();

            if (button) {
                button.classList.add('is-hidden');
            }

            if (video) {
                video.controls = true;
                var action = video.play();

                if (action && typeof action.catch === 'function') {
                    action.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready) {
                    playVideo();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
