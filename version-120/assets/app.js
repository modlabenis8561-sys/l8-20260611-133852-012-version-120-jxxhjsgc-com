(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
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

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initPageFilters() {
    var input = document.querySelector(".page-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!input || !cards.length) {
      return;
    }
    var region = document.querySelector(".filter-region");
    var type = document.querySelector(".filter-type");

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var cardRegion = card.getAttribute("data-region") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!regionValue || regionValue === cardRegion) && (!typeValue || typeValue === cardType);
        card.style.display = matched ? "" : "none";
      });
    }

    input.addEventListener("input", apply);
    if (region) {
      region.addEventListener("change", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }
    apply();
  }

  function createMovieCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a class="movie-thumb" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="movie-badge">' + escapeHtml(movie.collection) + "</span>",
      "</a>",
      '<div class="movie-card-body">',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      '<div class="movie-meta"><span>' + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
      "</div>"
    ].join("");
    return article;
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

  function uniqueSorted(items, key) {
    var seen = Object.create(null);
    items.forEach(function (item) {
      var value = item[key];
      if (value) {
        seen[value] = true;
      }
    });
    return Object.keys(seen).sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initSearchPage() {
    var list = window.MovieSearchIndex || [];
    var results = document.getElementById("searchResults");
    var input = document.getElementById("siteSearchInput");
    if (!results || !input || !list.length) {
      return;
    }
    var region = document.getElementById("searchRegion");
    var type = document.getElementById("searchType");
    var year = document.getElementById("searchYear");
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";
    fillSelect(region, uniqueSorted(list, "region"));
    fillSelect(type, uniqueSorted(list, "type"));
    fillSelect(year, uniqueSorted(list, "year"));

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var rv = region ? region.value : "";
      var tv = type ? type.value : "";
      var yv = year ? year.value : "";
      var matched = list.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.collection, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return (!keyword || text.indexOf(keyword) !== -1) && (!rv || movie.region === rv) && (!tv || movie.type === tv) && (!yv || movie.year === yv);
      }).slice(0, 200);
      results.innerHTML = "";
      matched.forEach(function (movie) {
        results.appendChild(createMovieCard(movie));
      });
    }

    input.addEventListener("input", render);
    if (region) {
      region.addEventListener("change", render);
    }
    if (type) {
      type.addEventListener("change", render);
    }
    if (year) {
      year.addEventListener("change", render);
    }
    render();
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var trigger = document.querySelector("[data-play-trigger]");
    if (!video || !source) {
      return;
    }
    var loaded = false;
    var hls = null;

    function loadSource() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function startPlayback() {
      loadSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", startPlayback);
    }
    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("loadedmetadata", function () {
      video.controls = true;
    });
  };

  ready(function () {
    initMobileMenu();
    initHero();
    initPageFilters();
    initSearchPage();
  });
})();
