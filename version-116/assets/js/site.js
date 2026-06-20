(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      const open = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === slideIndex);
    });

    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === slideIndex);
    });
  }

  dots.forEach(function (dot, itemIndex) {
    dot.addEventListener('click', function () {
      showSlide(itemIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5600);
  }

  const localInputs = Array.from(document.querySelectorAll('.local-filter'));

  localInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      const scope = input.closest('section') || document;
      const grid = scope.querySelector('.local-filter-grid') || document.querySelector('.local-filter-grid');

      if (!grid) {
        return;
      }

      const keyword = input.value.trim().toLowerCase();
      const cards = Array.from(grid.querySelectorAll('.movie-card, .ranking-row'));

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();

        card.classList.toggle('is-hidden', Boolean(keyword) && !haystack.includes(keyword));
      });
    });
  });

  const searchInputs = Array.from(document.querySelectorAll('.site-search-input'));

  function renderResults(input) {
    const box = input.parentElement.querySelector('.site-search-results');

    if (!box) {
      return;
    }

    const keyword = input.value.trim().toLowerCase();

    if (!keyword || !Array.isArray(window.SEARCH_MOVIES)) {
      box.classList.remove('is-open');
      box.innerHTML = '';
      return;
    }

    const results = window.SEARCH_MOVIES.filter(function (item) {
      return [item.title, item.genre, item.year, item.region, item.type, item.tags].join(' ').toLowerCase().includes(keyword);
    }).slice(0, 12);

    box.innerHTML = results.map(function (item) {
      return '<a class="search-result-item" href="' + item.file + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></span>' +
        '</a>';
    }).join('');

    box.classList.toggle('is-open', results.length > 0);
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      renderResults(input);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        const first = input.parentElement.querySelector('.search-result-item');
        if (first) {
          window.location.href = first.getAttribute('href');
        }
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.site-search')) {
      document.querySelectorAll('.site-search-results').forEach(function (box) {
        box.classList.remove('is-open');
      });
    }
  });
})();

function initMoviePlayer(streamUrl) {
  const video = document.getElementById('movieVideo');
  const cover = document.getElementById('playCover');

  if (!video || !cover || !streamUrl) {
    return;
  }

  let ready = false;
  let hlsInstance = null;

  function attachStream() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    attachStream();
    cover.classList.add('is-hidden');
    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  cover.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!ready) {
      startPlayback();
    }
  });
  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
