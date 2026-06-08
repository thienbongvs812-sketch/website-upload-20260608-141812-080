(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-tab]"));
    if (!slides.length || !tabs.length) {
      return;
    }

    var activeIndex = 0;
    var timer = null;

    function setActive(index) {
      activeIndex = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      tabs.forEach(function (tab, tabIndex) {
        tab.classList.toggle("active", tabIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setActive((activeIndex + 1) % slides.length);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        setActive(index);
        start();
      });
    });

    setActive(0);
    start();
  }

  function initLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var scope = document.querySelector("[data-filter-scope]");
    if (!input || !scope) {
      return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var button = player.querySelector("[data-play-button]");
      var video = player.querySelector("video");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-m3u8");

      if (!button || !video || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      button.addEventListener("click", function () {
        setStatus("正在连接高清播放源...");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().then(function () {
            player.classList.add("is-playing");
          }).catch(function () {
            setStatus("浏览器拦截了自动播放，请再次点击播放器控件开始播放。");
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              player.classList.add("is-playing");
            }).catch(function () {
              setStatus("播放源已载入，请点击播放器控件开始播放。");
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放源连接失败，请刷新页面后重试。");
              hls.destroy();
            }
          });
          return;
        }

        setStatus("当前浏览器暂不支持 HLS 播放，请更换支持 HLS 的浏览器访问。");
      });
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 5).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "  <a class=\"movie-poster\" href=\"" + movie.url + "\" style=\"background-image: url('" + movie.cover + "');\" aria-label=\"" + escapeHtml(movie.title) + " 在线观看\">",
      "    <span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>",
      "    <span class=\"poster-play\">播放</span>",
      "  </a>",
      "  <div class=\"movie-info\">",
      "    <div class=\"movie-meta-line\"><a href=\"" + movie.categoryUrl + "\">" + escapeHtml(movie.category) + "</a><span>" + escapeHtml(movie.region) + "</span></div>",
      "    <h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-list\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSiteSearch() {
    var form = document.querySelector("[data-site-search-form]");
    var input = document.querySelector("[data-site-search-input]");
    var results = document.querySelector("[data-site-search-results]");
    var stats = document.querySelector("[data-search-stats]");
    if (!form || !input || !results || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (initialQuery) {
      input.value = initialQuery;
      render(initialQuery);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render(input.value);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    function render(query) {
      var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) {
        results.innerHTML = "";
        if (stats) {
          stats.textContent = "请输入关键词开始搜索。";
        }
        return;
      }

      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      if (stats) {
        stats.textContent = "找到 " + matched.length + " 条相关结果，最多展示 120 条。";
      }
      results.innerHTML = matched.map(cardTemplate).join("");
    }
  }

  ready(function () {
    initNavigation();
    initHero();
    initLocalFilter();
    initPlayers();
    initSiteSearch();
  });
})();
