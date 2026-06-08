import { H as Hls } from './hls-player.js';

(function () {
  var instances = new WeakMap();

  function attachStream(video, stream) {
    if (!video || !stream || instances.has(video)) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.load();
      instances.set(video, true);
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      instances.set(video, hls);
      return;
    }

    video.src = stream;
    video.load();
    instances.set(video, true);
  }

  function playVideo(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.play-overlay');

    if (!video) {
      return;
    }

    attachStream(video, video.getAttribute('data-stream'));

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.play-overlay');

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo(box);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!instances.has(video)) {
          playVideo(box);
        }
      });

      video.addEventListener('play', function () {
        attachStream(video, video.getAttribute('data-stream'));
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }
  });
})();
