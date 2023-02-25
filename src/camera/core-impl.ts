/**
 * @fileoverview
 * Core camera library implementations.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import {
    Camera,
    CameraCapabilities,
    CameraCapability,
    RangeCameraCapability,
    CameraRenderingOptions,
    RenderedCamera,
    RenderingCallbacks,
    BooleanCameraCapability
} from "./core";

/** Interface for a range value. */
interface RangeValue {
    min: number;
    max: number;
    step: number;
}

/** Abstract camera capability class. */
abstract class AbstractCameraCapability<T> implements CameraCapability<T> {
    protected readonly name: string;
    protected readonly track: MediaStreamTrack;

    constructor(name: string, track: MediaStreamTrack) {
        this.name = name;
        this.track = track;
    }

    public isSupported(): boolean {
        // TODO(minhazav): Figure out fallback for getCapabilities()
        // in firefox.
        // https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Constraints
        if (!this.track.getCapabilities) {
            return false;
        }
        return this.name in this.track.getCapabilities();
    }

    public apply(value: T): Promise<void> {
        let constraint: any = {};
        constraint[this.name] = value;
        let constraints = { advanced: [ constraint ] };
        return this.track.applyConstraints(constraints);
    }

    public value(): T | null {
        let settings: any = this.track.getSettings();
        if (this.name in settings) {
            let settingValue = settings[this.name];
            return settingValue;
        }

        return null;
    }
}

abstract class AbstractRangeCameraCapability extends AbstractCameraCapability<number> {
    constructor(name: string, track: MediaStreamTrack) {
       super(name, track);
    }

    public min(): number {
        return this.getCapabilities().min;
    }

    public max(): number {
        return this.getCapabilities().max;
    }

    public step(): number {
        return this.getCapabilities().step;
    }

    public apply(value: number): Promise<void> {
        let constraint: any = {};
        constraint[this.name] = value;
        let constraints = {advanced: [ constraint ]};
        return this.track.applyConstraints(constraints);
    }

    private getCapabilities(): RangeValue {
        this.failIfNotSupported();
        let capabilities: any = this.track.getCapabilities();
        let capability: any = capabilities[this.name];
        return {
            min: capability.min,
            max: capability.max,
            step: capability.step,
        };
    }

    private failIfNotSupported() {
        if (!this.isSupported()) {
            throw new Error(`${this.name} capability not supported`);
        }
    }
}

/** Zoom feature. */
class ZoomFeatureImpl extends AbstractRangeCameraCapability {
    constructor(track: MediaStreamTrack) {
        super("zoom", track);
    }
}

/** Torch feature. */
class TorchFeatureImpl extends AbstractCameraCapability<boolean> {
    constructor(track: MediaStreamTrack) {
        super("torch", track);
    }
}

/** Implementation of {@link CameraCapabilities}. */
class CameraCapabilitiesImpl implements CameraCapabilities {
    private readonly track: MediaStreamTrack;
    
    constructor(track: MediaStreamTrack) {
        this.track = track;
    }

    zoomFeature(): RangeCameraCapability {
        return new ZoomFeatureImpl(this.track);
    }

    torchFeature(): BooleanCameraCapability {
        return new TorchFeatureImpl(this.track);
    }
}

/** Implementation of {@link RenderedCamera}. */
class RenderedCameraImpl implements RenderedCamera {

    private readonly parentElement: HTMLElement;
    private readonly mediaStream: MediaStream;
    private readonly surface: HTMLVideoElement;
    private readonly callbacks: RenderingCallbacks;

    private isClosed: boolean = false;

    private constructor(
        parentElement: HTMLElement,
        mediaStream: MediaStream,
        callbacks: RenderingCallbacks) {
        this.parentElement = parentElement;
        this.mediaStream = mediaStream;
        this.callbacks = callbacks;

        this.surface = this.createVideoElement(this.parentElement.clientWidth);

        // Setup
        parentElement.append(this.surface);
    }

    private createVideoElement(width: number): HTMLVideoElement {
        const videoElement = document.createElement("video");
        videoElement.style.width = `${width}px`;
        videoElement.style.display = "block";
        videoElement.muted = true;
        videoElement.setAttribute("muted", "true");
        (<any>videoElement).playsInline = true;
        return videoElement;
    }

    private setupSurface() {
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

    static async create(
        parentElement: HTMLElement,
        mediaStream: MediaStream,
        options: CameraRenderingOptions,
        callbacks: RenderingCallbacks)
        : Promise<RenderedCamera> {
        let renderedCamera = new RenderedCameraImpl(
            parentElement, mediaStream, callbacks);
        if (options.aspectRatio) {
            let aspectRatioConstraint = {
                aspectRatio: options.aspectRatio!
            };
            await renderedCamera.getFirstTrackOrFail().applyConstraints(
                aspectRatioConstraint);
        }

       renderedCamera.setupSurface();
        return renderedCamera;
    }

    private failIfClosed() {
        if (this.isClosed) {
            throw "The RenderedCamera has already been closed.";
        }
    }

    private getFirstTrackOrFail(): MediaStreamTrack {
        this.failIfClosed();

        if (this.mediaStream.getVideoTracks().length === 0) {
            throw "No video tracks found";
        }

        return this.mediaStream.getVideoTracks()[0];
    }

    //#region Public APIs.
    public pause(): void {
        this.failIfClosed();
        this.surface.pause();
    }

    public resume(onResumeCallback: () => void): void {
        this.failIfClosed();
        let $this = this;

        const onVideoResume = () => {
            // Transition after 200ms to avoid the previous canvas frame being
            // re-scanned.
            setTimeout(onResumeCallback, 200);
            $this.surface.removeEventListener("playing", onVideoResume);
        };

        this.surface.addEventListener("playing", onVideoResume);
        this.surface.play();
    }

    public isPaused(): boolean {
        this.failIfClosed();
        return this.surface.paused;
    }

    public getSurface(): HTMLVideoElement {
        this.failIfClosed();
        return this.surface;
    }

    public getRunningTrackCapabilities(): MediaTrackCapabilities {
        return this.getFirstTrackOrFail().getCapabilities();
    }

    public getRunningTrackSettings(): MediaTrackSettings {
        return this.getFirstTrackOrFail().getSettings();
    }

    public async applyVideoConstraints(constraints: MediaTrackConstraints)
        : Promise<void> {
        if ("aspectRatio" in constraints) {
            throw "Changing 'aspectRatio' in run-time is not yet supported.";
        }

        return this.getFirstTrackOrFail().applyConstraints(constraints);
    }

    public close(): Promise<void> {
        if (this.isClosed) {
            // Already closed.
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

    getCapabilities(): CameraCapabilities {
        return new CameraCapabilitiesImpl(this.getFirstTrackOrFail());
    }
    //#endregion
}

/** Default implementation of {@link Camera} interface. */
export class CameraImpl implements Camera {
    private readonly mediaStream: MediaStream;

    private constructor(mediaStream: MediaStream) {
        this.mediaStream = mediaStream;
    }

    async render(
        parentElement: HTMLElement,
        options: CameraRenderingOptions,
        callbacks: RenderingCallbacks)
        : Promise<RenderedCamera> {
        return RenderedCameraImpl.create(
            parentElement, this.mediaStream, options, callbacks);
    }

    static async create(videoConstraints: MediaTrackConstraints)
        : Promise<Camera> {
        if (!navigator.mediaDevices) {
            throw "navigator.mediaDevices not supported";
        }
        let constraints: MediaStreamConstraints = {
            audio: false,
            video: videoConstraints
        };

        let mediaStream = await navigator.mediaDevices.getUserMedia(
            constraints);
        return new CameraImpl(mediaStream);
    }
}
