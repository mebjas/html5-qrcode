/**
 * @fileoverview
 * Core camera library implementations.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import {
    Camera,
    CameraRenderingOptions,
    RenderedCamera,
    RenderingCallbacks
} from "./core";

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

        this.surface.addEventListener("playing", () => this.onVideoStart());
        this.surface.srcObject = this.mediaStream;
        this.surface.play();
    }

    private onVideoStart() {
        const videoWidth = this.surface.clientWidth;
        const videoHeight = this.surface.clientHeight;
        this.callbacks.onRenderSurfaceReady(videoWidth, videoHeight);
        this.surface.removeEventListener("playing", this.onVideoStart);
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
