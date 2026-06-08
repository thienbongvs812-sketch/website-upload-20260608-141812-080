(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function syncHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 16) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.display = 'none';
    });
  });

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(active - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        startTimer();
      });
    });

    show(0);
    startTimer();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-year-filter]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
    var empty = scope.querySelector('[data-empty-message]');
    var activeYear = '';

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var year = card.getAttribute('data-year') || '';
        var text = card.textContent.toLowerCase();
        var keywordMatched = !keyword || title.indexOf(keyword) !== -1 || text.indexOf(keyword) !== -1;
        var yearMatched = !activeYear || year === activeYear;
        var matched = keywordMatched && yearMatched;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-year-filter') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });

    var query = new URLSearchParams(window.location.search).get('q');
    if (query && input) {
      input.value = query;
    }

    applyFilter();
  });

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var trigger = box.querySelector('[data-play-trigger]');
    var prepared = false;

    function prepare() {
      if (!video || prepared) {
        return;
      }

      var streamUrl = video.getAttribute('data-stream');
      if (!streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      prepared = true;
    }

    function play() {
      prepare();
      if (trigger) {
        trigger.hidden = true;
      }
      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (trigger) {
              trigger.hidden = false;
            }
          });
        }
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!prepared || video.paused) {
          play();
        }
      });
    }
  });
})();
