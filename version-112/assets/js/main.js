(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initCardFilter() {
    var input = document.querySelector("[data-card-filter]");
    var list = document.querySelector("[data-card-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.classList.toggle("is-filtered-out", keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function initSearchPage() {
    var resultBox = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var input = document.querySelector("[data-search-input]");
    if (!resultBox || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      var hay = [movie.title, movie.genre, movie.category, movie.region, movie.year, movie.tags, movie.oneLine].join(" ").toLowerCase();
      return terms.every(function (term) {
        return hay.indexOf(term) !== -1;
      });
    }).slice(0, 80);
    if (title) {
      title.textContent = "“" + query + "”相关影片";
    }
    if (!matched.length) {
      resultBox.innerHTML = '<div class="empty-state"><h2>未找到相关影片</h2><p>可以更换关键词，或通过分类频道继续浏览。</p></div>';
      return;
    }
    resultBox.innerHTML = matched.map(function (movie) {
      return '<a class="movie-card" href="' + movie.url + '">' +
        '<span class="poster-wrap"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'"><span class="poster-shade"></span><span class="poster-badge">' + escapeHtml(movie.category) + '</span></span>' +
        '<span class="card-body"><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.oneLine) + '</span><em>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</em></span>' +
      '</a>';
    }).join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var src = player.getAttribute("data-src");
      var started = false;
      function bind() {
        if (!video || !src || started) {
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }
      function play() {
        bind();
        if (button) {
          button.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
        });
        video.addEventListener("pause", function () {
          if (button && video.currentTime < 0.1) {
            button.classList.remove("is-hidden");
          }
        });
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initCardFilter();
    initSearchPage();
    initPlayers();
  });
})();
