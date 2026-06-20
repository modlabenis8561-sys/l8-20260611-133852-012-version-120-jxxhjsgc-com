(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var active = 0;
    var timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  function cardMatches(card, query, filter) {
    var title = card.getAttribute('data-title') || '';
    var meta = card.getAttribute('data-meta') || '';
    var combined = (title + ' ' + meta).toLowerCase();
    var normalizedQuery = query.trim().toLowerCase();
    var normalizedFilter = filter.trim().toLowerCase();
    var queryMatch = !normalizedQuery || combined.indexOf(normalizedQuery) !== -1;
    var filterMatch = normalizedFilter === 'all' || !normalizedFilter || combined.indexOf(normalizedFilter) !== -1;

    return queryMatch && filterMatch;
  }

  function setupCardSearch() {
    var input = document.querySelector('[data-search-input]');
    var container = document.querySelector('[data-card-container]');

    if (!input || !container) {
      return;
    }

    var cards = selectAll('.movie-card', container);
    var counter = document.querySelector('[data-result-counter]');
    var chips = selectAll('[data-filter-value]');
    var activeFilter = 'all';

    function applySearch() {
      var visibleCount = 0;

      cards.forEach(function (card) {
        var visible = cardMatches(card, input.value, activeFilter);
        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      if (counter) {
        counter.textContent = '当前显示 ' + visibleCount + ' 部 / 共 ' + cards.length + ' 部';
      }
    }

    input.addEventListener('input', applySearch);

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });

        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter-value') || 'all';
        applySearch();
      });
    });

    applySearch();
  }

  function setupSitemapSearch() {
    var input = document.querySelector('[data-list-search]');
    var list = document.querySelector('[data-sitemap-list]');
    var counter = document.querySelector('[data-list-counter]');

    if (!input || !list) {
      return;
    }

    var items = selectAll('li', list);

    function applySearch() {
      var query = input.value.trim().toLowerCase();
      var visibleCount = 0;

      items.forEach(function (item) {
        var text = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '')).toLowerCase();
        var visible = !query || text.indexOf(query) !== -1;
        item.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      if (counter) {
        counter.textContent = '当前显示 ' + visibleCount + ' 部 / 共 ' + items.length + ' 部';
      }
    }

    input.addEventListener('input', applySearch);
    applySearch();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupCardSearch();
    setupSitemapSearch();
  });
})();
