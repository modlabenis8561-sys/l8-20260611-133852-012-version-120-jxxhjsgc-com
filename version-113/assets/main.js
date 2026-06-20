(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = qs('[data-nav-toggle]');
    var links = qs('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function setupImageFallbacks() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      });
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var section = panel.closest('section') || document;
      var input = qs('.js-filter-input', panel);
      var yearFilter = qs('.js-year-filter', panel);
      var genreFilter = qs('.js-genre-filter', panel);
      var grid = qs('[data-filter-grid]', section);
      var counter = qs('[data-filter-count]', section);
      if (!grid) {
        return;
      }
      var cards = qsa('.movie-card', grid);

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var query = normalize(input && input.value);
        var year = normalize(yearFilter && yearFilter.value);
        var genre = normalize(genreFilter && genreFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-category')
          ].join(' '));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardGenre = normalize(card.getAttribute('data-genre'));
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !year || cardYear === year;
          var matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
          var shouldShow = matchQuery && matchYear && matchGenre;
          card.classList.toggle('is-hidden-by-filter', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = '当前显示 ' + visible + ' 部，共 ' + cards.length + ' 部';
        }
      }

      [input, yearFilter, genreFilter].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayers() {
    qsa('.js-player-shell').forEach(function (shell) {
      var video = qs('.js-player', shell);
      var button = qs('.js-play-button', shell);
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-video');
      var hlsInstance = null;

      function loadSource() {
        if (!source || video.getAttribute('data-loaded') === 'true') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            maxBufferLength: 30
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        video.setAttribute('data-loaded', 'true');
      }

      button.addEventListener('click', function () {
        loadSource();
        var playPromise = video.play();
        shell.classList.add('is-playing');
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            shell.classList.remove('is-playing');
            video.controls = true;
          });
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('is-playing');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupImageFallbacks();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
