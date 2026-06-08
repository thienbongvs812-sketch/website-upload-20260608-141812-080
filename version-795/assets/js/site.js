(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll(".menu-toggle").forEach(function (button) {
            button.addEventListener("click", function () {
                var menu = document.querySelector(".mobile-menu");
                if (!menu) {
                    return;
                }
                var expanded = button.getAttribute("aria-expanded") === "true";
                button.setAttribute("aria-expanded", String(!expanded));
                menu.hidden = expanded;
            });
        });

        document.querySelectorAll("[data-filter-list]").forEach(function (panel) {
            var textInput = panel.querySelector("[data-filter-text]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var list = panel.parentElement ? panel.parentElement.querySelectorAll("[data-card]") : [];

            function normalize(value) {
                return String(value || "").toLowerCase();
            }

            function applyFilter() {
                var q = normalize(textInput ? textInput.value : "");
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";

                list.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (year && card.getAttribute("data-year") !== year) {
                        ok = false;
                    }
                    if (type && card.getAttribute("data-type") !== type) {
                        ok = false;
                    }
                    card.hidden = !ok;
                });
            }

            [textInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
        });
    });
})();
