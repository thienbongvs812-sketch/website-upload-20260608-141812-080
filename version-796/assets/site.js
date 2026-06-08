(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
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

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var filterGrid = document.querySelector('[data-filter-grid]');

  if (filterGrid) {
    var filterInput = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (filterInput && query) {
      filterInput.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(filterInput ? filterInput.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');

      cards.forEach(function (card) {
        var text = normalize(card.innerText + ' ' + card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.genre + ' ' + card.dataset.type + ' ' + card.dataset.year);
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || normalize(card.dataset.year) === year;
        var matchType = !type || normalize(card.dataset.type).indexOf(type) !== -1 || text.indexOf(type) !== -1;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
      });
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  }
})();
