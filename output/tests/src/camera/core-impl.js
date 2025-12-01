"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraImpl = void 0;
class AbstractCameraCapability {
    constructor(name, track) {
        this.name = name;
        this.track = track;
    }
    isSupported() {
        if (!this.track.getCapabilities) {
            return false;
        }
        return this.name in this.track.getCapabilities();
    }
    apply(value) {
        let constraint = {};
        constraint[this.name] = value;
        let constraints = { advanced: [constraint] };
        return this.track.applyConstraints(constraints);
    }
    value() {
        let settings = this.track.getSettings();
        if (this.name in settings) {
            let settingValue = settings[this.name];
            return settingValue;
        }
        return null;
    }
}
class AbstractRangeCameraCapability extends AbstractCameraCapability {
    constructor(name, track) {
        super(name, track);
    }
    min() {
        return this.getCapabilities().min;
    }
    max() {
        return this.getCapabilities().max;
    }
    step() {
        return this.getCapabilities().step;
    }
    apply(value) {
        let constraint = {};
        constraint[this.name] = value;
        let constraints = { advanced: [constraint] };
        return this.track.applyConstraints(constraints);
    }
    getCapabilities() {
        this.failIfNotSupported();
        let capabilities = this.track.getCapabilities();
        let capability = capabilities[this.name];
        return {
            min: capability.min,
            max: capability.max,
            step: capability.step,
        };
    }
    failIfNotSupported() {
        if (!this.isSupported()) {
            throw new Error(`${this.name} capability not supported`);
        }
    }
}
class ZoomFeatureImpl extends AbstractRangeCameraCapability {
    constructor(track) {
        super("zoom", track);
    }
}
class TorchFeatureImpl extends AbstractCameraCapability {
    constructor(track) {
        super("torch", track);
    }
}
class CameraCapabilitiesImpl {
    constructor(track) {
        this.track = track;
    }
    zoomFeature() {
        return new ZoomFeatureImpl(this.track);
    }
    torchFeature() {
        return new TorchFeatureImpl(this.track);
    }
}
class RenderedCameraImpl {
    constructor(parentElement, mediaStream, callbacks) {
        this.isClosed = false;
        this.parentElement = parentElement;
        this.mediaStream = mediaStream;
        this.callbacks = callbacks;
        this.surface = this.createVideoElement(this.parentElement.clientWidth);
        parentElement.append(this.surface);
    }
    createVideoElement(width) {
        const videoElement = document.createElement("video");
        videoElement.style.width = `${width}px`;
        videoElement.style.display = "block";
        videoElement.muted = true;
        videoElement.setAttribute("muted", "true");
        videoElement.playsInline = true;
        return videoElement;
    }
    setupSurface() {
        this.surface.onabort = () => {
            throw "RenderedCameraImpl video surface onabort() called";
        };
        this.surface.onerror = () => {
            throw "RenderedCameraImpl video surface onerror() called";
        };
        let onVideoStart = () => {
            const videoWidth = this.surface.clientWidth;
            const videoHeight = this.surface.clientHeight;
            this.callbacks.onRenderSurfaceReady(videoWidth, videoHeight);
            this.surface.removeEventListener("playing", onVideoStart);
        };
        this.surface.addEventListener("playing", onVideoStart);
        this.surface.srcObject = this.mediaStream;
        this.surface.play();
    }
    static create(parentElement, mediaStream, options, callbacks) {
        return __awaiter(this, void 0, void 0, function* () {
            let renderedCamera = new RenderedCameraImpl(parentElement, mediaStream, callbacks);
            if (options.aspectRatio) {
                let aspectRatioConstraint = {
                    aspectRatio: options.aspectRatio
                };
                yield renderedCamera.getFirstTrackOrFail().applyConstraints(aspectRatioConstraint);
            }
            renderedCamera.setupSurface();
            return renderedCamera;
        });
    }
    failIfClosed() {
        if (this.isClosed) {
            throw "The RenderedCamera has already been closed.";
        }
    }
    getFirstTrackOrFail() {
        this.failIfClosed();
        if (this.mediaStream.getVideoTracks().length === 0) {
            throw "No video tracks found";
        }
        return this.mediaStream.getVideoTracks()[0];
    }
    pause() {
        this.failIfClosed();
        this.surface.pause();
    }
    resume(onResumeCallback) {
        this.failIfClosed();
        let $this = this;
        const onVideoResume = () => {
            setTimeout(onResumeCallback, 200);
            $this.surface.removeEventListener("playing", onVideoResume);
        };
        this.surface.addEventListener("playing", onVideoResume);
        this.surface.play();
    }
    isPaused() {
        this.failIfClosed();
        return this.surface.paused;
    }
    getSurface() {
        this.failIfClosed();
        return this.surface;
    }
    getRunningTrackCapabilities() {
        return this.getFirstTrackOrFail().getCapabilities();
    }
    getRunningTrackSettings() {
        return this.getFirstTrackOrFail().getSettings();
    }
    applyVideoConstraints(constraints) {
        return __awaiter(this, void 0, void 0, function* () {
            if ("aspectRatio" in constraints) {
                throw "Changing 'aspectRatio' in run-time is not yet supported.";
            }
            return this.getFirstTrackOrFail().applyConstraints(constraints);
        });
    }
    close() {
        if (this.isClosed) {
            return Promise.resolve();
        }
        let $this = this;
        return new Promise((resolve, _) => {
            let tracks = $this.mediaStream.getVideoTracks();
            const tracksToClose = tracks.length;
            var tracksClosed = 0;
            $this.mediaStream.getVideoTracks().forEach((videoTrack) => {
                $this.mediaStream.removeTrack(videoTrack);
                videoTrack.stop();
                ++tracksClosed;
                if (tracksClosed >= tracksToClose) {
                    $this.isClosed = true;
                    $this.parentElement.removeChild($this.surface);
                    resolve();
                }
            });
        });
    }
    getCapabilities() {
        return new CameraCapabilitiesImpl(this.getFirstTrackOrFail());
    }
}
class CameraImpl {
    constructor(mediaStream) {
        this.mediaStream = mediaStream;
    }
    render(parentElement, options, callbacks) {
        return __awaiter(this, void 0, void 0, function* () {
            return RenderedCameraImpl.create(parentElement, this.mediaStream, options, callbacks);
        });
    }
    static create(videoConstraints) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!navigator.mediaDevices) {
                throw "navigator.mediaDevices not supported";
            }
            let constraints = {
                audio: false,
                video: videoConstraints
            };
            let mediaStream = yield navigator.mediaDevices.getUserMedia(constraints);
            return new CameraImpl(mediaStream);
        });
    }
}
exports.CameraImpl = CameraImpl;
//# sourceMappingURL=core-impl.js.map