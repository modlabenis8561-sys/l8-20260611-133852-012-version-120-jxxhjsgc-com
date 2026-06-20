(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileNavigation() {
    var button = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    document.querySelectorAll('.header-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (!query) {
          return;
        }
        event.preventDefault();
        window.location.href = './library.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (slides.length < 2) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var previous = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = Number(dot.getAttribute('data-slide')) || 0;
        show(target);
        start();
      });
    });
    start();
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!cards.length) {
      return;
    }
    var input = document.querySelector('.filter-input');
    var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var parameters = new URLSearchParams(window.location.search);
    var query = parameters.get('q');

    if (input && query) {
      input.value = query;
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var category = '';
      var year = '';

      selects.forEach(function (select) {
        if (select.getAttribute('data-filter') === 'category') {
          category = select.value;
        }
        if (select.getAttribute('data-filter') === 'year') {
          year = select.value;
        }
      });

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardCategory = card.getAttribute('data-category') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var categoryMatch = !category || cardCategory === category;
        var yearMatch = !year || cardYear === year;
        card.hidden = !(keywordMatch && categoryMatch && yearMatch);
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }

  ready(function () {
    setupMobileNavigation();
    setupHeaderSearch();
    setupHeroCarousel();
    setupFilters();
  });
})();
