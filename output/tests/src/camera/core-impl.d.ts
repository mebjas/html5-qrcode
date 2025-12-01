import { Camera, CameraRenderingOptions, RenderedCamera, RenderingCallbacks } from "./core";
export declare class CameraImpl implements Camera {
    private readonly mediaStream;
    private constructor();
    render(parentElement: HTMLElement, options: CameraRenderingOptions, callbacks: RenderingCallbacks): Promise<RenderedCamera>;
    static create(videoConstraints: MediaTrackConstraints): Promise<Camera>;
}
