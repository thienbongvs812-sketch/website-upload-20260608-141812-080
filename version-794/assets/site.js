(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }

  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(
      carousel.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      carousel.querySelectorAll(".hero-dots button"),
    );
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  });

  var homeSearch = document.getElementById("site-search");
  if (homeSearch) {
    homeSearch.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = homeSearch.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var target = "./catalog.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  document.querySelectorAll(".filter-search").forEach(function (input) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }

    function applyFilter() {
      var query = input.value.trim().toLowerCase();
      var scope = input.closest("section") || document;
      scope.querySelectorAll(".movie-card, .rank-row").forEach(function (item) {
        var text = (
          item.getAttribute("data-search") ||
          item.textContent ||
          ""
        ).toLowerCase();
        item.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
      });
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
  });

  document.querySelectorAll(".player-shell").forEach(function (shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-start");
    var playUrl = shell.getAttribute("data-play-url");
    var ready = false;

    function attachAndPlay() {
      if (!video || !playUrl) {
        return;
      }

      if (!ready) {
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(playUrl);
          hls.attachMedia(video);
        } else {
          video.src = playUrl;
        }
      }

      if (button) {
        button.classList.add("is-hidden");
      }

      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", attachAndPlay);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready || video.paused) {
          attachAndPlay();
        }
      });
    }
  });
})();
