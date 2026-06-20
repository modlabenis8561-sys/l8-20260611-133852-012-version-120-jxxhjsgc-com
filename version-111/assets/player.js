var hlsModulePromise = null;

function getHlsClass() {
    if (!hlsModulePromise) {
        hlsModulePromise = import('./hls-vendor-dru42stk.js')
            .then(function (module) {
                return module.H || null;
            })
            .catch(function () {
                return null;
            });
    }

    return hlsModulePromise;
}

function waitForMetadata(video) {
    return new Promise(function (resolve) {
        var finished = false;

        function done() {
            if (!finished) {
                finished = true;
                resolve();
            }
        }

        video.addEventListener('loadedmetadata', done, { once: true });
        window.setTimeout(done, 1200);
    });
}

async function prepareVideo(video, source) {
    if (video.dataset.ready === '1') {
        return;
    }

    var nativeHls = video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');

    if (nativeHls) {
        video.src = source;
        video.dataset.ready = '1';
        await waitForMetadata(video);
        return;
    }

    var HlsClass = await getHlsClass();

    if (HlsClass && HlsClass.isSupported()) {
        var hls = new HlsClass({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.dataset.ready = '1';
        video._hls = hls;
        await waitForMetadata(video);
        return;
    }

    video.src = source;
    video.dataset.ready = '1';
    await waitForMetadata(video);
}

function bindPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('[data-play-button]');
    var source = wrapper.dataset.stream;

    if (!video || !button || !source) {
        return;
    }

    async function startPlayback() {
        wrapper.classList.add('is-loading');
        await prepareVideo(video, source);
        wrapper.classList.remove('is-loading');

        try {
            await video.play();
            wrapper.classList.add('is-playing');
        } catch (error) {
            wrapper.classList.remove('is-playing');
        }
    }

    button.addEventListener('click', startPlayback);

    video.addEventListener('play', function () {
        wrapper.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
        if (!video.currentTime) {
            wrapper.classList.remove('is-playing');
        }
    });
}

Array.prototype.slice.call(document.querySelectorAll('[data-video-player]')).forEach(bindPlayer);
