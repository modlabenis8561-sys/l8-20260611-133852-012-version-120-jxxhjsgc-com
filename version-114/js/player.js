(function () {
  function startMoviePlayer(sourceUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('movie-play-overlay');
    var initialized = false;
    var hlsInstance = null;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    }

    function playVideo() {
      attachSource();
      overlay.classList.add('is-hidden');
      video.controls = true;

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
      if (!initialized) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.startMoviePlayer = startMoviePlayer;
})();
