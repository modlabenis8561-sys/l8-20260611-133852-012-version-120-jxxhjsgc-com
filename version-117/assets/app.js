(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilterScope(scope) {
        var input = scope.querySelector("[data-filter-input]");
        var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
        var empty = scope.querySelector("[data-empty-state]");
        var groups = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-group]"));
        var activeFilters = {};

        groups.forEach(function (group) {
            var name = group.getAttribute("data-filter-group");
            activeFilters[name] = "all";

            group.querySelectorAll("button[data-filter-value]").forEach(function (button) {
                button.addEventListener("click", function () {
                    group.querySelectorAll("button[data-filter-value]").forEach(function (other) {
                        other.classList.remove("is-active");
                    });

                    button.classList.add("is-active");
                    activeFilters[name] = button.getAttribute("data-filter-value") || "all";
                    apply();
                });
            });
        });

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var visible = 0;

            items.forEach(function (item) {
                var haystack = normalize([
                    item.getAttribute("data-title"),
                    item.getAttribute("data-year"),
                    item.getAttribute("data-type"),
                    item.getAttribute("data-keywords")
                ].join(" "));
                var matched = !keyword || haystack.indexOf(keyword) !== -1;

                Object.keys(activeFilters).forEach(function (name) {
                    var filter = activeFilters[name];

                    if (!filter || filter === "all") {
                        return;
                    }

                    var attr = normalize(item.getAttribute("data-" + name));
                    matched = matched && attr.indexOf(normalize(filter)) !== -1;
                });

                item.classList.toggle("is-hidden", !matched);

                if (matched) {
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

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");

        if (q && input) {
            input.value = q;
        }

        apply();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(initFilterScope);
    }

    function showPlayerMessage(player, message) {
        var box = player.querySelector("[data-player-message]");

        if (!box) {
            return;
        }

        box.textContent = message;
        box.classList.add("is-visible");
    }

    function hidePlayerMessage(player) {
        var box = player.querySelector("[data-player-message]");

        if (!box) {
            return;
        }

        box.textContent = "";
        box.classList.remove("is-visible");
    }

    function startPlayer(player) {
        var video = player.querySelector("video");
        var source = player.getAttribute("data-stream");

        if (!video || !source) {
            showPlayerMessage(player, "视频暂时无法加载，请稍后重试");
            return;
        }

        hidePlayerMessage(player);
        player.classList.add("is-playing");
        video.controls = true;

        if (player._hlsReady) {
            video.play().catch(function () {
                showPlayerMessage(player, "点击播放器继续观看");
            });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            player._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                player._hlsReady = true;
                video.play().catch(function () {
                    showPlayerMessage(player, "点击播放器继续观看");
                });
            });
            hls.on(window.Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    showPlayerMessage(player, "视频暂时无法加载，请稍后重试");
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            player._hlsReady = true;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {
                    showPlayerMessage(player, "点击播放器继续观看");
                });
            }, { once: true });
        } else {
            showPlayerMessage(player, "请使用支持在线播放的浏览器打开");
        }
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var button = player.querySelector("[data-player-start]");
            var video = player.querySelector("video");

            if (button) {
                button.addEventListener("click", function () {
                    startPlayer(player);
                });
            }

            if (video) {
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (video.currentTime === 0) {
                        player.classList.remove("is-playing");
                    }
                });
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
