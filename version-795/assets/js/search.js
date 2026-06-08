(function () {
    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalize(value) {
        return String(value || "").toLowerCase();
    }

    function buildCard(movie) {
        return [
            '<article class="movie-card">',
            '<a href="' + escapeHtml(movie.url) + '" class="poster-wrap">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
            '<p>' + escapeHtml(movie.summary) + '</p>',
            '<div class="movie-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
            '<a class="pill-link" href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>',
            '</div>',
            '</article>'
        ].join("");
    }

    function render() {
        var input = document.getElementById("search-input");
        var results = document.getElementById("search-results");
        if (!input || !results || !window.SEARCH_MOVIES) {
            return;
        }
        var q = normalize(input.value);
        var list = window.SEARCH_MOVIES.filter(function (movie) {
            if (!q) {
                return true;
            }
            return normalize([
                movie.title,
                movie.year,
                movie.type,
                movie.region,
                movie.genre,
                movie.tags,
                movie.summary,
                movie.category
            ].join(" ")).indexOf(q) !== -1;
        }).slice(0, 120);
        results.innerHTML = list.map(buildCard).join("");
    }

    document.addEventListener("DOMContentLoaded", function () {
        var input = document.getElementById("search-input");
        if (!input) {
            return;
        }
        input.value = getQueryValue("q");
        input.addEventListener("input", render);
        render();
    });
})();
