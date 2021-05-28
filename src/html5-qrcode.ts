/**
 * @fileoverview
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
    CameraDevice,
    QrcodeErrorCallback,
    QrcodeSuccessCallback,
    Logger,
    BaseLoggger,
    Html5QrcodeResultFactory,
    Html5QrcodeErrorFactory,
    Html5QrcodeSupportedFormats,
    QrcodeDecoder
} from "./core";

import { Html5QrcodeStrings } from "./strings";
import { VideoConstraintsUtil } from "./utils";
import { Html5QrcodeShim } from "./code-decoder";

/**
 * Data class for creating {@class Html5QrcodeScanner}
 */
export interface Html5QrcodeConfig {
    /**
     * Optional, Expected framerate of qr code scanning. example { fps: 2 } means the
     * scanning would be done every 500 ms.
     */
    fps?: number;

    /**
     * Optional, width of QR scanning box, this should be smaller than the width
     * and height of the box. This would make the scanner look like this:
     *          ----------------------
     *          |********************|
     *          |******,,,,,,,,,*****|      <--- shaded region
     *          |******|       |*****|      <--- non shaded region would be
     *          |******|       |*****|          used for QR code scanning.
     *          |******|_______|*****|
     *          |********************|
     *          |********************|
     *          ----------------------
     */
    qrbox?: number;

    /**
     * Optional, Desired aspect ratio for the video feed. Ideal aspect ratios
     * are 4:3 or 16:9. Passing very wrong aspect ratio could lead to video feed
     * not showing up.
     */
    aspectRatio?: number;

    /**
     * Optional, if {@code true} flipped QR Code won't be scanned. Only use this
     * if you are sure the camera cannot give mirrored feed if you are facing
     * performance constraints.
     */
    disableFlip?: boolean;

    /**
     * Optional, @beta(this config is not well supported yet).
     *
     * Important: When passed this will override other parameters like
     * 'cameraIdOrConfig' or configurations like 'aspectRatio'.
     * 'videoConstraints' should be of type {@code MediaTrackConstraints} as
     * defined in
     * https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * and is used to specify a variety of video or camera controls like:
     * aspectRatio, facingMode, frameRate, etc.
     */
    videoConstraints?: MediaTrackConstraints;
}

/**
 * Internal implementation of {@interface Html5QrcodeConfig} with util & factory
 * methods.
 */
class InternalHtml5QrcodeConfig implements InternalHtml5QrcodeConfig {

    // TODO(mebjas) Make items that doesn't need to be public private.
    public fps: number;
    public disableFlip: boolean;
    public qrbox?: number;
    public aspectRatio?: number;
    public videoConstraints?: MediaTrackConstraints;

    private logger: Logger;

    private constructor(config: Html5QrcodeConfig, logger: Logger) {
        this.fps = config.fps == undefined
            ? Constants.SCAN_DEFAULT_FPS : config.fps!;
        this.disableFlip = config.disableFlip === true;

        this.qrbox = config.qrbox;
        this.aspectRatio = config.aspectRatio;
        this.videoConstraints = config.videoConstraints;

        this.logger = logger;
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
        return this.qrbox != undefined;
    }

    /**
     * Create instance of {@interface Html5QrcodeConfig}.
     * 
     * Create configuration by merging default and input settings.
     */
    static create(config: Html5QrcodeConfig, logger: Logger)
        : InternalHtml5QrcodeConfig {
        return new InternalHtml5QrcodeConfig(config, logger);
    }
}

interface QrcodeRegionBounds {
    x: number,
    y: number,
    width: number,
    height: number
}

type Html5QrcodeIdentifier = string | MediaTrackConstraints;

class Constants {
    //#region static constants
    static DEFAULT_WIDTH = 300;
    static DEFAULT_WIDTH_OFFSET = 2;
    static FILE_SCAN_MIN_HEIGHT = 300;
    static SCAN_DEFAULT_FPS = 2;
    static MIN_QR_BOX_SIZE = 50;
    static SHADED_LEFT = 1;
    static SHADED_RIGHT = 2;
    static SHADED_TOP = 3;
    static SHADED_BOTTOM = 4;
    static SHADED_REGION_CLASSNAME = "qr-shaded-region";
    static VERBOSE = false;
    static BORDER_SHADER_DEFAULT_COLOR = "#ffffff";
    static BORDER_SHADER_MATCH_COLOR = "rgb(90, 193, 56)";
    //#endregion
}

export class Html5Qrcode {

    //#region Private fields.
    private elementId: string;
    private verbose: boolean;
    private qrcode: QrcodeDecoder;
    private shouldScan: boolean;
    private logger: Logger;

    private element?: HTMLElement;
    private canvasElement?: HTMLCanvasElement;
    private hasBorderShaders?: boolean;
    private borderShaders?: Array<HTMLElement>;
    private qrMatch?: boolean;
    private videoElement?: HTMLVideoElement;
    private foreverScanTimeout?: any;
    private localMediaStream?: MediaStream;
    private qrRegion?: QrcodeRegionBounds;
    private context?: CanvasRenderingContext2D;
    private lastScanImageFile?: string;
    //#endregion

    public isScanning: boolean;

    /**
     * Initialize the code scanner.
     * @param elementId Id of the HTML element.
     * @param verbose If true, all logs would be printed to console.
     */
    public constructor(elementId: string, verbose?: boolean) {
        if (!document.getElementById(elementId)) {
            throw `HTML Element with id=${elementId} not found`;
        }

        this.elementId = elementId;
        this.verbose = verbose === true;
        this.logger = new BaseLoggger(this.verbose);

        const requestedFormats: Array<Html5QrcodeSupportedFormats> = [
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
        this.qrcode = new Html5QrcodeShim(requestedFormats, this.verbose);

        this.foreverScanTimeout;
        this.localMediaStream;
        this.shouldScan = true;
        this.isScanning = false;

    }

    /**
     * Start scanning QR Code for given camera.
     * 
     * @param cameraIdOrConfig Identifier of the camera, it can either be the
     *  cameraId retrieved from {@code Html5Qrcode#getCameras()} method or
     *  object with facingMode constraint.
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
        cameraIdOrConfig: Html5QrcodeIdentifier,
        configuration?: Html5QrcodeConfig,
        qrCodeSuccessCallback?: QrcodeSuccessCallback,
        qrCodeErrorCallback?: QrcodeErrorCallback,
    ): Promise<null> {

        // Code will be consumed as javascript.
        if (!cameraIdOrConfig) {
            throw "cameraIdOrConfig is required";
        }

        if (!qrCodeSuccessCallback
            || typeof qrCodeSuccessCallback != "function") {
            throw "qrCodeSuccessCallback is required and should be a function."
        }

        if (!qrCodeErrorCallback) {
            qrCodeErrorCallback = this.verbose ? console.log : () => {};
        }

        const internalConfig = InternalHtml5QrcodeConfig.create(
            configuration == undefined ? {} : configuration, this.logger);

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
        const isShadedBoxEnabled = internalConfig.isShadedBoxEnabled();
        const element = document.getElementById(this.elementId)!;
        const width = element.clientWidth
            ? element.clientWidth : Constants.DEFAULT_WIDTH;
        element.style.position = "relative";

        this.shouldScan = true;
        this.element = element;

        // Validate before insertion
        if (isShadedBoxEnabled) {
            const qrboxSize = internalConfig.qrbox!;
            if (qrboxSize < Constants.MIN_QR_BOX_SIZE) {
                throw "minimum size of 'config.qrbox' is"
                + ` ${Constants.MIN_QR_BOX_SIZE}px.`;
            }

            if (qrboxSize > width) {
                throw "'config.qrbox' should not be greater than the "
                + "width of the HTML element.";
            }
        }

        const $this = this;
        return new Promise((resolve, reject) => {
            const videoConstraints = areVideoConstraintsEnabled
                    ? internalConfig.videoConstraints
                    : $this.createVideoConstraints(cameraIdOrConfig);
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // Ignore all other video constraints if the videoConstraints
                // is passed.
                navigator.mediaDevices.getUserMedia(
                    {
                        audio: false,
                        video: videoConstraints
                    }).then(stream => {
                        $this.onMediaStreamReceived(
                            stream,
                            internalConfig,
                            areVideoConstraintsEnabled,
                            width,
                            qrCodeSuccessCallback,
                            qrCodeErrorCallback!)
                            .then(_ => {
                                $this.isScanning = true;
                                resolve(/* Void */ null);
                            })
                            .catch(reject);
                    })
                    .catch(error => {
                        reject(Html5QrcodeStrings.errorGettingUserMedia(error));
                    });
            } else if (navigator.getUserMedia) {
                if (typeof cameraIdOrConfig != "string") {
                    // TODO(mebjas): Make errors more concrete and categorizable.
                    throw Html5QrcodeStrings.onlyDeviceSupportedError();
                }
                const getCameraConfig: MediaStreamConstraints = {
                    video: videoConstraints
                };
                navigator.getUserMedia(getCameraConfig,
                    stream => {
                        $this.onMediaStreamReceived(
                            stream,
                            internalConfig,
                            areVideoConstraintsEnabled,
                            width,
                            qrCodeSuccessCallback,
                            qrCodeErrorCallback!)
                            .then(_ => {
                                $this.isScanning = true;
                                resolve(/* Void */ null);

                            })
                            .catch(error => {
                                reject(
                                    Html5QrcodeStrings.errorGettingUserMedia(
                                        error));

                            });
                    }, error => {
                        reject(Html5QrcodeStrings.errorGettingUserMedia(error));
                    });
            } else {
                reject(Html5QrcodeStrings.cameraStreamingNotSupported());
            }
        });
    }

    /**
     * Stops streaming QR Code video and scanning.
     *
     * @returns Promise for safely closing the video stream.
     */
    public stop(): Promise<void> {
        // TODO(mebjas): fail fast if the start() wasn't called.
        this.shouldScan = false;
        if (this.foreverScanTimeout) {
            clearTimeout(this.foreverScanTimeout);
        }

        return new Promise((resolve, _) => {
            const onAllTracksClosed = () => {
                this.localMediaStream = undefined;
                if (this.element) {
                    this.element.removeChild(this.videoElement!);
                    this.element.removeChild(this.canvasElement!);
                }

                removeQrRegion();
                this.isScanning = false;
                if (this.qrRegion) {
                    this.qrRegion = undefined;
                }
                if (this.context) {
                    this.context = undefined;
                }
                resolve();
            }

            if (!this.localMediaStream) {
                onAllTracksClosed();
            }

            const tracksToClose
                = this.localMediaStream!.getVideoTracks().length;
            var tracksClosed = 0;

            // Removes the shaded region if exists.
            const removeQrRegion = () => {
                if (!this.element) {
                    return;
                }
                while (this.element.getElementsByClassName(
                    Constants.SHADED_REGION_CLASSNAME).length) {
                    const shadedChild = this.element.getElementsByClassName(
                        Constants.SHADED_REGION_CLASSNAME)[0];
                    this.element.removeChild(shadedChild);
                }
            }

            this.localMediaStream!.getVideoTracks().forEach(videoTrack => {
                this.localMediaStream!.removeTrack(videoTrack);
                videoTrack.stop();
                ++tracksClosed;

                if (tracksClosed >= tracksToClose) {
                    onAllTracksClosed();
                }
            });
        });
    }

    /**
     * Scans an Image File for QR Code.
     *
     * This feature is mutually exclusive to camera based scanning, you should
     * call stop() if the camera based scanning was ongoing.
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
        
        if (!imageFile || !(imageFile instanceof File)) {
            throw "imageFile argument is mandatory and should be instance "
                + "of File. Use 'event.target.files[0]'.";
        }

        if (showImage === undefined) {
            showImage = true;
        }

        if (this.isScanning) {
            throw "Close ongoing scan before scanning a file.";
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
                        containerWidth, containerHeight, 'qr-canvas-visible');
                    visibleCanvas.style.display = "inline-block";
                    element.appendChild(visibleCanvas);
                    const context = visibleCanvas.getContext('2d');
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

                const hiddenCanvas = this.createCanvasElement(
                    config.width, config.height);
                element.appendChild(hiddenCanvas);
                const context = hiddenCanvas.getContext('2d');
                if (!context) {
                    throw "Unable to get 2d context from canvas";
                }
                context.canvas.width = config.width;
                context.canvas.height = config.height;
                context.drawImage(
                    inputImage,
                    /* sx= */ 0,
                    /* sy= */ 0,
                    /* sWidth= */ imageWidth,
                    /* sHeight= */ imageHeight,
                    /* dx= */ 0,
                    /* dy= */  0,
                    /* dWidth= */ config.width,
                    /* dHeight= */ config.height);
                try {
                    let result = this.qrcode.decode(hiddenCanvas);
                    resolve(result.text);
                } catch (exception) {
                    reject(`QR code parse error, error = ${exception}`);
                }
            }

            inputImage.onerror = reject;
            inputImage.onabort = reject;
            inputImage.onstalled = reject;
            inputImage.onsuspend = reject;
            inputImage.src = URL.createObjectURL(imageFile);
        });
    }

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
     * Returns a Promise with list of all cameras supported by the device.
     *
     * @returns a Promise with list of {@code CameraDevice}.
     */
    public static getCameras(): Promise<Array<CameraDevice>> {
        if (navigator.mediaDevices) {
            return Html5Qrcode.getCamerasFromMediaDevices();
        }
        
        // Using deprecated api to support really old browsers.
        var mst = <any>MediaStreamTrack;
        if (MediaStreamTrack && mst.getSources) {
            return Html5Qrcode.getCamerasFrmoMediaStreamTrack();
        }

        // This can potentially happen if the page is loaded without SSL.
        const isHttpsOrLocalhost = (): boolean => {
            if (location.protocol === "https:") {
                return true;
            }
            const host = location.host.split(":")[0];
            return host === "127.0.0.1" || host === "localhost";
        }

        let errorMessage = Html5QrcodeStrings.unableToQuerySupportedDevices();
        if (!isHttpsOrLocalhost()) {
            errorMessage = Html5QrcodeStrings.insecureContextCameraQueryError();
        }
        return Promise.reject(errorMessage);
    }

    /**
     * Returns the capabilities of the running video track.
     *
     * @beta This is an experimental API
     * @returns the capabilities of a running video track.
     * @throws error if the scanning is not in running state.
     */
    public getRunningTrackCapabilities() {
        if (this.localMediaStream == null) {
            throw "Scanning is not in running state, call this API only when"
                + " QR code scanning using camera is in running state.";
        }

        if (this.localMediaStream.getVideoTracks().length == 0) {
            throw "No video tracks found";
        }

        const videoTrack = this.localMediaStream.getVideoTracks()[0];
        return videoTrack.getCapabilities();
    }

    /**
     * Apply a video constraints on running video track from camera.
     *
     * Important:
     *  1. Must be called only if the camera based scanning is in progress.
     *  2. Changing aspectRatio while scanner is running is not yet supported.
     *
     * @beta This is an experimental API
     * @param {MediaTrackConstraints} specifies a variety of video or camera
     *  controls as defined in
     *  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * @returns a Promise which succeeds if the passed constraints are applied,
     *  fails otherwise.
     * @throws error if the scanning is not in running state.
     */
    public applyVideoConstraints(videoConstaints: MediaTrackConstraints)
        : Promise<any> {
        if (!videoConstaints) {
            throw "videoConstaints is required argument.";
        } else if (!VideoConstraintsUtil.isMediaStreamConstraintsValid(
            videoConstaints, this.logger)) {
            throw "invalid videoConstaints passed, check logs for more details";
        }

        if (this.localMediaStream == null) {
            throw "Scanning is not in running state, call this API only when"
                + " QR code scanning using camera is in running state.";
        }

        if (this.localMediaStream.getVideoTracks().length == 0) {
            throw "No video tracks found";
        }

        return new Promise((resolve, reject) => {
            if ("aspectRatio" in videoConstaints) {
                reject("Chaning 'aspectRatio' in run-time is not yet "
                    + "supported.");
                return;
            }
            const videoTrack = this.localMediaStream!.getVideoTracks()[0];
            // TODO(mebjas): This can be simplified to just return the promise
            // directly.
            videoTrack.applyConstraints(videoConstaints)
                .then(_ => {
                    resolve(_);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
    
    //#region Private methods for getting cameras.
    private static getCamerasFromMediaDevices(): Promise<Array<CameraDevice>> {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia(
                { audio: false, video: true })
                .then(stream => {
                    // hacky approach to close any active stream if they are
                    // active.
                    const closeActiveStreams = (stream: MediaStream) => {
                        const tracks = stream.getVideoTracks();
                        for (var i = 0; i < tracks.length; i++) {
                            const track = tracks[i];
                            track.enabled = false;
                            track.stop();
                            stream.removeTrack(track);
                        }
                    }

                    navigator.mediaDevices.enumerateDevices()
                        .then(devices => {
                            const results = [];
                            for (var i = 0; i < devices.length; i++) {
                                const device = devices[i];
                                if (device.kind == "videoinput") {
                                    results.push({
                                        id: device.deviceId,
                                        label: device.label
                                    });
                                }
                            }
                            closeActiveStreams(stream);
                            resolve(results);
                        })
                        .catch(err => {
                            reject(`${err.name} : ${err.message}`);
                        });
                })
                .catch(err => {
                    reject(`${err.name} : ${err.message}`);
                })
        });
    }

    private static getCamerasFrmoMediaStreamTrack(): Promise<Array<CameraDevice>> {
        return new Promise((resolve, _) => {
            const callback = (sourceInfos: Array<any>) => {
                const results = [];
                for (var i = 0; i !== sourceInfos.length; ++i) {
                    const sourceInfo = sourceInfos[i];
                    if (sourceInfo.kind === 'video') {
                        results.push({
                            id: sourceInfo.id,
                            label: sourceInfo.label
                        });
                    }
                }
                resolve(results);
            }

            var mst = <any>MediaStreamTrack;
            mst.getSources(callback);
        });
    }
    //#endregion

    //#region Private methods.
    //#region Documented private methods for camera based scanner.
    /**
    * Setups the UI elements, changes the state of this class.
    *
    * @param width derived width of viewfinder.
    * @param height derived height of viewfinder.
    */
    private setupUi(
        width: number,
        height: number,
        internalConfig: InternalHtml5QrcodeConfig): void {
        const qrboxSize = internalConfig.qrbox!;
        if (qrboxSize > height) {
            this.logger.warn("[Html5Qrcode] config.qrboxsize is greater "
                + "than video height. Shading will be ignored");
        }
 
        const shouldShadingBeApplied
            = internalConfig.isShadedBoxEnabled() && qrboxSize <= height;
        const defaultQrRegion: QrcodeRegionBounds = {
            x: 0,
            y: 0,
            width: width,
            height: height
        };
        const qrRegion = shouldShadingBeApplied
            ? this.getShadedRegionBounds(width, height, qrboxSize)
            : defaultQrRegion;
 
        const canvasElement = this.createCanvasElement(
            qrRegion.width, qrRegion.height);
        const context: CanvasRenderingContext2D
             = canvasElement.getContext('2d')!;
        context.canvas.width = qrRegion.width;
        context.canvas.height = qrRegion.height;
 
        // Insert the canvas
        this.element!.append(canvasElement);
        if (shouldShadingBeApplied) {
            this.possiblyInsertShadingElement(
                this.element!, width, height, qrboxSize);
        }
 
        // Update local states
        this.qrRegion = qrRegion;
        this.context = context;
        this.canvasElement = canvasElement;
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
     ): boolean {
        try {
            let result = this.qrcode.decode(this.canvasElement!);
            qrCodeSuccessCallback(
                result.text, Html5QrcodeResultFactory.createFrom(result.text));
            this.possiblyUpdateShaders(/* qrMatch= */ true);
            return true;
        } catch (exception) {
            this.possiblyUpdateShaders(/* qrMatch= */ false);
            let errorMessage = Html5QrcodeStrings.codeParseError(exception);
            qrCodeErrorCallback(
                errorMessage, Html5QrcodeErrorFactory.createFrom(errorMessage));
            return false;
        }
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
        if (this.localMediaStream) {
            // There is difference in size of rendered video and one that is
            // considered by the canvas. Need to account for scaling factor.
            const videoElement = this.videoElement!;
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

                // Try scanning normal frame and in case of failure, scan
                // the inverted context if not explictly disabled.
                // TODO(mebjas): Move this logic to decoding library.
                if (!this.scanContext(
                    qrCodeSuccessCallback, qrCodeErrorCallback)
                    && internalConfig.disableFlip !== true) {
                    // scan inverted context.
                    this.context!.translate(this.context!.canvas.width, 0);
                    this.context!.scale(-1, 1);
                    this.scanContext(
                        qrCodeSuccessCallback, qrCodeErrorCallback);
                }
        }
        this.foreverScanTimeout = setTimeout(() => {
            this.foreverScan(
                internalConfig, qrCodeSuccessCallback, qrCodeErrorCallback);
        }, this.getTimeoutFps(internalConfig.fps));
    }

    /**
     * Success callback when user media (Camera) is attached.
     */
    private onMediaStreamReceived(
        mediaStream: MediaStream,
        internalConfig: InternalHtml5QrcodeConfig,
        areVideoConstraintsEnabled: boolean,
        clientWidth: number,
        qrCodeSuccessCallback: QrcodeSuccessCallback,
        qrCodeErrorCallback: QrcodeErrorCallback): Promise<null> {
        const $this = this;
        return new Promise((resolve, reject) => {
            const setupVideo = () => {
                const videoElement = this.createVideoElement(clientWidth);
                $this.element!.append(videoElement);
                // Attach listeners to video.
                videoElement.onabort = reject;
                videoElement.onerror = reject;
                videoElement.onplaying = () => {
                    const videoWidth = videoElement.clientWidth;
                    const videoHeight = videoElement.clientHeight;
                    $this.setupUi(videoWidth, videoHeight, internalConfig);

                    // start scanning after video feed has started
                    $this.foreverScan(
                        internalConfig,
                        qrCodeSuccessCallback,
                        qrCodeErrorCallback);
                    resolve(/* void */ null);
                }

                videoElement.srcObject = mediaStream;
                videoElement.play();

                // Set state
                $this.videoElement = videoElement;
            }

            $this.localMediaStream = mediaStream;
            // If videoConstraints is passed, ignore all other configs.
            if (areVideoConstraintsEnabled || !internalConfig.aspectRatio) {
                setupVideo();
            } else {
                const constraints = {
                    aspectRatio : internalConfig.aspectRatio
                }
                const track = mediaStream.getVideoTracks()[0];
                track.applyConstraints(constraints)
                    .then(_ => setupVideo())
                    .catch(error => {
                        $this.logger.logErrors(
                            ["[Html5Qrcode] Constriants could not "
                                + "be satisfied, ignoring constraints",
                            error]);
                        setupVideo();
                    });
            }
        });
    }

    private createVideoConstraints(
        cameraIdOrConfig: Html5QrcodeIdentifier)
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
            if (keys.length != 1) {
                throw "'cameraIdOrConfig' object should have exactly 1 key,"
                    + ` if passed as an object, found ${keys.length} keys`;
            }

            const key = Object.keys(cameraIdOrConfig)[0];
            if (key != facingModeKey && key != deviceIdKey) {
                throw `Only '${facingModeKey}' and '${deviceIdKey}' `
                    + " are supported for 'cameraIdOrConfig'";
            }

            if (key == facingModeKey) {
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
                        if (isValidFacingModeValue(facingMode[exactKey])) {
                                return {
                                    facingMode: {
                                        exact: facingMode[exactKey]
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
                const deviceId: any = cameraIdOrConfig[key];
                if (typeof deviceId == "string") {
                    return { deviceId: deviceId };
                } else if (typeof deviceId == "object") {
                    if (exactKey in deviceId) {
                        return {
                            deviceId : { exact: deviceId[exactKey] }
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
        if (this.isScanning) {
            throw 'Cannot clear while scan is ongoing, close it first.';
        }
        const element = document.getElementById(this.elementId);
        if (element) {
            element.innerHTML = "";
        }
    }

    private createVideoElement(width: number): HTMLVideoElement {
        const videoElement = document.createElement('video');
        videoElement.style.width = `${width}px`;
        videoElement.muted = true;
        videoElement.setAttribute("muted", "true");
        (<any>videoElement).playsInline = true;
        return videoElement;
    }

    private possiblyUpdateShaders(qrMatch: boolean) {
        if (this.qrMatch === qrMatch) {
            return;
        }

        if (this.hasBorderShaders
            && this.borderShaders
            && this.borderShaders.length) {
            this.borderShaders.forEach(shader => {
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
            this.lastScanImageFile = undefined;
        }
    }

    private createCanvasElement(
        width: number, height: number, customId?: string): HTMLCanvasElement {
        const canvasWidth = width;
        const canvasHeight = height;
        const canvasElement = document.createElement('canvas');
        canvasElement.style.width = `${canvasWidth}px`;
        canvasElement.style.height = `${canvasHeight}px`;
        canvasElement.style.display = "none";
        // This id is set by lazarsoft/jsqrcode
        canvasElement.id = customId == undefined ? 'qr-canvas' : customId;
        return canvasElement;
    }

    private getShadedRegionBounds(
        width: number, height: number, qrboxSize: number): QrcodeRegionBounds {
        if (qrboxSize > width || qrboxSize > height) {
            throw "'config.qrbox' should not be greater than the "
            + "width and height of the HTML element.";
        }

        return {
            x: (width - qrboxSize) / 2,
            y: (height - qrboxSize) / 2,
            width: qrboxSize,
            height: qrboxSize
        };
    }

    private possiblyInsertShadingElement(
        element: HTMLElement,
        width: number,
        height: number,
        qrboxSize: number) {
        if ((width - qrboxSize) < 1 || (height - qrboxSize) < 1) {
          return;
        }
        const shadingElement = document.createElement('div');
        shadingElement.style.position = "absolute";
        shadingElement.style.borderLeft
            = `${(width-qrboxSize)/2}px solid #0000007a`;
        shadingElement.style.borderRight
            = `${(width-qrboxSize)/2}px solid #0000007a`;
        shadingElement.style.borderTop
            = `${(height-qrboxSize)/2}px solid #0000007a`;
        shadingElement.style.borderBottom
            = `${(height-qrboxSize)/2}px solid #0000007a`;
        shadingElement.style.boxSizing = "border-box";
        shadingElement.style.top = "0px";
        shadingElement.style.bottom = "0px";
        shadingElement.style.left = "0px";
        shadingElement.style.right = "0px";
        shadingElement.id = `${Constants.SHADED_REGION_CLASSNAME}`;
  
        // Check if div is too small for shadows. As there are two 5px width
        // borders the needs to have a size above 10px.
        if ((width - qrboxSize) < 11 || (height - qrboxSize) < 11) {
          this.hasBorderShaders = false;
        } else {
          const smallSize = 5;
          const largeSize = 40;
          this.insertShaderBorders(
              shadingElement, largeSize, smallSize, -smallSize, 0, true);
          this.insertShaderBorders(
              shadingElement, largeSize, smallSize, -smallSize, 0, false);
          this.insertShaderBorders(
              shadingElement,
              largeSize,
              smallSize,
              qrboxSize + smallSize,
              0,
              true);
          this.insertShaderBorders(
              shadingElement,
              largeSize,
              smallSize,
              qrboxSize + smallSize,
              0,
              false);
          this.insertShaderBorders(
              shadingElement,
              smallSize,
              largeSize + smallSize,
              -smallSize,
              -smallSize,
              true);
          this.insertShaderBorders(
              shadingElement,
              smallSize,
              largeSize + smallSize,
              qrboxSize + smallSize - largeSize,
              -smallSize,
              true);
          this.insertShaderBorders(
              shadingElement,
              smallSize,
              largeSize + smallSize,
              -smallSize,
              -smallSize,
              false);
          this.insertShaderBorders(
              shadingElement,
              smallSize,
              largeSize + smallSize,
              qrboxSize + smallSize - largeSize,
              -smallSize,
              false);
          this.hasBorderShaders = true;
        }
        element.append(shadingElement);
    }

    private insertShaderBorders(
        shaderElem: HTMLDivElement,
        width: number,
        height: number,
        top: number,
        side: number,
        isLeft: boolean) {
        const elem = document.createElement("div");
        elem.style.position = "absolute";
        elem.style.backgroundColor = Constants.BORDER_SHADER_DEFAULT_COLOR;
        elem.style.width = `${width}px`;
        elem.style.height = `${height}px`;
        elem.style.top = `${top}px`;
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

    private getTimeoutFps(fps: number) {
        return 1000 / fps;
    }
    //#endregion
}
