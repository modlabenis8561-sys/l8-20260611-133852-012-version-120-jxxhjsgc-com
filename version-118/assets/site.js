(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-search-form]'), function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('[data-search-input]');
            var value = input ? input.value.trim() : '';
            if (!value) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startCarousel() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startCarousel();
            });
        });

        if (slides.length > 1) {
            startCarousel();
        }
    }

    var listTools = document.querySelector('[data-list-tools]');
    if (listTools) {
        var liveSearch = listTools.querySelector('[data-live-search]');
        var categoryFilter = listTools.querySelector('[data-filter-category]');
        var typeFilter = listTools.querySelector('[data-filter-type]');
        var yearFilter = listTools.querySelector('[data-filter-year]');
        var sortSelect = listTools.querySelector('[data-sort]');
        var list = listTools.querySelector('[data-card-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-card]')) : [];

        function normalize(value) {
            return String(value || '').toLowerCase();
        }

        function currentQuery() {
            return normalize(liveSearch && liveSearch.value ? liveSearch.value.trim() : '');
        }

        function matchesType(card, value) {
            if (!value) {
                return true;
            }
            return normalize(card.getAttribute('data-type')).indexOf(normalize(value)) !== -1;
        }

        function applyFilters() {
            var query = currentQuery();
            var category = categoryFilter ? categoryFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-text'));
                var isVisible = true;
                if (query && text.indexOf(query) === -1) {
                    isVisible = false;
                }
                if (category && card.getAttribute('data-category') !== category) {
                    isVisible = false;
                }
                if (!matchesType(card, type)) {
                    isVisible = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    isVisible = false;
                }
                card.classList.toggle('card-hidden', !isVisible);
            });
        }

        function applySort() {
            if (!list || !sortSelect) {
                return;
            }
            var mode = sortSelect.value;
            var sorted = cards.slice();
            if (mode === 'year-desc') {
                sorted.sort(function (a, b) {
                    return normalize(b.getAttribute('data-year')).localeCompare(normalize(a.getAttribute('data-year')), 'zh-CN');
                });
            } else if (mode === 'title-asc') {
                sorted.sort(function (a, b) {
                    return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-CN');
                });
            }
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
            cards = sorted;
            applyFilters();
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && liveSearch) {
            liveSearch.value = initialQuery;
        }

        [liveSearch, categoryFilter, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', applySort);
        }

        applyFilters();
    }

    var configNode = document.getElementById('player-config');
    if (configNode) {
        var playerConfig = JSON.parse(configNode.textContent || '{}');
        var video = document.querySelector('.movie-video');
        var cover = document.querySelector('.player-cover');
        var hlsInstance = null;
        var isReady = false;

        function prepareVideo() {
            if (!video || !playerConfig.src || isReady) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playerConfig.src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(playerConfig.src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = playerConfig.src;
            }
            isReady = true;
        }

        function beginPlayback() {
            if (!video) {
                return;
            }
            prepareVideo();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', beginPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!isReady || video.paused) {
                    beginPlayback();
                }
            });
            video.addEventListener('ended', function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
