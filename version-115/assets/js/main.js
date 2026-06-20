(function () {
    const body = document.body;
    const mobileToggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const overlay = document.querySelector('[data-search-overlay]');
    const openButtons = document.querySelectorAll('[data-open-search]');
    const closeButton = document.querySelector('[data-close-search]');
    const globalInput = document.querySelector('[data-global-search]');
    const resultBox = document.querySelector('[data-search-results]');
    const searchItems = Array.isArray(window.siteSearchData) ? window.siteSearchData : [];

    function openSearch(initialValue) {
        if (!overlay) {
            return;
        }
        overlay.hidden = false;
        body.style.overflow = 'hidden';
        if (globalInput) {
            globalInput.value = initialValue || '';
            globalInput.focus();
            renderGlobalResults(globalInput.value);
        }
    }

    function closeSearch() {
        if (!overlay) {
            return;
        }
        overlay.hidden = true;
        body.style.overflow = '';
    }

    openButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            openSearch('');
        });
    });

    if (closeButton) {
        closeButton.addEventListener('click', closeSearch);
    }

    if (overlay) {
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                closeSearch();
            }
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeSearch();
        }
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function renderGlobalResults(query) {
        if (!resultBox) {
            return;
        }
        const keyword = normalize(query);
        const pool = keyword
            ? searchItems.filter(function (item) {
                const text = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre,
                    item.category,
                    item.tags
                ].join(' '));
                return text.includes(keyword);
            })
            : searchItems.slice(0, 18);

        const html = pool.slice(0, 36).map(function (item) {
            return [
                '<a class="search-result-item" href="' + item.url + '">',
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
                '<strong>' + escapeHtml(item.title) + '<small>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</small></strong>',
                '<span>观看</span>',
                '</a>'
            ].join('');
        }).join('');

        resultBox.innerHTML = html || '<div class="empty-state">没有找到匹配影片</div>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    if (globalInput) {
        globalInput.addEventListener('input', function () {
            renderGlobalResults(globalInput.value);
        });
    }

    document.querySelectorAll('[data-hero-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input');
            openSearch(input ? input.value : '');
        });
    });

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        function showSlide(index) {
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
                showSlide(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    document.querySelectorAll('[data-catalog-controls]').forEach(function (controls) {
        const section = controls.closest('section') || document;
        const grid = section.querySelector('[data-catalog-grid]');
        const empty = section.querySelector('[data-empty-state]');
        if (!grid) {
            return;
        }
        const search = controls.querySelector('[data-catalog-search]');
        const type = controls.querySelector('[data-catalog-type]');
        const year = controls.querySelector('[data-catalog-year]');
        const region = controls.querySelector('[data-catalog-region]');
        const cards = Array.from(grid.children);

        function filterCards() {
            const keyword = normalize(search ? search.value : '');
            const typeValue = normalize(type ? type.value : '');
            const yearValue = normalize(year ? year.value : '');
            const regionValue = normalize(region ? region.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' '));
                const matchesKeyword = !keyword || text.includes(keyword);
                const matchesType = !typeValue || normalize(card.getAttribute('data-type')).includes(typeValue);
                const matchesYear = !yearValue || normalize(card.getAttribute('data-year')).includes(yearValue);
                const matchesRegion = !regionValue || normalize(card.getAttribute('data-region')).includes(regionValue);
                const shouldShow = matchesKeyword && matchesType && matchesYear && matchesRegion;
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [search, type, year, region].forEach(function (field) {
            if (field) {
                field.addEventListener('input', filterCards);
                field.addEventListener('change', filterCards);
            }
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play]');
        const stream = player.getAttribute('data-stream');
        let loaded = false;
        let hlsInstance = null;

        function loadAndPlay() {
            if (!video || !stream) {
                return;
            }
            if (!loaded) {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
                loaded = true;
            } else {
                video.play().catch(function () {});
            }
            player.classList.add('is-ready');
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                loadAndPlay();
            });
        }

        player.addEventListener('click', function (event) {
            if (event.target === video && loaded) {
                return;
            }
            loadAndPlay();
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
