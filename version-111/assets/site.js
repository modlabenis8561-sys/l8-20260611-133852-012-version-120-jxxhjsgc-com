(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (navToggle && mobilePanel) {
        navToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 360) {
                backTop.classList.add('show');
            } else {
                backTop.classList.remove('show');
            }
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                startTimer();
            });
        }

        slider.addEventListener('mouseenter', stopTimer);
        slider.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var filterList = document.querySelector('[data-filter-list]');

    if (filterList) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var search = document.querySelector('[data-filter-search]');
        var region = document.querySelector('[data-filter-region]');
        var type = document.querySelector('[data-filter-type]');
        var year = document.querySelector('[data-filter-year]');
        var clear = document.querySelector('[data-filter-clear]');
        var count = document.querySelector('[data-result-count]');

        function yearMatches(cardYear, value) {
            var numericYear = Number(cardYear);

            if (!value) {
                return true;
            }

            if (value === '2010s') {
                return numericYear >= 2010 && numericYear <= 2019;
            }

            if (value === 'older') {
                return numericYear <= 2009;
            }

            return String(cardYear) === value;
        }

        function runFilter() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (regionValue && card.dataset.region !== regionValue) {
                    matched = false;
                }

                if (typeValue && card.dataset.type !== typeValue) {
                    matched = false;
                }

                if (!yearMatches(card.dataset.year, yearValue)) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部';
            }
        }

        [search, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', runFilter);
                control.addEventListener('change', runFilter);
            }
        });

        if (clear) {
            clear.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                if (region) {
                    region.value = '';
                }
                if (type) {
                    type.value = '';
                }
                if (year) {
                    year.value = '';
                }
                runFilter();
            });
        }

        runFilter();
    }
})();
