(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    if (slides.length <= 1) {
      return;
    }

    function show(nextIndex) {
      slides[index].classList.remove("is-active");
      dots[index].classList.remove("is-active");
      index = nextIndex;
      slides[index].classList.add("is-active");
      dots[index].classList.add("is-active");
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
      });
    });

    window.setInterval(function() {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function yearMatches(year, group) {
    var value = parseInt(year, 10);

    if (!group) {
      return true;
    }

    if (!value) {
      return false;
    }

    if (group === "2020") {
      return value >= 2020;
    }

    if (group === "2010") {
      return value >= 2010 && value < 2020;
    }

    if (group === "2000") {
      return value >= 2000 && value < 2010;
    }

    if (group === "1990") {
      return value < 2000;
    }

    return true;
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function(scope) {
      var input = scope.querySelector("[data-filter-input]");
      var typeSelect = scope.querySelector("[data-type-filter]");
      var yearSelect = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-empty-state]");

      if (!cards.length) {
        return;
      }

      if (scope.hasAttribute("data-search-page")) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (input && query) {
          input.value = query;
        }
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var typeValue = normalize(typeSelect ? typeSelect.value : "");
        var yearValue = yearSelect ? yearSelect.value : "";
        var visible = 0;

        cards.forEach(function(card) {
          var searchable = normalize(card.getAttribute("data-search") || card.textContent);
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = card.getAttribute("data-year") || "";
          var matchKeyword = !keyword || searchable.indexOf(keyword) !== -1;
          var matchType = !typeValue || cardType === typeValue;
          var matchYear = yearMatches(cardYear, yearValue);
          var shouldShow = matchKeyword && matchType && matchYear;

          card.classList.toggle("is-hidden-by-filter", !shouldShow);

          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }

      apply();
    });
  }

  function setupPlayer() {
    var dataNode = document.getElementById("player-data");
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");

    if (!dataNode || !video || !overlay) {
      return;
    }

    var info;

    try {
      info = JSON.parse(dataNode.textContent);
    } catch (error) {
      info = null;
    }

    if (!info || !info.source) {
      return;
    }

    var hls = null;
    var started = false;

    function attachSource() {
      return new Promise(function(resolve) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = info.source;
          resolve();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(info.source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function(event, data) {
            if (data && data.fatal && hls) {
              hls.destroy();
              hls = null;
              video.src = info.source;
            }
          });
          return;
        }

        video.src = info.source;
        resolve();
      });
    }

    function startPlayback() {
      overlay.classList.add("is-hidden");
      video.controls = true;

      if (started) {
        video.play().catch(function() {});
        return;
      }

      started = true;

      attachSource().then(function() {
        video.play().catch(function() {});
      });
    }

    overlay.addEventListener("click", startPlayback);

    video.addEventListener("click", function() {
      if (!started || video.paused) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
