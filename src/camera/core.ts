/**
 * @module
 * Core Camera interfaces. 
 * 
 * @author mebjas <minhazav@gmail.com>
 */

/** Camera device interface. */
export interface CameraDevice {
  id: string;
  label: string;
}

//#region Features
/** Generic capability of camera. */
export interface CameraCapability<T> {
  /** Returns {@code true} if the capability is supported by the camera. */
  isSupported(): boolean;

  /** Apply the {@code value} to camera for this capability. */
  apply(value: T): Promise<void>;

  /** Returns current value of this capability. */
  value(): T | null;
}

/** Capability of the camera that has range. */
export interface RangeCameraCapability extends CameraCapability<number> {  
  /** Min value allowed for this capability. */
  min(): number;

  /** Max value allowed for this capability. */
  max(): number;

  /** Steps allowed for this capability. */
  step(): number;
}

/** Capability of camera that is boolean in nature. */
export interface BooleanCameraCapability extends CameraCapability<boolean> {}  

/** Class exposing different capabilities of camera. */
export interface CameraCapabilities {

  /** Zoom capability of the camera. */
  zoomFeature(): RangeCameraCapability;

  /** Torch capability of the camera. */
  torchFeature(): BooleanCameraCapability;
}

//#endregion

/** Type for callback called when camera surface is ready. */
export type OnRenderSurfaceReady
  = (viewfinderWidth: number, viewfinderHeight: number) => void;

/** Callbacks around camera rendering. */
export interface RenderingCallbacks {
  onRenderSurfaceReady: OnRenderSurfaceReady;
}

/**
 * Interface for a rendered camera that is actively showing feed on a surface.
 */
export interface RenderedCamera {
  /**
   * Returns the video surface.
   * 
   * @throws error if method is called when scanner is not in scanning state.
   */
  getSurface(): HTMLVideoElement;
  
  /**
   * Pauses the camera feed.
   * 
   * @throws error if method is called when scanner is not in scanning state.
   */
  pause(): void;

  /**
   * Resumes the camera feed, if it's in paused state.
   * 
   * @param onResumeCallback callback that is called when camera resumes.
   * 
   * @throws error if {@link RenderedCamera} instance is already closed.
   */
  resume(onResumeCallback: () => void): void;

  /**
   * Returns {@code true} if the instance is paused.
   * 
   * @throws error if {@link RenderedCamera} instance is already closed.
   */
  isPaused(): boolean;

  /**
   * Closes the instance.
   * 
   * <p> The instance cannot be used after closing.
   */
  close(): Promise<void>;

  // ---------------------------------------------------------------------------
  // Direct Camera Access APIs.
  //
  // The APIs below are in flavour similar to what Javascript exposes.
  // ---------------------------------------------------------------------------

  /**
   * Returns the capabilities of the running camera stream.
   * 
   * Read more: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getConstraints
   * 
   * @returns the capabilities of a running video track.
   * @throws error if {@link RenderedCamera} instance is already closed.
   */
  getRunningTrackCapabilities(): MediaTrackCapabilities;

  /**
   * Returns the object containing the current values of each constrainable
   * property of the running video track.
   * 
   * Read more: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getSettings
   * 
   * @returns the supported settings of the running video track.
   * @throws error if {@link RenderedCamera} instance is already closed.
   */
  getRunningTrackSettings(): MediaTrackSettings;

  /**
   * Apply a video constraints on running video track from camera.
   *
   * Important: Changing aspectRatio while scanner is running is not supported
   * with this API.
   *
   * @param {MediaTrackConstraints} specifies a variety of video or camera
   *  controls as defined in
   *  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
   * @returns a Promise which succeeds if the passed constraints are applied,
   *  fails otherwise.
   * @throws error if {@link RenderedCamera} instance is already closed.
   */
  applyVideoConstraints(constraints: MediaTrackConstraints): Promise<void>;

  /**
   * Returns all capabilities of the camera.
   */
  getCapabilities(): CameraCapabilities;
}

/** Options for rendering camera feed. */
export interface CameraRenderingOptions {
  /**
   * Aspect ratio to setup the surface with.
   * 
   * <p> Setting this value doesn't guarantee the exact value to be applied.
   */
  aspectRatio?: number;
}

/** Interface for the camera. */
export interface Camera {

  /**
   * Renders camera to {@link HTMLVideoElement} as a child of
   * {@code parentElement}.
   * 
   * @params parentElement Parent HtmlElement to render camera feed into
   * @params options rendering options
   * @params callbacks callbacks associated with rendering
   * 
   * @returns the {@link RenderedCamera} instance.
   */
  render(
    parentElement: HTMLElement,
    options: CameraRenderingOptions,
    callbacks: RenderingCallbacks)
    : Promise<RenderedCamera>;
}
