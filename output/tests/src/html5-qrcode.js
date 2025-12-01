"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Html5Qrcode = void 0;
const core_1 = require("./core");
const strings_1 = require("./strings");
const utils_1 = require("./utils");
const code_decoder_1 = require("./code-decoder");
const factories_1 = require("./camera/factories");
const retriever_1 = require("./camera/retriever");
const state_manager_1 = require("./state-manager");
class Constants extends core_1.Html5QrcodeConstants {
}
Constants.DEFAULT_WIDTH = 300;
Constants.DEFAULT_WIDTH_OFFSET = 2;
Constants.FILE_SCAN_MIN_HEIGHT = 300;
Constants.FILE_SCAN_HIDDEN_CANVAS_PADDING = 100;
Constants.MIN_QR_BOX_SIZE = 50;
Constants.SHADED_LEFT = 1;
Constants.SHADED_RIGHT = 2;
Constants.SHADED_TOP = 3;
Constants.SHADED_BOTTOM = 4;
Constants.SHADED_REGION_ELEMENT_ID = "qr-shaded-region";
Constants.VERBOSE = false;
Constants.BORDER_SHADER_DEFAULT_COLOR = "#ffffff";
Constants.BORDER_SHADER_MATCH_COLOR = "rgb(90, 193, 56)";
class InternalHtml5QrcodeConfig {
    constructor(config, logger) {
        this.logger = logger;
        this.fps = Constants.SCAN_DEFAULT_FPS;
        if (!config) {
            this.disableFlip = Constants.DEFAULT_DISABLE_FLIP;
        }
        else {
            if (config.fps) {
                this.fps = config.fps;
            }
            this.disableFlip = config.disableFlip === true;
            this.qrbox = config.qrbox;
            this.aspectRatio = config.aspectRatio;
            this.videoConstraints = config.videoConstraints;
        }
    }
    isMediaStreamConstraintsValid() {
        if (!this.videoConstraints) {
            this.logger.logError("Empty videoConstraints", true);
            return false;
        }
        return utils_1.VideoConstraintsUtil.isMediaStreamConstraintsValid(this.videoConstraints, this.logger);
    }
    isShadedBoxEnabled() {
        return !(0, core_1.isNullOrUndefined)(this.qrbox);
    }
    static create(config, logger) {
        return new InternalHtml5QrcodeConfig(config, logger);
    }
}
class Html5Qrcode {
    constructor(elementId, configOrVerbosityFlag) {
        this.element = null;
        this.canvasElement = null;
        this.scannerPausedUiElement = null;
        this.hasBorderShaders = null;
        this.borderShaders = null;
        this.qrMatch = null;
        this.renderedCamera = null;
        this.qrRegion = null;
        this.context = null;
        this.lastScanImageFile = null;
        this.isScanning = false;
        if (!document.getElementById(elementId)) {
            throw `HTML Element with id=${elementId} not found`;
        }
        this.elementId = elementId;
        this.verbose = false;
        let experimentalFeatureConfig;
        let configObject;
        if (typeof configOrVerbosityFlag == "boolean") {
            this.verbose = configOrVerbosityFlag === true;
        }
        else if (configOrVerbosityFlag) {
            configObject = configOrVerbosityFlag;
            this.verbose = configObject.verbose === true;
            experimentalFeatureConfig = configObject.experimentalFeatures;
        }
        this.logger = new core_1.BaseLoggger(this.verbose);
        this.qrcode = new code_decoder_1.Html5QrcodeShim(this.getSupportedFormats(configOrVerbosityFlag), this.getUseBarCodeDetectorIfSupported(configObject), this.verbose, this.logger);
        this.foreverScanTimeout;
        this.shouldScan = true;
        this.stateManagerProxy = state_manager_1.StateManagerFactory.create();
    }
    start(cameraIdOrConfig, configuration, qrCodeSuccessCallback, qrCodeErrorCallback) {
        if (!cameraIdOrConfig) {
            throw "cameraIdOrConfig is required";
        }
        if (!qrCodeSuccessCallback
            || typeof qrCodeSuccessCallback != "function") {
            throw "qrCodeSuccessCallback is required and should be a function.";
        }
        let qrCodeErrorCallbackInternal;
        if (qrCodeErrorCallback) {
            qrCodeErrorCallbackInternal = qrCodeErrorCallback;
        }
        else {
            qrCodeErrorCallbackInternal
                = this.verbose ? this.logger.log : () => { };
        }
        const internalConfig = InternalHtml5QrcodeConfig.create(configuration, this.logger);
        this.clearElement();
        let videoConstraintsAvailableAndValid = false;
        if (internalConfig.videoConstraints) {
            if (!internalConfig.isMediaStreamConstraintsValid()) {
                this.logger.logError("'videoConstraints' is not valid 'MediaStreamConstraints, "
                    + "it will be ignored.'", true);
            }
            else {
                videoConstraintsAvailableAndValid = true;
            }
        }
        const areVideoConstraintsEnabled = videoConstraintsAvailableAndValid;
        const element = document.getElementById(this.elementId);
        const rootElementWidth = element.clientWidth
            ? element.clientWidth : Constants.DEFAULT_WIDTH;
        element.style.position = "relative";
        this.shouldScan = true;
        this.element = element;
        const $this = this;
        const toScanningStateChangeTransaction = this.stateManagerProxy.startTransition(state_manager_1.Html5QrcodeScannerState.SCANNING);
        return new Promise((resolve, reject) => {
            const videoConstraints = areVideoConstraintsEnabled
                ? internalConfig.videoConstraints
                : $this.createVideoConstraints(cameraIdOrConfig);
            if (!videoConstraints) {
                toScanningStateChangeTransaction.cancel();
                reject("videoConstraints should be defined");
                return;
            }
            let cameraRenderingOptions = {};
            if (!areVideoConstraintsEnabled || internalConfig.aspectRatio) {
                cameraRenderingOptions.aspectRatio = internalConfig.aspectRatio;
            }
            let renderingCallbacks = {
                onRenderSurfaceReady: (viewfinderWidth, viewfinderHeight) => {
                    $this.setupUi(viewfinderWidth, viewfinderHeight, internalConfig);
                    $this.isScanning = true;
                    $this.foreverScan(internalConfig, qrCodeSuccessCallback, qrCodeErrorCallbackInternal);
                }
            };
            factories_1.CameraFactory.failIfNotSupported().then((factory) => {
                factory.create(videoConstraints).then((camera) => {
                    return camera.render(this.element, cameraRenderingOptions, renderingCallbacks)
                        .then((renderedCamera) => {
                        $this.renderedCamera = renderedCamera;
                        toScanningStateChangeTransaction.execute();
                        resolve(null);
                    })
                        .catch((error) => {
                        toScanningStateChangeTransaction.cancel();
                        reject(error);
                    });
                }).catch((error) => {
                    toScanningStateChangeTransaction.cancel();
                    reject(strings_1.Html5QrcodeStrings.errorGettingUserMedia(error));
                });
            }).catch((_) => {
                toScanningStateChangeTransaction.cancel();
                reject(strings_1.Html5QrcodeStrings.cameraStreamingNotSupported());
            });
        });
    }
    pause(shouldPauseVideo) {
        if (!this.stateManagerProxy.isStrictlyScanning()) {
            throw "Cannot pause, scanner is not scanning.";
        }
        this.stateManagerProxy.directTransition(state_manager_1.Html5QrcodeScannerState.PAUSED);
        this.showPausedState();
        if ((0, core_1.isNullOrUndefined)(shouldPauseVideo) || shouldPauseVideo !== true) {
            shouldPauseVideo = false;
        }
        if (shouldPauseVideo && this.renderedCamera) {
            this.renderedCamera.pause();
        }
    }
    resume() {
        if (!this.stateManagerProxy.isPaused()) {
            throw "Cannot result, scanner is not paused.";
        }
        if (!this.renderedCamera) {
            throw "renderedCamera doesn't exist while trying resume()";
        }
        const $this = this;
        const transitionToScanning = () => {
            $this.stateManagerProxy.directTransition(state_manager_1.Html5QrcodeScannerState.SCANNING);
            $this.hidePausedState();
        };
        if (!this.renderedCamera.isPaused()) {
            transitionToScanning();
            return;
        }
        this.renderedCamera.resume(() => {
            transitionToScanning();
        });
    }
    getState() {
        return this.stateManagerProxy.getState();
    }
    stop() {
        if (!this.stateManagerProxy.isScanning()) {
            throw "Cannot stop, scanner is not running or paused.";
        }
        const toStoppedStateTransaction = this.stateManagerProxy.startTransition(state_manager_1.Html5QrcodeScannerState.NOT_STARTED);
        this.shouldScan = false;
        if (this.foreverScanTimeout) {
            clearTimeout(this.foreverScanTimeout);
        }
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
        return this.renderedCamera.close().then(() => {
            $this.renderedCamera = null;
            if ($this.element) {
                $this.element.removeChild($this.canvasElement);
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
    scanFile(imageFile, showImage) {
        return this.scanFileV2(imageFile, showImage)
            .then((html5qrcodeResult) => html5qrcodeResult.decodedText);
    }
    scanFileV2(imageFile, showImage) {
        if (!imageFile || !(imageFile instanceof File)) {
            throw "imageFile argument is mandatory and should be instance "
                + "of File. Use 'event.target.files[0]'.";
        }
        if ((0, core_1.isNullOrUndefined)(showImage)) {
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
                const element = document.getElementById(this.elementId);
                const containerWidth = element.clientWidth
                    ? element.clientWidth : Constants.DEFAULT_WIDTH;
                const containerHeight = Math.max(element.clientHeight ? element.clientHeight : imageHeight, Constants.FILE_SCAN_MIN_HEIGHT);
                const config = this.computeCanvasDrawConfig(imageWidth, imageHeight, containerWidth, containerHeight);
                if (showImage) {
                    const visibleCanvas = this.createCanvasElement(containerWidth, containerHeight, "qr-canvas-visible");
                    visibleCanvas.style.display = "inline-block";
                    element.appendChild(visibleCanvas);
                    const context = visibleCanvas.getContext("2d");
                    if (!context) {
                        throw "Unable to get 2d context from canvas";
                    }
                    context.canvas.width = containerWidth;
                    context.canvas.height = containerHeight;
                    context.drawImage(inputImage, 0, 0, imageWidth, imageHeight, config.x, config.y, config.width, config.height);
                }
                let padding = Constants.FILE_SCAN_HIDDEN_CANVAS_PADDING;
                let hiddenImageWidth = Math.max(inputImage.width, config.width);
                let hiddenImageHeight = Math.max(inputImage.height, config.height);
                let hiddenCanvasWidth = hiddenImageWidth + 2 * padding;
                let hiddenCanvasHeight = hiddenImageHeight + 2 * padding;
                const hiddenCanvas = this.createCanvasElement(hiddenCanvasWidth, hiddenCanvasHeight);
                element.appendChild(hiddenCanvas);
                const context = hiddenCanvas.getContext("2d");
                if (!context) {
                    throw "Unable to get 2d context from canvas";
                }
                context.canvas.width = hiddenCanvasWidth;
                context.canvas.height = hiddenCanvasHeight;
                context.drawImage(inputImage, 0, 0, imageWidth, imageHeight, padding, padding, hiddenImageWidth, hiddenImageHeight);
                try {
                    this.qrcode.decodeRobustlyAsync(hiddenCanvas)
                        .then((result) => {
                        resolve(core_1.Html5QrcodeResultFactory.createFromQrcodeResult(result));
                    })
                        .catch(reject);
                }
                catch (exception) {
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
    clear() {
        this.clearElement();
    }
    static getCameras() {
        return retriever_1.CameraRetriever.retrieve();
    }
    getRunningTrackCapabilities() {
        return this.getRenderedCameraOrFail().getRunningTrackCapabilities();
    }
    getRunningTrackSettings() {
        return this.getRenderedCameraOrFail().getRunningTrackSettings();
    }
    getRunningTrackCameraCapabilities() {
        return this.getRenderedCameraOrFail().getCapabilities();
    }
    applyVideoConstraints(videoConstaints) {
        if (!videoConstaints) {
            throw "videoConstaints is required argument.";
        }
        else if (!utils_1.VideoConstraintsUtil.isMediaStreamConstraintsValid(videoConstaints, this.logger)) {
            throw "invalid videoConstaints passed, check logs for more details";
        }
        return this.getRenderedCameraOrFail().applyVideoConstraints(videoConstaints);
    }
    getRenderedCameraOrFail() {
        if (this.renderedCamera == null) {
            throw "Scanning is not in running state, call this API only when"
                + " QR code scanning using camera is in running state.";
        }
        return this.renderedCamera;
    }
    getSupportedFormats(configOrVerbosityFlag) {
        const allFormats = [
            core_1.Html5QrcodeSupportedFormats.QR_CODE,
            core_1.Html5QrcodeSupportedFormats.AZTEC,
            core_1.Html5QrcodeSupportedFormats.CODABAR,
            core_1.Html5QrcodeSupportedFormats.CODE_39,
            core_1.Html5QrcodeSupportedFormats.CODE_93,
            core_1.Html5QrcodeSupportedFormats.CODE_128,
            core_1.Html5QrcodeSupportedFormats.DATA_MATRIX,
            core_1.Html5QrcodeSupportedFormats.MAXICODE,
            core_1.Html5QrcodeSupportedFormats.ITF,
            core_1.Html5QrcodeSupportedFormats.EAN_13,
            core_1.Html5QrcodeSupportedFormats.EAN_8,
            core_1.Html5QrcodeSupportedFormats.PDF_417,
            core_1.Html5QrcodeSupportedFormats.RSS_14,
            core_1.Html5QrcodeSupportedFormats.RSS_EXPANDED,
            core_1.Html5QrcodeSupportedFormats.UPC_A,
            core_1.Html5QrcodeSupportedFormats.UPC_E,
            core_1.Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
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
        const supportedFormats = [];
        for (const format of configOrVerbosityFlag.formatsToSupport) {
            if ((0, core_1.isValidHtml5QrcodeSupportedFormats)(format)) {
                supportedFormats.push(format);
            }
            else {
                this.logger.warn(`Invalid format: ${format} passed in config, ignoring.`);
            }
        }
        if (supportedFormats.length === 0) {
            throw "None of formatsToSupport match supported values.";
        }
        return supportedFormats;
    }
    getUseBarCodeDetectorIfSupported(config) {
        if ((0, core_1.isNullOrUndefined)(config)) {
            return true;
        }
        if (!(0, core_1.isNullOrUndefined)(config.useBarCodeDetectorIfSupported)) {
            return config.useBarCodeDetectorIfSupported !== false;
        }
        if ((0, core_1.isNullOrUndefined)(config.experimentalFeatures)) {
            return true;
        }
        let experimentalFeatures = config.experimentalFeatures;
        if ((0, core_1.isNullOrUndefined)(experimentalFeatures.useBarCodeDetectorIfSupported)) {
            return true;
        }
        return experimentalFeatures.useBarCodeDetectorIfSupported !== false;
    }
    validateQrboxSize(viewfinderWidth, viewfinderHeight, internalConfig) {
        const qrboxSize = internalConfig.qrbox;
        this.validateQrboxConfig(qrboxSize);
        let qrDimensions = this.toQrdimensions(viewfinderWidth, viewfinderHeight, qrboxSize);
        const validateMinSize = (size) => {
            if (size < Constants.MIN_QR_BOX_SIZE) {
                throw "minimum size of 'config.qrbox' dimension value is"
                    + ` ${Constants.MIN_QR_BOX_SIZE}px.`;
            }
        };
        const correctWidthBasedOnRootElementSize = (configWidth) => {
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
        qrDimensions.width = correctWidthBasedOnRootElementSize(qrDimensions.width);
    }
    validateQrboxConfig(qrboxSize) {
        if (typeof qrboxSize === "number") {
            return;
        }
        if (typeof qrboxSize === "function") {
            return;
        }
        if (qrboxSize.width === undefined || qrboxSize.height === undefined) {
            throw "Invalid instance of QrDimensions passed for "
                + "'config.qrbox'. Both 'width' and 'height' should be set.";
        }
    }
    toQrdimensions(viewfinderWidth, viewfinderHeight, qrboxSize) {
        if (typeof qrboxSize === "number") {
            return { width: qrboxSize, height: qrboxSize };
        }
        else if (typeof qrboxSize === "function") {
            try {
                return qrboxSize(viewfinderWidth, viewfinderHeight);
            }
            catch (error) {
                throw new Error("qrbox config was passed as a function but it failed with "
                    + "unknown error" + error);
            }
        }
        return qrboxSize;
    }
    setupUi(viewfinderWidth, viewfinderHeight, internalConfig) {
        if (internalConfig.isShadedBoxEnabled()) {
            this.validateQrboxSize(viewfinderWidth, viewfinderHeight, internalConfig);
        }
        const qrboxSize = (0, core_1.isNullOrUndefined)(internalConfig.qrbox) ?
            { width: viewfinderWidth, height: viewfinderHeight } : internalConfig.qrbox;
        this.validateQrboxConfig(qrboxSize);
        let qrDimensions = this.toQrdimensions(viewfinderWidth, viewfinderHeight, qrboxSize);
        if (qrDimensions.height > viewfinderHeight) {
            this.logger.warn("[Html5Qrcode] config.qrbox has height that is"
                + "greater than the height of the video stream. Shading will be"
                + " ignored");
        }
        const shouldShadingBeApplied = internalConfig.isShadedBoxEnabled()
            && qrDimensions.height <= viewfinderHeight;
        const defaultQrRegion = {
            x: 0,
            y: 0,
            width: viewfinderWidth,
            height: viewfinderHeight
        };
        const qrRegion = shouldShadingBeApplied
            ? this.getShadedRegionBounds(viewfinderWidth, viewfinderHeight, qrDimensions)
            : defaultQrRegion;
        const canvasElement = this.createCanvasElement(qrRegion.width, qrRegion.height);
        const contextAttributes = { willReadFrequently: true };
        const context = canvasElement.getContext("2d", contextAttributes);
        context.canvas.width = qrRegion.width;
        context.canvas.height = qrRegion.height;
        this.element.append(canvasElement);
        if (shouldShadingBeApplied) {
            this.possiblyInsertShadingElement(this.element, viewfinderWidth, viewfinderHeight, qrDimensions);
        }
        this.createScannerPausedUiElement(this.element);
        this.qrRegion = qrRegion;
        this.context = context;
        this.canvasElement = canvasElement;
    }
    createScannerPausedUiElement(rootElement) {
        const scannerPausedUiElement = document.createElement("div");
        scannerPausedUiElement.innerText = strings_1.Html5QrcodeStrings.scannerPaused();
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
    scanContext(qrCodeSuccessCallback, qrCodeErrorCallback) {
        if (this.stateManagerProxy.isPaused()) {
            return Promise.resolve(false);
        }
        return this.qrcode.decodeAsync(this.canvasElement)
            .then((result) => {
            qrCodeSuccessCallback(result.text, core_1.Html5QrcodeResultFactory.createFromQrcodeResult(result));
            this.possiblyUpdateShaders(true);
            return true;
        }).catch((error) => {
            this.possiblyUpdateShaders(false);
            let errorMessage = strings_1.Html5QrcodeStrings.codeParseError(error);
            qrCodeErrorCallback(errorMessage, core_1.Html5QrcodeErrorFactory.createFrom(errorMessage));
            return false;
        });
    }
    foreverScan(internalConfig, qrCodeSuccessCallback, qrCodeErrorCallback) {
        if (!this.shouldScan) {
            return;
        }
        if (!this.renderedCamera) {
            return;
        }
        const videoElement = this.renderedCamera.getSurface();
        const widthRatio = videoElement.videoWidth / videoElement.clientWidth;
        const heightRatio = videoElement.videoHeight / videoElement.clientHeight;
        if (!this.qrRegion) {
            throw "qrRegion undefined when localMediaStream is ready.";
        }
        const sWidthOffset = this.qrRegion.width * widthRatio;
        const sHeightOffset = this.qrRegion.height * heightRatio;
        const sxOffset = this.qrRegion.x * widthRatio;
        const syOffset = this.qrRegion.y * heightRatio;
        this.context.drawImage(videoElement, sxOffset, syOffset, sWidthOffset, sHeightOffset, 0, 0, this.qrRegion.width, this.qrRegion.height);
        const triggerNextScan = () => {
            this.foreverScanTimeout = setTimeout(() => {
                this.foreverScan(internalConfig, qrCodeSuccessCallback, qrCodeErrorCallback);
            }, this.getTimeoutFps(internalConfig.fps));
        };
        this.scanContext(qrCodeSuccessCallback, qrCodeErrorCallback)
            .then((isSuccessfull) => {
            if (!isSuccessfull && internalConfig.disableFlip !== true) {
                this.context.translate(this.context.canvas.width, 0);
                this.context.scale(-1, 1);
                this.scanContext(qrCodeSuccessCallback, qrCodeErrorCallback)
                    .finally(() => {
                    triggerNextScan();
                });
            }
            else {
                triggerNextScan();
            }
        }).catch((error) => {
            this.logger.logError("Error happend while scanning context", error);
            triggerNextScan();
        });
    }
    createVideoConstraints(cameraIdOrConfig) {
        if (typeof cameraIdOrConfig == "string") {
            return { deviceId: { exact: cameraIdOrConfig } };
        }
        else if (typeof cameraIdOrConfig == "object") {
            const facingModeKey = "facingMode";
            const deviceIdKey = "deviceId";
            const allowedFacingModeValues = { "user": true, "environment": true };
            const exactKey = "exact";
            const isValidFacingModeValue = (value) => {
                if (value in allowedFacingModeValues) {
                    return true;
                }
                else {
                    throw "config has invalid 'facingMode' value = "
                        + `'${value}'`;
                }
            };
            const keys = Object.keys(cameraIdOrConfig);
            if (keys.length !== 1) {
                throw "'cameraIdOrConfig' object should have exactly 1 key,"
                    + ` if passed as an object, found ${keys.length} keys`;
            }
            const key = Object.keys(cameraIdOrConfig)[0];
            if (key !== facingModeKey && key !== deviceIdKey) {
                throw `Only '${facingModeKey}' and '${deviceIdKey}' `
                    + " are supported for 'cameraIdOrConfig'";
            }
            if (key === facingModeKey) {
                const facingMode = cameraIdOrConfig.facingMode;
                if (typeof facingMode == "string") {
                    if (isValidFacingModeValue(facingMode)) {
                        return { facingMode: facingMode };
                    }
                }
                else if (typeof facingMode == "object") {
                    if (exactKey in facingMode) {
                        if (isValidFacingModeValue(facingMode[`${exactKey}`])) {
                            return {
                                facingMode: {
                                    exact: facingMode[`${exactKey}`]
                                }
                            };
                        }
                    }
                    else {
                        throw "'facingMode' should be string or object with"
                            + ` ${exactKey} as key.`;
                    }
                }
                else {
                    const type = (typeof facingMode);
                    throw `Invalid type of 'facingMode' = ${type}`;
                }
            }
            else {
                const deviceId = cameraIdOrConfig.deviceId;
                if (typeof deviceId == "string") {
                    return { deviceId: deviceId };
                }
                else if (typeof deviceId == "object") {
                    if (exactKey in deviceId) {
                        return {
                            deviceId: { exact: deviceId[`${exactKey}`] }
                        };
                    }
                    else {
                        throw "'deviceId' should be string or object with"
                            + ` ${exactKey} as key.`;
                    }
                }
                else {
                    const type = (typeof deviceId);
                    throw `Invalid type of 'deviceId' = ${type}`;
                }
            }
        }
        const type = (typeof cameraIdOrConfig);
        throw `Invalid type of 'cameraIdOrConfig' = ${type}`;
    }
    computeCanvasDrawConfig(imageWidth, imageHeight, containerWidth, containerHeight) {
        if (imageWidth <= containerWidth
            && imageHeight <= containerHeight) {
            const xoffset = (containerWidth - imageWidth) / 2;
            const yoffset = (containerHeight - imageHeight) / 2;
            return {
                x: xoffset,
                y: yoffset,
                width: imageWidth,
                height: imageHeight
            };
        }
        else {
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
            this.logger.log("Image downsampled from "
                + `${formerImageWidth}X${formerImageHeight}`
                + ` to ${imageWidth}X${imageHeight}.`);
            return this.computeCanvasDrawConfig(imageWidth, imageHeight, containerWidth, containerHeight);
        }
    }
    clearElement() {
        if (this.stateManagerProxy.isScanning()) {
            throw "Cannot clear while scan is ongoing, close it first.";
        }
        const element = document.getElementById(this.elementId);
        if (element) {
            element.innerHTML = "";
        }
    }
    possiblyUpdateShaders(qrMatch) {
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
    possiblyCloseLastScanImageFile() {
        if (this.lastScanImageFile) {
            URL.revokeObjectURL(this.lastScanImageFile);
            this.lastScanImageFile = null;
        }
    }
    createCanvasElement(width, height, customId) {
        const canvasWidth = width;
        const canvasHeight = height;
        const canvasElement = document.createElement("canvas");
        canvasElement.style.width = `${canvasWidth}px`;
        canvasElement.style.height = `${canvasHeight}px`;
        canvasElement.style.display = "none";
        canvasElement.id = (0, core_1.isNullOrUndefined)(customId)
            ? "qr-canvas" : customId;
        return canvasElement;
    }
    getShadedRegionBounds(width, height, qrboxSize) {
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
    possiblyInsertShadingElement(element, width, height, qrboxSize) {
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
        if ((width - qrboxSize.width) < 11
            || (height - qrboxSize.height) < 11) {
            this.hasBorderShaders = false;
        }
        else {
            const smallSize = 5;
            const largeSize = 40;
            this.insertShaderBorders(shadingElement, largeSize, smallSize, -smallSize, null, 0, true);
            this.insertShaderBorders(shadingElement, largeSize, smallSize, -smallSize, null, 0, false);
            this.insertShaderBorders(shadingElement, largeSize, smallSize, null, -smallSize, 0, true);
            this.insertShaderBorders(shadingElement, largeSize, smallSize, null, -smallSize, 0, false);
            this.insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, -smallSize, null, -smallSize, true);
            this.insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, null, -smallSize, -smallSize, true);
            this.insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, -smallSize, null, -smallSize, false);
            this.insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, null, -smallSize, -smallSize, false);
            this.hasBorderShaders = true;
        }
        element.append(shadingElement);
    }
    insertShaderBorders(shaderElem, width, height, top, bottom, side, isLeft) {
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
        }
        else {
            elem.style.right = `${side}px`;
        }
        if (!this.borderShaders) {
            this.borderShaders = [];
        }
        this.borderShaders.push(elem);
        shaderElem.appendChild(elem);
    }
    showPausedState() {
        if (!this.scannerPausedUiElement) {
            throw "[internal error] scanner paused UI element not found";
        }
        this.scannerPausedUiElement.style.display = "block";
    }
    hidePausedState() {
        if (!this.scannerPausedUiElement) {
            throw "[internal error] scanner paused UI element not found";
        }
        this.scannerPausedUiElement.style.display = "none";
    }
    getTimeoutFps(fps) {
        return 1000 / fps;
    }
}
exports.Html5Qrcode = Html5Qrcode;
//# sourceMappingURL=html5-qrcode.js.map