(function () {
  function initMoviePlayer(options) {
    var video = document.querySelector(options.video);
    var overlay = document.querySelector(options.overlay);
    var button = document.querySelector(options.button);
    var source = options.source;
    var prepared = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (!prepared) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
