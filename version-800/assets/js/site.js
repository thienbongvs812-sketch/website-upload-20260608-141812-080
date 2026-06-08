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
        var timer = null;

        function showSlide(index) {
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
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    Array.prototype.slice.call(document.querySelectorAll('.movie-search')).forEach(function (input) {
        var targetId = input.getAttribute('data-search-input');
        var target = targetId ? document.getElementById(targetId) : document;

        if (!target) {
            target = document;
        }

        var items = Array.prototype.slice.call(target.querySelectorAll('[data-search-text]'));

        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();

            items.forEach(function (item) {
                var text = (item.getAttribute('data-search-text') || '').toLowerCase();
                item.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
            });
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var trigger = player.querySelector('[data-play-trigger]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hlsInstance = null;
        var prepared = false;

        function prepare() {
            if (!video || !stream || prepared) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                prepared = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                prepared = true;
                return;
            }

            video.src = stream;
            prepared = true;
        }

        function play() {
            prepare();
            player.classList.add('is-playing');

            if (video) {
                var result = video.play();

                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }
        }

        if (trigger) {
            trigger.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }
    });
})();
