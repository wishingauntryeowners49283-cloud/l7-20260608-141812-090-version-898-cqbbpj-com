import { H as Hls } from "./hls-vendor-dru42stk.js";

export function initMoviePlayer(options) {
    const video = document.querySelector(options.selector);
    const trigger = document.querySelector(options.trigger);
    const stream = options.stream;
    if (!video || !trigger || !stream) {
        return;
    }

    let hls = null;
    let loading = null;

    const reveal = () => {
        trigger.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
    };

    const restore = () => {
        trigger.classList.remove("is-hidden");
    };

    const prepare = () => {
        if (loading) {
            return loading;
        }
        loading = new Promise((resolve) => {
            const done = () => resolve();
            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, done);
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else {
                        restore();
                    }
                });
                window.setTimeout(done, 1400);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.addEventListener("loadedmetadata", done, { once: true });
                window.setTimeout(done, 900);
            } else {
                video.src = stream;
                window.setTimeout(done, 900);
            }
        });
        return loading;
    };

    const play = async () => {
        reveal();
        await prepare();
        try {
            await video.play();
        } catch (error) {
            restore();
        }
    };

    trigger.addEventListener("click", play);
    video.addEventListener("click", () => {
        if (video.paused) {
            play();
        }
    });
    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
        }
    });
}
