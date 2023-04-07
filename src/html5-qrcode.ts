/**
 * @module
 * HTML5 QR code & barcode scanning library.
 * - Decode QR Code.
 * - Decode different kinds of barcodes.
 * - Decode using web cam, smart phone camera or using images on local file
 *   system.
 *
 * @author mebjas <minhazav@gmail.com>
 *
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {
    QrcodeErrorCallback,
    QrcodeSuccessCallback,
    Logger,
    BaseLoggger,
    Html5QrcodeResultFactory,
    Html5QrcodeErrorFactory,
    Html5QrcodeSupportedFormats,
    RobustQrcodeDecoderAsync,
    isValidHtml5QrcodeSupportedFormats,
    Html5QrcodeConstants,
    Html5QrcodeResult,
    isNullOrUndefined,
    QrDimensions,
    QrDimensionFunction
} from "./core";
import { Html5QrcodeStrings } from "./strings";
import { VideoConstraintsUtil } from "./utils";
import { Html5QrcodeShim } from "./code-decoder";
import { CameraFactory } from "./camera/factories";
import {
    CameraDevice,
    CameraCapabilities,
    CameraRenderingOptions,
    RenderedCamera,
    RenderingCallbacks
} from "./camera/core";
import { CameraRetriever } from "./camera/retriever";
import { ExperimentalFeaturesConfig } from "./experimental-features";
import {
    StateManagerProxy,
    StateManagerFactory,
    StateManagerTransaction,
    Html5QrcodeScannerState
} from "./state-manager";

class Constants extends Html5QrcodeConstants {
    //#region static constants
    static DEFAULT_WIDTH = 300;
    static DEFAULT_WIDTH_OFFSET = 2;
    static FILE_SCAN_MIN_HEIGHT = 300;
    static FILE_SCAN_HIDDEN_CANVAS_PADDING = 100;
    static MIN_QR_BOX_SIZE = 50;
    static SHADED_LEFT = 1;
    static SHADED_RIGHT = 2;
    static SHADED_TOP = 3;
    static SHADED_BOTTOM = 4;
    static SHADED_REGION_ELEMENT_ID = "qr-shaded-region";
    static VERBOSE = false;
    static BORDER_SHADER_DEFAULT_COLOR = "#ffffff";
    static BORDER_SHADER_MATCH_COLOR = "rgb(90, 193, 56)";
    //#endregion
}

/**
 * Interface for configuring {@link Html5Qrcode} class instance.
 */
export interface Html5QrcodeConfigs {
    /**
     * Array of formats to support of type {@link Html5QrcodeSupportedFormats}.
     * 
     * All invalid values would be ignored. If null or underfined all supported
     * formats will be used for scanning. Unless you want to limit the scan to
     * only certain formats or want to improve performance, you should not set
     * this value.
     */
    formatsToSupport?: Array<Html5QrcodeSupportedFormats> | undefined;

    /**
     * {@link BarcodeDetector} is being implemented by browsers at the moment.
     * It has very limited browser support but as it gets available it could
     * enable faster native code scanning experience.
     * 
     * Set this flag to true, to enable using {@link BarcodeDetector} if
     * supported. This is true by default.
     * 
     * Documentations:
     *  - https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector
     *  - https://web.dev/shape-detection/#barcodedetector
     */
    useBarCodeDetectorIfSupported?: boolean | undefined;

    /**
     * Config for experimental features.
     * 
     * Everything is false by default.
     */
    experimentalFeatures?: ExperimentalFeaturesConfig | undefined;
}

/**
 * Interface for full configuration of {@link Html5Qrcode}.
 * 
 * Notes: Ideally we don't need to have two interfaces for this purpose, but
 * since the public APIs before version 2.0.8 allowed passing a boolean verbose
 * flag to constructor we need to allow users to pass Html5QrcodeFullConfig or
 * boolean flag to be backward compatible.
 * In future versions these two interfaces can be merged.
 */
export interface Html5QrcodeFullConfig extends Html5QrcodeConfigs {
    /**
     * If true, all logs would be printed to console. False by default.
     */
    verbose: boolean | undefined;
}

/**
 * Configuration type for scanning QR code with camera.
 */
export interface Html5QrcodeCameraScanConfig {
    /**
     * Optional, Expected framerate of qr code scanning. example `{ fps: 2 }` means the
     * scanning would be done every `500 ms`.
     */
    fps: number | undefined;

    /**
     * Optional, edge size, dimension or calculator function for QR scanning
     * box, the value or computed value should be smaller than the width and
     * height of the full region.
     * 
     * This would make the scanner look like this:
     *          ----------------------
     *          |********************|
     *          |******,,,,,,,,,*****|      <--- shaded region
     *          |******|       |*****|      <--- non shaded region would be
     *          |******|       |*****|          used for QR code scanning.
     *          |******|_______|*****|
     *          |********************|
     *          |********************|
     *          ----------------------
     * 
     * Instance of {@link QrDimensions} can be passed to construct a non
     * square rendering of scanner box. You can also pass in a function of type
     * {@link QrDimensionFunction} that takes in the width and height of the
     * video stream and return QR box size of type {@link QrDimensions}.
     * 
     * If this value is not set, no shaded QR box will be rendered and the
     * scanner will scan the entire area of video stream.
     */
    qrbox?: number | QrDimensions | QrDimensionFunction | undefined;

    /**
     * Optional, Desired aspect ratio for the video feed. Ideal aspect ratios
     * are 4:3 or 16:9. Passing very wrong aspect ratio could lead to video feed
     * not showing up.
     */
    aspectRatio?: number | undefined;

    /**
     * Optional, if `true` flipped QR Code won't be scanned. Only use this
     * if you are sure the camera cannot give mirrored feed if you are facing
     * performance constraints.
     */
    disableFlip?: boolean | undefined;

    /**
     * Optional, @beta(this config is not well supported yet).
     *
     * Important: When passed this will override other parameters like
     * 'cameraIdOrConfig' or configurations like 'aspectRatio'.
     * 'videoConstraints' should be of type {@link MediaTrackConstraints} as
     * defined in
     * https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * and is used to specify a variety of video or camera controls like:
     * aspectRatio, facingMode, frameRate, etc.
     */
    videoConstraints?: MediaTrackConstraints | undefined;
}

/**
 * Internal implementation of {@link Html5QrcodeConfig} with util & factory
 * methods.
 * 
 * @hidden
 */
class InternalHtml5QrcodeConfig implements Html5QrcodeCameraScanConfig {

    public readonly fps: number;
    public readonly disableFlip: boolean;
    public readonly qrbox: number | QrDimensions | QrDimensionFunction | undefined;
    public readonly aspectRatio: number | undefined;
    public readonly videoConstraints: MediaTrackConstraints | undefined;

    private logger: Logger;

    private constructor(
        config: Html5QrcodeCameraScanConfig | undefined,
        logger: Logger) {
        this.logger = logger;

        this.fps = Constants.SCAN_DEFAULT_FPS;
        if (!config) {
            this.disableFlip = Constants.DEFAULT_DISABLE_FLIP;
        } else {
            if (config.fps) {
                this.fps = config.fps;
            }
            this.disableFlip = config.disableFlip === true;
            this.qrbox = config.qrbox;
            this.aspectRatio = config.aspectRatio;
            this.videoConstraints = config.videoConstraints;
        }
    }

    public isMediaStreamConstraintsValid(): boolean {
        if (!this.videoConstraints) {
            this.logger.logError(
                "Empty videoConstraints", /* experimental= */ true);
            return false;
        }

        return VideoConstraintsUtil.isMediaStreamConstraintsValid(
            this.videoConstraints, this.logger);
    }

    public isShadedBoxEnabled(): boolean {
        return !isNullOrUndefined(this.qrbox);
    }

    /**
     * Create instance of {@link Html5QrcodeCameraScanConfig}.
     * 
     * Create configuration by merging default and input settings.
     */
    static create(config: Html5QrcodeCameraScanConfig | undefined, logger: Logger)
        : InternalHtml5QrcodeConfig {
        return new InternalHtml5QrcodeConfig(config, logger);
    }
}

/** @hidden */
interface QrcodeRegionBounds {
    x: number,
    y: number,
    width: number,
    height: number
}

/**
 * Low level APIs for building web based QR and Barcode Scanner.
 * 
 * Supports APIs for camera as well as file based scanning.
 * 
 * Depending of the configuration, the class will help render code
 * scanning UI on the provided parent HTML container.
 */
export class Html5Qrcode {

    //#region Private fields.
    private readonly logger: Logger;
    private readonly elementId: string;
    private readonly verbose: boolean;
    private readonly qrcode: RobustQrcodeDecoderAsync;

    private shouldScan: boolean;

    // Nullable elements
    // TODO(mebjas): Reduce the state-fulness of this mammoth class, by splitting
    // into independent classes for better separation of concerns and reducing
    // error prone nature of a large stateful class.
    private element: HTMLElement | null = null;
    private canvasElement: HTMLCanvasElement | null = null;
    private scannerPausedUiElement: HTMLDivElement | null = null;
    private hasBorderShaders: boolean | null = null;
    private borderShaders: Array<HTMLElement> | null = null;
    private qrMatch: boolean | null = null;
    private renderedCamera: RenderedCamera | null = null;

    private foreverScanTimeout: any;
    private qrRegion: QrcodeRegionBounds | null = null;
    private context: CanvasRenderingContext2D | null = null;
    private lastScanImageFile: string | null = null;
    //#endregion

    private stateManagerProxy: StateManagerProxy;

    // TODO(mebjas): deprecate this.
    /** @hidden */
    public isScanning: boolean = false;

    /**
     * Initialize the code scanner.
     *
     * @param elementId Id of the HTML element.
     * @param configOrVerbosityFlag optional, config object of type {@link
     * Html5QrcodeFullConfig} or a boolean verbosity flag (to maintain backward
     * compatibility). If nothing is passed, default values would be used.
     * If a boolean value is used, it'll be used to set verbosity. Pass a
     * config value to configure the Html5Qrcode scanner as per needs.
     * 
     * Use of `configOrVerbosityFlag` as a boolean value is being
     * deprecated since version 2.0.7.
     * 
     * TODO(mebjas): Deprecate the verbosity boolean flag completely.
     */
    public constructor(elementId: string, 
        configOrVerbosityFlag?: boolean | Html5QrcodeFullConfig | undefined) {
        if (!document.getElementById(elementId)) {
            throw `HTML Element with id=${elementId} not found`;
        }

        this.elementId = elementId;
        this.verbose = false;
        
        let experimentalFeatureConfig : ExperimentalFeaturesConfig | undefined;
        let configObject: Html5QrcodeFullConfig | undefined;
        if (typeof configOrVerbosityFlag == "boolean") {
            this.verbose = configOrVerbosityFlag === true;
        } else if (configOrVerbosityFlag) {
            configObject = configOrVerbosityFlag;
            this.verbose = configObject.verbose === true;
            experimentalFeatureConfig = configObject.experimentalFeatures;
        }
        
        this.logger = new BaseLoggger(this.verbose);
        this.qrcode = new Html5QrcodeShim(
            this.getSupportedFormats(configOrVerbosityFlag),
            this.getUseBarCodeDetectorIfSupported(configObject),
            this.verbose,
            this.logger);

        this.foreverScanTimeout;
        this.shouldScan = true;
        this.stateManagerProxy = StateManagerFactory.create();
    }

    //#region start()
    /**
     * Start scanning QR codes or bar codes for a given camera.
     * 
     * @param cameraIdOrConfig Identifier of the camera, it can either be the
     *  camera id retrieved from {@link Html5Qrcode#getCameras()} method or
     *  object with facing mode constraint.
     * @param configuration Extra configurations to tune the code scanner.
     * @param qrCodeSuccessCallback Callback called when an instance of a QR
     * code or any other supported bar code is found.
     * @param qrCodeErrorCallback Callback called in cases where no instance of
     * QR code or any other supported bar code is found.
     * 
     * @returns Promise for starting the scan. The Promise can fail if the user
     * doesn't grant permission or some API is not supported by the browser.
     */
    public start(
        cameraIdOrConfig: string | MediaTrackConstraints,
        configuration: Html5QrcodeCameraScanConfig | undefined,
        qrCodeSuccessCallback: QrcodeSuccessCallback | undefined,
        qrCodeErrorCallback: QrcodeErrorCallback | undefined,
    ): Promise<null> {

        // Code will be consumed as javascript.
        if (!cameraIdOrConfig) {
            throw "cameraIdOrConfig is required";
        }

        if (!qrCodeSuccessCallback
            || typeof qrCodeSuccessCallback != "function") {
            throw "qrCodeSuccessCallback is required and should be a function.";
        }

        let qrCodeErrorCallbackInternal: QrcodeErrorCallback;
        if (qrCodeErrorCallback) {
            qrCodeErrorCallbackInternal = qrCodeErrorCallback;
        } else {
            qrCodeErrorCallbackInternal
                = this.verbose ? this.logger.log : () => {};
        }

        const internalConfig = InternalHtml5QrcodeConfig.create(
            configuration, this.logger);
        this.clearElement();

        // Check if videoConstraints is passed and valid
        let videoConstraintsAvailableAndValid = false;
        if (internalConfig.videoConstraints) {
            if (!internalConfig.isMediaStreamConstraintsValid()) {
                this.logger.logError(
                    "'videoConstraints' is not valid 'MediaStreamConstraints, "
                        + "it will be ignored.'",
                    /* experimental= */ true);
            } else {
                videoConstraintsAvailableAndValid = true;
            }
        }
        const areVideoConstraintsEnabled = videoConstraintsAvailableAndValid;

        // qr shaded box
        const element = document.getElementById(this.elementId)!;
        const rootElementWidth = element.clientWidth
            ? element.clientWidth : Constants.DEFAULT_WIDTH;
        element.style.position = "relative";

        this.shouldScan = true;
        this.element = element;

        const $this = this;
        const toScanningStateChangeTransaction: StateManagerTransaction
            = this.stateManagerProxy.startTransition(
                Html5QrcodeScannerState.SCANNING);
        return new Promise((resolve, reject) => {
            const videoConstraints = areVideoConstraintsEnabled
                    ? internalConfig.videoConstraints
                    : $this.createVideoConstraints(cameraIdOrConfig);
            if (!videoConstraints) {
                toScanningStateChangeTransaction.cancel();
                reject("videoConstraints should be defined");
                return;
            }

            let cameraRenderingOptions: CameraRenderingOptions = {};
            if (!areVideoConstraintsEnabled || internalConfig.aspectRatio) {
                cameraRenderingOptions.aspectRatio = internalConfig.aspectRatio;
            }

            let renderingCallbacks: RenderingCallbacks = {
                onRenderSurfaceReady: (viewfinderWidth, viewfinderHeight) => {
                    $this.setupUi(
                        viewfinderWidth, viewfinderHeight, internalConfig);

                    $this.isScanning = true;
                    $this.foreverScan(
                        internalConfig,
                        qrCodeSuccessCallback,
                        qrCodeErrorCallbackInternal!);
                }
            };


            // TODO(minhazav): Flatten this flow.
            CameraFactory.failIfNotSupported().then((factory) => {
                factory.create(videoConstraints).then((camera) => {
                    return camera.render(
                        this.element!, cameraRenderingOptions, renderingCallbacks)
                        .then((renderedCamera) => {
                            $this.renderedCamera = renderedCamera;
                            toScanningStateChangeTransaction.execute();
                            resolve(/* Void */ null);
                        })
                        .catch((error) => {
                            toScanningStateChangeTransaction.cancel();
                            reject(error);
                        });
                }).catch((error) => {
                    toScanningStateChangeTransaction.cancel();
                    reject(Html5QrcodeStrings.errorGettingUserMedia(error));
                });
            }).catch((_) => {
                toScanningStateChangeTransaction.cancel();
                reject(Html5QrcodeStrings.cameraStreamingNotSupported());
            });
        });
    }
    //#endregion

    //#region Other state related public APIs
    /**
     * Pauses the ongoing scan.
     * 
     * @param shouldPauseVideo (Optional, default = false) If true the
     * video will be paused.
     * 
     * @throws error if method is called when scanner is not in scanning state.
     */
    public pause(shouldPauseVideo?: boolean) {
        if (!this.stateManagerProxy.isStrictlyScanning()) {
            throw "Cannot pause, scanner is not scanning.";
        }
        this.stateManagerProxy.directTransition(Html5QrcodeScannerState.PAUSED);
        this.showPausedState();

        if (isNullOrUndefined(shouldPauseVideo) || shouldPauseVideo !== true) {
            shouldPauseVideo = false;
        }

        if (shouldPauseVideo && this.renderedCamera) {
            this.renderedCamera.pause();
        }
    }

    /**
     * Resumes the paused scan.
     * 
     * If the video was previously paused by setting `shouldPauseVideo``
     * to `true` in {@link Html5Qrcode#pause(shouldPauseVideo)}, calling
     * this method will resume the video.
     * 
     * Note: with this caller will start getting results in success and error
     * callbacks.
     * 
     * @throws error if method is called when scanner is not in paused state.
     */
    public resume() {
        if (!this.stateManagerProxy.isPaused()) {
            throw "Cannot result, scanner is not paused.";
        }

        if (!this.renderedCamera) {
            throw "renderedCamera doesn't exist while trying resume()";
        }

        const $this = this;
        const transitionToScanning = () => {
            $this.stateManagerProxy.directTransition(
                Html5QrcodeScannerState.SCANNING);
            $this.hidePausedState();
        }

        if (!this.renderedCamera.isPaused()) {
            transitionToScanning();
            return;
        }
        this.renderedCamera.resume(() => {
            // Transition state, when the video playback has resumed.
            transitionToScanning();
        });
    }

    /**
     * Gets state of the camera scan.
     *
     * @returns state of type {@link ScannerState}.
     */
    public getState(): Html5QrcodeScannerState {
        return this.stateManagerProxy.getState();
    }

    /**
     * Stops streaming QR Code video and scanning.
     *
     * @returns Promise for safely closing the video stream.
     */
    public stop(): Promise<void> {
        if (!this.stateManagerProxy.isScanning()) {
            throw "Cannot stop, scanner is not running or paused.";
        }

        const toStoppedStateTransaction: StateManagerTransaction
            = this.stateManagerProxy.startTransition(
                Html5QrcodeScannerState.NOT_STARTED);

        this.shouldScan = false;
        if (this.foreverScanTimeout) {
            clearTimeout(this.foreverScanTimeout);
        }

        // Removes the shaded region if exists.
        const removeQrRegion = () => {
            if (!this.element) {
                return;
            }
            let childElement = document.getElementById(Constants.SHADED_REGION_ELEMENT_ID);
            if (childElement) {
                this.element.removeChild(childElement);
            }
         };

        let $this = this;
        return this.renderedCamera!.close().then(() => {
            $this.renderedCamera = null;

            if ($this.element) {
                $this.element.removeChild($this.canvasElement!);
                $this.canvasElement = null;
            }

            removeQrRegion();
            if ($this.qrRegion) {
                $this.qrRegion = null;
            }
            if ($this.context) {
                $this.context = null;
            }

            toStoppedStateTransaction.execute();
            $this.hidePausedState();
            $this.isScanning = false;
            return Promise.resolve();
        });
    }
    //#endregion

    //#region File scan related public APIs
    /**
     * Scans an Image File for QR Code.
     *
     * This feature is mutually exclusive to camera-based scanning, you should
     * call stop() if the camera-based scanning was ongoing.
     *
     * @param imageFile a local file with Image content.
     * @param showImage if true the Image will be rendered on given
     * element.
     *
     * @returns Promise with decoded QR code string on success and error message
     * on failure. Failure could happen due to different reasons:
     *   1. QR Code decode failed because enough patterns not found in image.
     *   2. Input file was not image or unable to load the image or other image
     *      load errors.
     */
    public scanFile(
        imageFile: File, /* default=true */ showImage?: boolean): Promise<string> {
        return this.scanFileV2(imageFile, showImage)
            .then((html5qrcodeResult) => html5qrcodeResult.decodedText);
    }

    /**
     * Scans an Image File for QR Code & returns {@link Html5QrcodeResult}.
     *
     * This feature is mutually exclusive to camera-based scanning, you should
     * call stop() if the camera-based scanning was ongoing.
     *
     * @param imageFile a local file with Image content.
     * @param showImage if true the Image will be rendered on given
     * element.
     *
     * @returns Promise which resolves with result of type
     * {@link Html5QrcodeResult}.
     * 
     * @beta This is a WIP method, it's available as a public method but not
     * documented.
     * TODO(mebjas): Replace scanFile with ScanFileV2
     */
    public scanFileV2(imageFile: File, /* default=true */ showImage?: boolean)
        : Promise<Html5QrcodeResult> {
        if (!imageFile || !(imageFile instanceof File)) {
            throw "imageFile argument is mandatory and should be instance "
                + "of File. Use 'event.target.files[0]'.";
        }

        if (isNullOrUndefined(showImage)) {
            showImage = true;
        }

        if (!this.stateManagerProxy.canScanFile()) {
            throw "Cannot start file scan - ongoing camera scan";
        }

        return new Promise((resolve, reject) => {
            this.possiblyCloseLastScanImageFile();
            this.clearElement();
            this.lastScanImageFile = URL.createObjectURL(imageFile);

            const inputImage = new Image;
            inputImage.onload = () => {
                const imageWidth = inputImage.width;
                const imageHeight = inputImage.height;
                const element = document.getElementById(this.elementId)!;
                const containerWidth = element.clientWidth
                    ? element.clientWidth : Constants.DEFAULT_WIDTH;
                // No default height anymore.
                const containerHeight =  Math.max(
                    element.clientHeight ? element.clientHeight : imageHeight,
                    Constants.FILE_SCAN_MIN_HEIGHT);

                const config = this.computeCanvasDrawConfig(
                    imageWidth, imageHeight, containerWidth, containerHeight);
                if (showImage) {
                    const visibleCanvas = this.createCanvasElement(
                        containerWidth, containerHeight, "qr-canvas-visible");
                    visibleCanvas.style.display = "inline-block";
                    element.appendChild(visibleCanvas);
                    const context = visibleCanvas.getContext("2d");
                    if (!context) {
                        throw "Unable to get 2d context from canvas";
                    }
                    context.canvas.width = containerWidth;
                    context.canvas.height = containerHeight;
                    // More reference
                    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
                    context.drawImage(
                        inputImage,
                        /* sx= */ 0,
                        /* sy= */ 0,
                        /* sWidth= */ imageWidth,
                        /* sHeight= */ imageHeight,
                        /* dx= */ config.x,
                        /* dy= */  config.y,
                        /* dWidth= */ config.width,
                        /* dHeight= */ config.height);
                }

                // Hidden canvas should be at-least as big as the image.
                // This could get really troublesome for large images like 12MP
                // images or 48MP images captured on phone.
                let padding = Constants.FILE_SCAN_HIDDEN_CANVAS_PADDING;
                let hiddenImageWidth = Math.max(inputImage.width, config.width);
                let hiddenImageHeight = Math.max(inputImage.height, config.height);

                let hiddenCanvasWidth = hiddenImageWidth + 2 * padding;
                let hiddenCanvasHeight = hiddenImageHeight + 2 * padding;

                // Try harder for file scan.
                // TODO(minhazav): Fallback to mirroring, 90 degree rotation and
                //  color inversion.
                const hiddenCanvas = this.createCanvasElement(
                    hiddenCanvasWidth, hiddenCanvasHeight);
                element.appendChild(hiddenCanvas);
                const context = hiddenCanvas.getContext("2d");
                if (!context) {
                    throw "Unable to get 2d context from canvas";
                }

                context.canvas.width = hiddenCanvasWidth;
                context.canvas.height = hiddenCanvasHeight;
                context.drawImage(
                    inputImage,
                    /* sx= */ 0,
                    /* sy= */ 0,
                    /* sWidth= */ imageWidth,
                    /* sHeight= */ imageHeight,
                    /* dx= */ padding,
                    /* dy= */  padding,
                    /* dWidth= */ hiddenImageWidth,
                    /* dHeight= */ hiddenImageHeight);
                try {
                    this.qrcode.decodeRobustlyAsync(hiddenCanvas)
                        .then((result) => {
                            resolve(
                                Html5QrcodeResultFactory.createFromQrcodeResult(
                                    result));
                        })
                        .catch(reject);
                } catch (exception) {
                    reject(`QR code parse error, error = ${exception}`);
                }
            };

            inputImage.onerror = reject;
            inputImage.onabort = reject;
            inputImage.onstalled = reject;
            inputImage.onsuspend = reject;
            inputImage.src = URL.createObjectURL(imageFile);
        });
    }
    //#endregion

    /**
     * Clears the existing canvas.
     *
     * Note: in case of ongoing web cam based scan, it needs to be explicitly
     * closed before calling this method, else it will throw exception.
     */
    public clear(): void {
        this.clearElement();
    }

    /** 
     * Returns list of {@link CameraDevice} supported by the device.
     *
     * @returns array of camera devices on success.
     */
    public static getCameras(): Promise<Array<CameraDevice>> {
        return CameraRetriever.retrieve();
    }

    /**
     * Returns the capabilities of the running video track.
     * 
     * Read more: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getConstraints
     * 
     * Important:
     *  1. Must be called only if the camera based scanning is in progress.
     *
     * @returns capabilities of the running camera.
     * @throws error if the scanning is not in running state.
     */
    public getRunningTrackCapabilities(): MediaTrackCapabilities {
        return this.getRenderedCameraOrFail().getRunningTrackCapabilities();
    }

    /**
     * Returns the object containing the current values of each constrainable
     * property of the running video track.
     * 
     * Read more: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getSettings
     * 
     * Important:
     *  1. Must be called only if the camera based scanning is in progress.
     *
     * @returns settings of the running media track.
     *
     * @throws error if the scanning is not in running state.
     */
    public getRunningTrackSettings(): MediaTrackSettings {
        return this.getRenderedCameraOrFail().getRunningTrackSettings();
    }

    /**
     * Returns {@link CameraCapabilities} of the running video track.
     * 
     * TODO(minhazav): Document this API, currently hidden.
     * 
     * @returns capabilities of the running camera.
     * @throws error if the scanning is not in running state.
     */
    public getRunningTrackCameraCapabilities(): CameraCapabilities {
        return this.getRenderedCameraOrFail().getCapabilities();
    }

    /**
     * Apply a video constraints on running video track from camera.
     *
     * Important:
     *  1. Must be called only if the camera based scanning is in progress.
     *  2. Changing aspectRatio while scanner is running is not yet supported.
     *
     * @param {MediaTrackConstraints} specifies a variety of video or camera
     *  controls as defined in
     *  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * @returns a Promise which succeeds if the passed constraints are applied,
     *  fails otherwise.
     * @throws error if the scanning is not in running state.
     */
    public applyVideoConstraints(videoConstaints: MediaTrackConstraints)
        : Promise<void> {
        if (!videoConstaints) {
            throw "videoConstaints is required argument.";
        } else if (!VideoConstraintsUtil.isMediaStreamConstraintsValid(
            videoConstaints, this.logger)) {
            throw "invalid videoConstaints passed, check logs for more details";
        }

        return this.getRenderedCameraOrFail().applyVideoConstraints(
            videoConstaints);
    }

    //#region Private methods.
    private getRenderedCameraOrFail() {
        if (this.renderedCamera == null) {
            throw "Scanning is not in running state, call this API only when"
                + " QR code scanning using camera is in running state.";
        }
        return this.renderedCamera!;
    }

    /**
     * Construct list of supported formats and returns based on input args.
     * `configOrVerbosityFlag` optional, config object of type {@link
     * Html5QrcodeFullConfig} or a boolean verbosity flag (to maintain backward
     * compatibility). If nothing is passed, default values would be used.
     * If a boolean value is used, it'll be used to set verbosity. Pass a
     * config value to configure the Html5Qrcode scanner as per needs.
     * 
     * Use of `configOrVerbosityFlag` as a boolean value is being
     * deprecated since version 2.0.7.
     * 
     * TODO(mebjas): Deprecate the verbosity boolean flag completely.
     */
    private getSupportedFormats(
        configOrVerbosityFlag: boolean | Html5QrcodeFullConfig | undefined)
        : Array<Html5QrcodeSupportedFormats> {
        const allFormats: Array<Html5QrcodeSupportedFormats> = [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.AZTEC,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
            Html5QrcodeSupportedFormats.MAXICODE,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.PDF_417,
            Html5QrcodeSupportedFormats.RSS_14,
            Html5QrcodeSupportedFormats.RSS_EXPANDED,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
        ];

        if (!configOrVerbosityFlag 
            || typeof configOrVerbosityFlag == "boolean") {
            return allFormats;
        }

        if (!configOrVerbosityFlag.formatsToSupport) {
            return allFormats;
        }

        if (!Array.isArray(configOrVerbosityFlag.formatsToSupport)) {
            throw "configOrVerbosityFlag.formatsToSupport should be undefined "
                + "or an array.";
        }

        if (configOrVerbosityFlag.formatsToSupport.length === 0) {
            throw "Atleast 1 formatsToSupport is needed.";
        }

        const supportedFormats: Array<Html5QrcodeSupportedFormats> = [];
        for (const format of configOrVerbosityFlag.formatsToSupport) {
            if (isValidHtml5QrcodeSupportedFormats(format)) {
                supportedFormats.push(format);
            } else {
                this.logger.warn(
                    `Invalid format: ${format} passed in config, ignoring.`);
            }
        }

        if (supportedFormats.length === 0) {
            throw "None of formatsToSupport match supported values.";
        }
        return supportedFormats;

    }

    /**
     * Returns `true` if `useBarCodeDetectorIfSupported` is
     * enabled in the config.
     */
    /*eslint complexity: ["error", 10]*/
    private getUseBarCodeDetectorIfSupported(
        config: Html5QrcodeConfigs | undefined) : boolean {
        // Default value is true.
        if (isNullOrUndefined(config)) {
            return true;
        }

        if (!isNullOrUndefined(config!.useBarCodeDetectorIfSupported)) {
            // Default value is false.
            return config!.useBarCodeDetectorIfSupported !== false;
        }

        if (isNullOrUndefined(config!.experimentalFeatures)) {
            return true;
        }

        let experimentalFeatures = config!.experimentalFeatures!;
        if (isNullOrUndefined(
            experimentalFeatures.useBarCodeDetectorIfSupported)) {
            return true;
        }

        return experimentalFeatures.useBarCodeDetectorIfSupported !== false;
    }

    /**
     * Validates if the passed config for qrbox is correct.
     */
    private validateQrboxSize(
        viewfinderWidth: number,
        viewfinderHeight: number,
        internalConfig: InternalHtml5QrcodeConfig) {
        const qrboxSize = internalConfig.qrbox!;
        this.validateQrboxConfig(qrboxSize);
        let qrDimensions = this.toQrdimensions(
            viewfinderWidth, viewfinderHeight, qrboxSize);

        const validateMinSize = (size: number) => {
            if (size < Constants.MIN_QR_BOX_SIZE) {
                throw "minimum size of 'config.qrbox' dimension value is"
                    + ` ${Constants.MIN_QR_BOX_SIZE}px.`;
            }
        };

        /**
         * The 'config.qrbox.width' shall be overriden if it's larger than the
         * width of the root element.
         * 
         * Based on the verbosity settings, this will be logged to the logger.
         * 
         * @param configWidth the width of qrbox set by users in the config.
         */
        const correctWidthBasedOnRootElementSize = (configWidth: number) => {
            if (configWidth > viewfinderWidth) {
                this.logger.warn("`qrbox.width` or `qrbox` is larger than the"
                    + " width of the root element. The width will be truncated"
                    + " to the width of root element.");
                configWidth = viewfinderWidth;
            }
            return configWidth;
        };

        validateMinSize(qrDimensions.width);
        validateMinSize(qrDimensions.height);
        qrDimensions.width = correctWidthBasedOnRootElementSize(
            qrDimensions.width);
        // Note: In this case if the height of the qrboxSize turns out to be
        // greater than the height of the root element (which should later be
        // based on the aspect ratio of the camera stream), it would be silently
        // ignored with a warning.
    }

    /**
     * Validates if the `qrboxSize` is a valid value.
     * 
     * It's expected to be either a number or of type {@link QrDimensions}.
     */
    private validateQrboxConfig(
        qrboxSize: number | QrDimensions | QrDimensionFunction) {
        if (typeof qrboxSize === "number") {
            return;
        }

        if (typeof qrboxSize === "function") {
            // This is a valid format.
            return;
        }

        // Alternatively, the config is expected to be of type QrDimensions.
        if (qrboxSize.width === undefined || qrboxSize.height === undefined) {
            throw "Invalid instance of QrDimensions passed for "
                + "'config.qrbox'. Both 'width' and 'height' should be set.";
        }
    }

    /**
     * Possibly converts `qrboxSize` to an object of type
     * {@link QrDimensions}.
     */
    private toQrdimensions(
        viewfinderWidth: number,
        viewfinderHeight: number,
        qrboxSize: number | QrDimensions | QrDimensionFunction): QrDimensions {
        if (typeof qrboxSize === "number") {
            return { width: qrboxSize, height: qrboxSize};
        } else if (typeof qrboxSize === "function") {
            try {
                return qrboxSize(viewfinderWidth, viewfinderHeight);
            } catch (error) {
                throw new Error(
                    "qrbox config was passed as a function but it failed with "
                    + "unknown error" + error);
            }
        }
        return qrboxSize;
    }

    //#region Documented private methods for camera based scanner.
    /**
    * Setups the UI elements, changes the state of this class.
    *
    * @param viewfinderWidth derived width of viewfinder.
    * @param viewfinderHeight derived height of viewfinder.
    */
    private setupUi(
        viewfinderWidth: number,
        viewfinderHeight: number,
        internalConfig: InternalHtml5QrcodeConfig): void {
        // Validate before insertion
        if (internalConfig.isShadedBoxEnabled()) {
            this.validateQrboxSize(
                viewfinderWidth, viewfinderHeight, internalConfig);
        }

        // If `qrbox` size is not set, it will default to the dimensions of the
        // viewfinder.
        const qrboxSize = isNullOrUndefined(internalConfig.qrbox) ? 
            {width: viewfinderWidth, height: viewfinderHeight}: internalConfig.qrbox!;

        this.validateQrboxConfig(qrboxSize);
        let qrDimensions = this.toQrdimensions(viewfinderWidth, viewfinderHeight, qrboxSize);
        if (qrDimensions.height > viewfinderHeight) {
            this.logger.warn("[Html5Qrcode] config.qrbox has height that is"
                + "greater than the height of the video stream. Shading will be"
                + " ignored");
        }
 
        const shouldShadingBeApplied
            = internalConfig.isShadedBoxEnabled()
                && qrDimensions.height <= viewfinderHeight;
        const defaultQrRegion: QrcodeRegionBounds = {
            x: 0,
            y: 0,
            width: viewfinderWidth,
            height: viewfinderHeight
        };

        const qrRegion = shouldShadingBeApplied
            ? this.getShadedRegionBounds(viewfinderWidth, viewfinderHeight, qrDimensions)
            : defaultQrRegion;
 
        const canvasElement = this.createCanvasElement(
            qrRegion.width, qrRegion.height);
        // Tell user agent that this canvas will be read frequently.
        // More info:
        // https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
        const contextAttributes: any = { willReadFrequently: true };
        // Casting canvas to any, as Microsoft's interface definition hasn't
        // caught up with latest definition for 'CanvasRenderingContext2DSettings'.
        const context: CanvasRenderingContext2D
            = (<any>canvasElement).getContext("2d", contextAttributes)!;
        context.canvas.width = qrRegion.width;
        context.canvas.height = qrRegion.height;

        // Insert the canvas
        this.element!.append(canvasElement);
        if (shouldShadingBeApplied) {
            this.possiblyInsertShadingElement(
                this.element!, viewfinderWidth, viewfinderHeight, qrDimensions);
        }

        this.createScannerPausedUiElement(this.element!);
 
        // Update local states
        this.qrRegion = qrRegion;
        this.context = context;
        this.canvasElement = canvasElement;
    }

    // TODO(mebjas): Convert this to a standard message viewer.
    private createScannerPausedUiElement(rootElement: HTMLElement) {
        const scannerPausedUiElement = document.createElement("div");
        scannerPausedUiElement.innerText = Html5QrcodeStrings.scannerPaused();
        scannerPausedUiElement.style.display = "none";
        scannerPausedUiElement.style.position = "absolute";
        scannerPausedUiElement.style.top = "0px";
        scannerPausedUiElement.style.zIndex = "1";
        scannerPausedUiElement.style.background = "rgba(9, 9, 9, 0.46)";
        scannerPausedUiElement.style.color = "#FFECEC";
        scannerPausedUiElement.style.textAlign = "center";
        scannerPausedUiElement.style.width = "100%";
        rootElement.appendChild(scannerPausedUiElement);
        this.scannerPausedUiElement = scannerPausedUiElement;
    }
 
     /**
     * Scans current context using the qrcode library.
     *
     * <p>This method call would result in callback being triggered by the
     * qrcode library. This method also handles the border coloring.
     *
     * @returns true if scan match is found, false otherwise.
     */
    private scanContext(
         qrCodeSuccessCallback: QrcodeSuccessCallback,
         qrCodeErrorCallback: QrcodeErrorCallback
     ): Promise<boolean> {
        if (this.stateManagerProxy.isPaused()) {
            return Promise.resolve(false);
        }

        return this.qrcode.decodeAsync(this.canvasElement!)
        .then((result) => {
            qrCodeSuccessCallback(
                result.text,
                Html5QrcodeResultFactory.createFromQrcodeResult(
                    result));
            this.possiblyUpdateShaders(/* qrMatch= */ true);
            return true;
        }).catch((error) => {
            this.possiblyUpdateShaders(/* qrMatch= */ false);
            let errorMessage = Html5QrcodeStrings.codeParseError(error);
            qrCodeErrorCallback(
                errorMessage, Html5QrcodeErrorFactory.createFrom(errorMessage));
            return false;
        });
    }

    /**
     * Forever scanning method.
     */
    private foreverScan(
        internalConfig: InternalHtml5QrcodeConfig,
        qrCodeSuccessCallback: QrcodeSuccessCallback,
        qrCodeErrorCallback: QrcodeErrorCallback) {
        if (!this.shouldScan) {
            // Stop scanning.
            return;
        }

        if (!this.renderedCamera) {
            return;
        }
        // There is difference in size of rendered video and one that is
        // considered by the canvas. Need to account for scaling factor.
        const videoElement = this.renderedCamera!.getSurface();
        const widthRatio
            = videoElement.videoWidth / videoElement.clientWidth;
        const heightRatio
            = videoElement.videoHeight / videoElement.clientHeight;

        if (!this.qrRegion) {
            throw "qrRegion undefined when localMediaStream is ready.";
        }
        const sWidthOffset = this.qrRegion.width * widthRatio;
        const sHeightOffset = this.qrRegion.height * heightRatio;
        const sxOffset = this.qrRegion.x * widthRatio;
        const syOffset = this.qrRegion.y * heightRatio;

        // Only decode the relevant area, ignore the shaded area,
        // More reference:
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        this.context!.drawImage(
            videoElement,
            /* sx= */ sxOffset,
            /* sy= */ syOffset,
            /* sWidth= */ sWidthOffset,
            /* sHeight= */ sHeightOffset,
            /* dx= */ 0,
            /* dy= */  0,
            /* dWidth= */ this.qrRegion.width,
            /* dHeight= */ this.qrRegion.height);

        const triggerNextScan = () => {
            this.foreverScanTimeout = setTimeout(() => {
                this.foreverScan(
                    internalConfig, qrCodeSuccessCallback, qrCodeErrorCallback);
            }, this.getTimeoutFps(internalConfig.fps));
        };

        // Try scanning normal frame and in case of failure, scan
        // the inverted context if not explictly disabled.
        // TODO(mebjas): Move this logic to decoding library.
        this.scanContext(qrCodeSuccessCallback, qrCodeErrorCallback)
            .then((isSuccessfull) => {
                // Previous scan failed and disableFlip is off.
                if (!isSuccessfull && internalConfig.disableFlip !== true) {
                    this.context!.translate(this.context!.canvas.width, 0);
                    this.context!.scale(-1, 1);
                    this.scanContext(qrCodeSuccessCallback, qrCodeErrorCallback)
                        .finally(() => {
                            triggerNextScan();
                        });
                } else {
                    triggerNextScan();
                }
            }).catch((error) => {
                this.logger.logError(
                    "Error happend while scanning context", error);
                triggerNextScan();
            });
    }

    private createVideoConstraints(
        cameraIdOrConfig: string | MediaTrackConstraints)
            : MediaTrackConstraints | undefined {
        if (typeof cameraIdOrConfig == "string") {
            // If it's a string it should be camera device Id.
            return { deviceId: { exact: cameraIdOrConfig } };
        } else if (typeof cameraIdOrConfig == "object") {
            const facingModeKey = "facingMode";
            const deviceIdKey = "deviceId";
            const allowedFacingModeValues
                = { "user" : true, "environment" : true};
            const exactKey = "exact";
            const isValidFacingModeValue = (value: string) => {
                if (value in allowedFacingModeValues) {
                    // Valid config
                    return true;
                } else {
                    // Invalid config
                    throw "config has invalid 'facingMode' value = "
                        + `'${value}'`;
                }
            };

            const keys = Object.keys(cameraIdOrConfig);
            if (keys.length !== 1) {
                throw "'cameraIdOrConfig' object should have exactly 1 key,"
                    + ` if passed as an object, found ${keys.length} keys`;
            }

            const key:string = Object.keys(cameraIdOrConfig)[0];
            if (key !== facingModeKey && key !== deviceIdKey) {
                throw `Only '${facingModeKey}' and '${deviceIdKey}' `
                    + " are supported for 'cameraIdOrConfig'";
            }

            if (key === facingModeKey) {
                /**
                 * Supported scenarios:
                 * - { facingMode: "user" }
                 * - { facingMode: "environment" }
                 * - { facingMode: { exact: "environment" } }
                 * - { facingMode: { exact: "user" } }
                 */
                const facingMode: any = cameraIdOrConfig.facingMode;
                if (typeof facingMode == "string") {
                    if (isValidFacingModeValue(facingMode)) {
                        return { facingMode: facingMode };
                    }
                } else if (typeof facingMode == "object") {
                    if (exactKey in facingMode) {
                        if (isValidFacingModeValue(facingMode[`${exactKey}`])) {
                                return {
                                    facingMode: {
                                        exact: facingMode[`${exactKey}`]
                                    }
                                };
                        }
                    } else {
                        throw "'facingMode' should be string or object with"
                            + ` ${exactKey} as key.`;
                    }
                } else {
                    const type = (typeof facingMode);
                    throw `Invalid type of 'facingMode' = ${type}`;
                }
            } else {
                /**
                 * key == deviceIdKey; Supported scenarios:
                 * - { deviceId: { exact: "a76afe74e95e3.....38627b3bde" }
                 * - { deviceId: "a76afe74e95e3....065c9cd89438627b3bde" }
                 */
                const deviceId: any = cameraIdOrConfig.deviceId;
                if (typeof deviceId == "string") {
                    return { deviceId: deviceId };
                } else if (typeof deviceId == "object") {
                    if (exactKey in deviceId) {
                        return {
                            deviceId : { exact: deviceId[`${exactKey}`] }
                        };
                    } else {
                        throw "'deviceId' should be string or object with"
                            + ` ${exactKey} as key.`;
                    }
                } else {
                    const type = (typeof deviceId);
                    throw `Invalid type of 'deviceId' = ${type}`;
                }
            }
        }


        // invalid type
        const type = (typeof cameraIdOrConfig);
        throw `Invalid type of 'cameraIdOrConfig' = ${type}`;
    }
    //#endregion

    //#region Documented private methods for file based scanner.
    private computeCanvasDrawConfig(
        imageWidth: number,
        imageHeight: number,
        containerWidth: number,
        containerHeight: number): QrcodeRegionBounds {

        if (imageWidth <= containerWidth
            && imageHeight <= containerHeight) {
            // no downsampling needed.
            const xoffset = (containerWidth - imageWidth) / 2;
            const yoffset = (containerHeight - imageHeight) / 2;
            return {
                x: xoffset,
                y: yoffset,
                width: imageWidth,
                height: imageHeight
            };
        } else {
            const formerImageWidth = imageWidth;
            const formerImageHeight = imageHeight;
            if (imageWidth > containerWidth) {
                imageHeight = (containerWidth / imageWidth) * imageHeight;
                imageWidth = containerWidth;
            }

            if (imageHeight > containerHeight) {
                imageWidth = (containerHeight / imageHeight) * imageWidth;
                imageHeight = containerHeight;
            }

            this.logger.log(
                "Image downsampled from "
                + `${formerImageWidth}X${formerImageHeight}`
                + ` to ${imageWidth}X${imageHeight}.`);

            return this.computeCanvasDrawConfig(
                imageWidth, imageHeight, containerWidth, containerHeight);
        }
    }
    //#endregion

    private clearElement(): void {
        if (this.stateManagerProxy.isScanning()) {
            throw "Cannot clear while scan is ongoing, close it first.";
        }
        const element = document.getElementById(this.elementId);
        if (element) {
            element.innerHTML = "";
        }
    }

    private possiblyUpdateShaders(qrMatch: boolean) {
        if (this.qrMatch === qrMatch) {
            return;
        }

        if (this.hasBorderShaders
            && this.borderShaders
            && this.borderShaders.length) {
            this.borderShaders.forEach((shader) => {
                shader.style.backgroundColor = qrMatch
                    ? Constants.BORDER_SHADER_MATCH_COLOR
                    : Constants.BORDER_SHADER_DEFAULT_COLOR;
            });
        }
        this.qrMatch = qrMatch;
    }

    private possiblyCloseLastScanImageFile() {
        if (this.lastScanImageFile) {
            URL.revokeObjectURL(this.lastScanImageFile);
            this.lastScanImageFile = null;
        }
    }

    private createCanvasElement(
        width: number, height: number, customId?: string): HTMLCanvasElement {
        const canvasWidth = width;
        const canvasHeight = height;
        const canvasElement = document.createElement("canvas");
        canvasElement.style.width = `${canvasWidth}px`;
        canvasElement.style.height = `${canvasHeight}px`;
        canvasElement.style.display = "none";
        canvasElement.id = isNullOrUndefined(customId)
            ? "qr-canvas" : customId!;
        return canvasElement;
    }

    private getShadedRegionBounds(
        width: number, height: number, qrboxSize: QrDimensions)
        : QrcodeRegionBounds {
        if (qrboxSize.width > width || qrboxSize.height > height) {
            throw "'config.qrbox' dimensions should not be greater than the "
            + "dimensions of the root HTML element.";
        }

        return {
            x: (width - qrboxSize.width) / 2,
            y: (height - qrboxSize.height) / 2,
            width: qrboxSize.width,
            height: qrboxSize.height
        };
    }

    private possiblyInsertShadingElement(
        element: HTMLElement,
        width: number,
        height: number,
        qrboxSize: QrDimensions) {
        if ((width - qrboxSize.width) < 1 || (height - qrboxSize.height) < 1) {
          return;
        }
        const shadingElement = document.createElement("div");
        shadingElement.style.position = "absolute";

        const rightLeftBorderSize = (width - qrboxSize.width) / 2;
        const topBottomBorderSize = (height - qrboxSize.height) / 2;

        shadingElement.style.borderLeft
            = `${rightLeftBorderSize}px solid rgba(0, 0, 0, 0.48)`;
        shadingElement.style.borderRight
            = `${rightLeftBorderSize}px solid rgba(0, 0, 0, 0.48)`;
        shadingElement.style.borderTop
            = `${topBottomBorderSize}px solid rgba(0, 0, 0, 0.48)`;
        shadingElement.style.borderBottom
            = `${topBottomBorderSize}px solid rgba(0, 0, 0, 0.48)`;
        shadingElement.style.boxSizing = "border-box";
        shadingElement.style.top = "0px";
        shadingElement.style.bottom = "0px";
        shadingElement.style.left = "0px";
        shadingElement.style.right = "0px";
        shadingElement.id = `${Constants.SHADED_REGION_ELEMENT_ID}`;
  
        // Check if div is too small for shadows. As there are two 5px width
        // borders the needs to have a size above 10px.
        if ((width - qrboxSize.width) < 11 
            || (height - qrboxSize.height) < 11) {
          this.hasBorderShaders = false;
        } else {
            const smallSize = 5;
            const largeSize = 40;
            this.insertShaderBorders(
                shadingElement,
                /* width= */ largeSize, 
                /* height= */ smallSize,
                /* top= */ -smallSize,
                /* bottom= */ null,
                /* side= */ 0,
                /* isLeft= */ true);
            this.insertShaderBorders(
                shadingElement,
                /* width= */ largeSize,
                /* height= */ smallSize,
                /* top= */ -smallSize,
                /* bottom= */ null,
                /* side= */ 0,
                /* isLeft= */ false);
            this.insertShaderBorders(
                shadingElement,
                /* width= */ largeSize,
                /* height= */ smallSize,
                /* top= */ null,
                /* bottom= */ -smallSize,
                /* side= */ 0,
                /* isLeft= */ true);
            this.insertShaderBorders(
                shadingElement,
                /* width= */ largeSize,
                /* height= */ smallSize,
                /* top= */ null,
                /* bottom= */ -smallSize,
                /* side= */ 0,
                /* isLeft= */ false);
            this.insertShaderBorders(
                shadingElement,
                /* width= */ smallSize,
                /* height= */ largeSize + smallSize,
                /* top= */ -smallSize,
                /* bottom= */ null,
                /* side= */ -smallSize,
                /* isLeft= */ true);
            this.insertShaderBorders(
                shadingElement,
                /* width= */ smallSize,
                /* height= */ largeSize + smallSize,
                /* top= */ null,
                /* bottom= */ -smallSize,
                /* side= */ -smallSize,
                /* isLeft= */ true);
            this.insertShaderBorders(
                shadingElement,
                /* width= */ smallSize,
                /* height= */ largeSize + smallSize,
                /* top= */ -smallSize,
                /* bottom= */ null,
                /* side= */ -smallSize,
                /* isLeft= */ false);
            this.insertShaderBorders(
                shadingElement,
                /* width= */ smallSize,
                /* height= */ largeSize + smallSize,
                /* top= */ null,
                /* bottom= */ -smallSize,
                /* side= */ -smallSize,
                /* isLeft= */ false);
            this.hasBorderShaders = true;
        }
        element.append(shadingElement);
    }

    private insertShaderBorders(
        shaderElem: HTMLDivElement,
        width: number,
        height: number,
        top: number | null,
        bottom: number | null,
        side: number,
        isLeft: boolean) {
        const elem = document.createElement("div");
        elem.style.position = "absolute";
        elem.style.backgroundColor = Constants.BORDER_SHADER_DEFAULT_COLOR;
        elem.style.width = `${width}px`;
        elem.style.height = `${height}px`;
        if (top !== null) {
            elem.style.top = `${top}px`;
        }
        if (bottom !== null) {
            elem.style.bottom = `${bottom}px`;
        }
        if (isLeft) {
          elem.style.left = `${side}px`;
        } else {
          elem.style.right = `${side}px`;
        }
        if (!this.borderShaders) {
          this.borderShaders = [];
        }
        this.borderShaders.push(elem);
        shaderElem.appendChild(elem);
    }

    private showPausedState() {
        if (!this.scannerPausedUiElement) {
            throw "[internal error] scanner paused UI element not found";
        }
        this.scannerPausedUiElement.style.display = "block";
    }

    private hidePausedState() {
        if (!this.scannerPausedUiElement) {
            throw "[internal error] scanner paused UI element not found";
        }
        this.scannerPausedUiElement.style.display = "none";
    }

    private getTimeoutFps(fps: number) {
        return 1000 / fps;
    }
    //#endregion
}
