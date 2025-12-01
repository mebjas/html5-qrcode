export interface CameraDevice {
    id: string;
    label: string;
}
export interface CameraCapability<T> {
    isSupported(): boolean;
    apply(value: T): Promise<void>;
    value(): T | null;
}
export interface RangeCameraCapability extends CameraCapability<number> {
    min(): number;
    max(): number;
    step(): number;
}
export interface BooleanCameraCapability extends CameraCapability<boolean> {
}
export interface CameraCapabilities {
    zoomFeature(): RangeCameraCapability;
    torchFeature(): BooleanCameraCapability;
}
export type OnRenderSurfaceReady = (viewfinderWidth: number, viewfinderHeight: number) => void;
export interface RenderingCallbacks {
    onRenderSurfaceReady: OnRenderSurfaceReady;
}
export interface RenderedCamera {
    getSurface(): HTMLVideoElement;
    pause(): void;
    resume(onResumeCallback: () => void): void;
    isPaused(): boolean;
    close(): Promise<void>;
    getRunningTrackCapabilities(): MediaTrackCapabilities;
    getRunningTrackSettings(): MediaTrackSettings;
    applyVideoConstraints(constraints: MediaTrackConstraints): Promise<void>;
    getCapabilities(): CameraCapabilities;
}
export interface CameraRenderingOptions {
    aspectRatio?: number;
}
export interface Camera {
    render(parentElement: HTMLElement, options: CameraRenderingOptions, callbacks: RenderingCallbacks): Promise<RenderedCamera>;
}
