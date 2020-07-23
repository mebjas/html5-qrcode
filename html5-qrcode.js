/**
 * @fileoverview
 * HTML5 QR code scanning library.
 * - Decode QR Code using web cam or smartphone camera
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 * 
 * Note: ECMA Script is not supported by all browsers. Use minified/html5-qrcode.min.js for better
 * browser support. Alternatively the transpiled code lives in transpiled/html5-qrcode.js
 */
class Html5Qrcode {
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

    /**
     * Initialize QR Code scanner.
     * 
     * @param {String} elementId - Id of the HTML element. 
     * @param {Boolean} verbose - Optional argument, if true, all logs
     *                  would be printed to console. 
     */
    constructor(elementId, verbose) {
        if (!getLazarSoftScanner) {
            throw 'Use html5qrcode.min.js without edit, getLazarSoftScanner'
            + 'not found.';
        }

        this.qrcode = getLazarSoftScanner();
        if (!this.qrcode) {
            throw 'qrcode is not defined, use the minified/html5-qrcode.min.js'
            + ' for proper support';
        }

        this._elementId = elementId;
        this._foreverScanTimeout = null;
        this._localMediaStream = null;
        this._shouldScan = true;
        this._url
            = window.URL || window.webkitURL || window.mozURL || window.msURL;
        this._userMedia
            = navigator.getUserMedia || navigator.webkitGetUserMedia
            || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        this._isScanning = false;

        Html5Qrcode.VERBOSE = verbose === true;
    }

    /**
     * Start scanning QR Code for given camera.
     * 
     * @param {String} cameraId Id of the camera to use.
     * @param {Object} config extra configurations to tune QR code scanner.
     *  Supported Fields:
     *      - fps: expected framerate of qr code scanning. example { fps: 2 }
     *          means the scanning would be done every 500 ms.
     *      - qrbox: width of QR scanning box, this should be smaller than
     *          the width and height of the box. This would make the scanner
     *          look like this:
     *          ----------------------
     *          |********************|
     *          |******,,,,,,,,,*****|      <--- shaded region
     *          |******|       |*****|      <--- non shaded region would be
     *          |******|       |*****|          used for QR code scanning.
     *          |******|_______|*****|
     *          |********************|
     *          |********************|
     *          ----------------------
     * @param {Function} qrCodeSuccessCallback callback on QR Code found.
     *  Example:
     *      function(qrCodeMessage) {}
     * @param {Function} qrCodeErrorCallback callback on QR Code parse error.
     *  Example:
     *      function(errorMessage) {}
     * 
     * @returns Promise for starting the scan. The Promise can fail if the user
     * doesn't grant permission or some API is not supported by the browser.
     */
    start(cameraId,
        configuration,
        qrCodeSuccessCallback,
        qrCodeErrorCallback) {
        if (!cameraId) {
            throw "cameraId is required";
        }

        if (!qrCodeSuccessCallback
            || typeof qrCodeSuccessCallback != "function") {
            throw "qrCodeSuccessCallback is required and should be a function."
        }

        if (!qrCodeErrorCallback) {
            qrCodeErrorCallback = console.log;
        }

        // Cleanup.
        this._clearElement();
        const $this = this;

        // Create configuration by merging default and input settings.
        const config = configuration ? configuration : {};
        config.fps = config.fps ? config.fps : Html5Qrcode.SCAN_DEFAULT_FPS;

        // qr shaded box
        const isShadedBoxEnabled = config.qrbox != undefined;
        const element = document.getElementById(this._elementId);
        const width = element.clientWidth
            ? element.clientWidth : Html5Qrcode.DEFAULT_WIDTH;
        element.style.position = "relative";

        this._shouldScan = true;
        this._element = element;
        this.qrcode.callback = qrCodeSuccessCallback;

        // Validate before insertion
        if (isShadedBoxEnabled) {
            const qrboxSize = config.qrbox;
            if (qrboxSize < Html5Qrcode.MIN_QR_BOX_SIZE) {
                throw "minimum size of 'config.qrbox' is"
                + ` ${Html5Qrcode.MIN_QR_BOX_SIZE}px.`;
            }

            if (qrboxSize > width) {
                throw "'config.qrbox' should not be greater than the "
                + "width of the HTML element.";
            }
        }

        //#region local methods
        /**
         * Setups the UI elements, changes the state of this class.
         * 
         * @param width derived width of viewfinder.
         * @param height derived height of viewfinder.
         */
        const setupUi = (width, height) => {
            const qrboxSize = config.qrbox;
            if (qrboxSize > height) {
                console.warn("[Html5Qrcode] config.qrboxsize is greater "
                    + "than video height. Shading will be ignored");
            }

            const shouldShadingBeApplied
                = isShadedBoxEnabled && qrboxSize <= height;
            const defaultQrRegion = {
                x: 0,
                y: 0,
                width: width,
                height: height
            };
            const qrRegion = shouldShadingBeApplied
                ? this._getShadedRegionBounds(width, height, qrboxSize)
                : defaultQrRegion;

            const canvasElement = this._createCanvasElement(
                qrRegion.width, qrRegion.height);
            const context = canvasElement.getContext('2d');
            context.canvas.width = qrRegion.width;
            context.canvas.height = qrRegion.height;

            // Insert the canvas
            element.append(canvasElement);
            if (shouldShadingBeApplied) {
                this._possiblyInsertShadingElement(element, height, qrRegion);
            }

            // Update local states
            $this._qrRegion = qrRegion;
            $this._context = context;
            $this._canvasElement = canvasElement;
        }

        // Method that scans forever.
        const foreverScan = () => {
            if (!$this._shouldScan) {
                // Stop scanning.
                return;
            }
            if ($this._localMediaStream) {

                // There is difference in size of rendered video and one that is
                // considered by the canvas. Need to account for scaling factor.
                const videoElement = $this._videoElement;
                const widthRatio
                    = videoElement.videoWidth / videoElement.clientWidth;
                const heightRatio
                    = videoElement.videoHeight / videoElement.clientHeight;
                const sWidthOffset = $this._qrRegion.width * widthRatio;
                const sHeightOffset = $this._qrRegion.height * heightRatio;

                // Only decode the relevant area, ignore the shaded area,
                // More reference:
                // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
                $this._context.drawImage(
                    $this._videoElement,
                    /* sx= */ $this._qrRegion.x,
                    /* sy= */ $this._qrRegion.y,
                    /* sWidth= */ sWidthOffset,
                    /* sHeight= */ sHeightOffset,
                    /* dx= */ 0,
                    /* dy= */  0,
                    /* dWidth= */ $this._qrRegion.width,
                    /* dHeight= */ $this._qrRegion.height);
                try {
                    $this.qrcode.decode();
                    this._possiblyUpdateShaders(/* qrMatch= */ true);
                } catch (exception) {
                    this._possiblyUpdateShaders(/* qrMatch= */ false);
                    qrCodeErrorCallback(
                        `QR code parse error, error = ${exception}`);
                }
            }
            $this._foreverScanTimeout = setTimeout(
                foreverScan, Html5Qrcode._getTimeoutFps(config.fps));
        }

        // success callback when user media (Camera) is attached.
        const onMediaStreamReceived = mediaStream => {
            return new Promise((resolve, reject) => {
                const setupVideo = () => {
                    const videoElement = this._createVideoElement(width);
                    $this._element.append(videoElement);
                    // Attach listeners to video.
                    videoElement.onabort = reject;
                    videoElement.onerror = reject;
                    videoElement.onplaying = () => {
                        const videoWidth = videoElement.clientWidth;
                        const videoHeight = videoElement.clientHeight;
                        setupUi(videoWidth, videoHeight);

                        // start scanning after video feed has started
                        foreverScan();
                        resolve();
                    }

                    videoElement.srcObject = mediaStream;
                    videoElement.play();

                    // Set state
                    $this._videoElement = videoElement;
                }

                $this._localMediaStream = mediaStream;
                setupVideo();

                // TODO(mebjas): see if constaints can be applied on camera
                // for better results or performance.

                // const constraints = {
                //   width: { min: width , ideal: width, max: width },
                //   frameRate: { ideal: 30, max: 30 }
                // }
                // const track = mediaStream.getVideoTracks()[0];
                // track.applyConstraints(constraints)
                // .then(() => setupVideo())
                // .catch(error => {
                //   console.log("[Warning] [Html5Qrcode] Constriants could not be "
                //     + "satisfied, ignoring constraints", error);
                //   setupVideo();
                // });
            });
        }
        //#endregion

        return new Promise((resolve, reject) => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const videoConstraints = {
                    deviceId: { exact: cameraId }
                };
                navigator.mediaDevices.getUserMedia(
                    { audio: false, video: videoConstraints })
                    .then(stream => {
                        onMediaStreamReceived(stream)
                            .then(_ => {
                                $this._isScanning = true;
                                resolve();
                            })
                            .catch(reject);
                    })
                    .catch(err => {
                        reject(`Error getting userMedia, error = ${err}`);
                    });
            } else if (navigator.getUserMedia) {
                const getCameraConfig = {
                    video: {
                        optional: [{
                            sourceId: cameraId
                        }]
                    }
                };
                navigator.getUserMedia(getCameraConfig,
                    stream => {
                        onMediaStreamReceived(stream)
                            .then(_ => {
                                $this._isScanning = true;
                                resolve();
                            })
                            .catch(reject);
                    }, err => {
                        reject(`Error getting userMedia, error = ${err}`);
                    });
            } else {
                reject("Web camera streaming not supported by the browser.");
            }
        });
    }

    /**
     * Stops streaming QR Code video and scanning. 
     * 
     * @returns Promise for safely closing the video stream.
     */
    stop() {
        // TODO(mebjas): fail fast if the start() wasn't called.
        this._shouldScan = false;
        clearTimeout(this._foreverScanTimeout);

        const $this = this;
        return new Promise((resolve, /* ignore */ reject) => {
            $this.qrcode.callback = null;
            const tracksToClose
                = $this._localMediaStream.getVideoTracks().length;
            var tracksClosed = 0;

            // Removes the shaded region if exists.
            const removeQrRegion = () => {
                while ($this._element.getElementsByClassName(
                    Html5Qrcode.SHADED_REGION_CLASSNAME).length) {
                    const shadedChild = $this._element.getElementsByClassName(
                        Html5Qrcode.SHADED_REGION_CLASSNAME)[0];
                    $this._element.removeChild(shadedChild);
                }
            }

            const onAllTracksClosed = () => {
                $this._localMediaStream = null;
                $this._element.removeChild($this._videoElement);
                $this._element.removeChild($this._canvasElement);
                removeQrRegion();
                $this._isScanning = false;
                if ($this._qrRegion) {
                    $this._qrRegion = null;
                }
                if ($this._context) {
                    $this._context = null;
                }
                resolve(true);
            }

            $this._localMediaStream.getVideoTracks().forEach(videoTrack => {
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
     * @param {File} imageFile a local file with Image content.
     * @param {boolean} showImage if true the Image will be rendered on given
     * element.
     * 
     * @returns Promise with decoded QR code string on success and error message
      *             on failure. Failure could happen due to different reasons:
     *            1. QR Code decode failed because enough patterns not found in
      *                 image.
     *            2. Input file was not image or unable to load the image or
      *                 other image load errors.
     */
    scanFile(imageFile, /* default=true */ showImage) {
        const $this = this;
        if (!imageFile || !(imageFile instanceof File)) {
            throw "imageFile argument is mandatory and should be instance "
            + "of File. Use 'event.target.files[0]'";
        }

        showImage = showImage === undefined ? true : showImage;

        if ($this._isScanning) {
            throw "Close ongoing scan before scanning a file.";
        }

        const computeCanvasDrawConfig = (
            imageWidth,
            imageHeight,
            containerWidth,
            containerHeight) => {

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

                Html5Qrcode._log(
                    "Image downsampled from "
                    + `${formerImageWidth}X${formerImageHeight}`
                    + ` to ${imageWidth}X${imageHeight}.`);

                return computeCanvasDrawConfig(
                    imageWidth, imageHeight, containerWidth, containerHeight);
            }
        }

        return new Promise((resolve, reject) => {
            $this._possiblyCloseLastScanImageFile();
            $this._clearElement();
            $this._lastScanImageFile = imageFile;

            const inputImage = new Image;
            inputImage.onload = () => {
                const imageWidth = inputImage.width;
                const imageHeight = inputImage.height;
                const element = document.getElementById($this._elementId);
                const containerWidth = element.clientWidth
                    ? element.clientWidth : Html5Qrcode.DEFAULT_WIDTH;
                // No default height anymore.
                const containerHeight =  Math.max(
                    element.clientHeight ? element.clientHeight : imageHeight,
                    Html5Qrcode.FILE_SCAN_MIN_HEIGHT);

                const config = computeCanvasDrawConfig(
                    imageWidth, imageHeight, containerWidth, containerHeight);
                if (showImage) {
                    const visibleCanvas = $this._createCanvasElement(
                        containerWidth, containerHeight, 'qr-canvas-visible');
                    visibleCanvas.style.display = "inline-block";
                    element.appendChild(visibleCanvas);
                    const context = visibleCanvas.getContext('2d');
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

                const hiddenCanvas = $this._createCanvasElement(config.width, config.height);
                element.appendChild(hiddenCanvas);
                const context = hiddenCanvas.getContext('2d');
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
                    resolve($this.qrcode.decode());
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
    clear() {
        this._clearElement();
    }

    /**
     * Returns a Promise with list of all cameras supported by the device.
     * 
     * The returned object is a list of result object of type:
     * [{
     *      id: String;     // Id of the camera.
     *      label: String;  // Human readable name of the camera.
     * }]
     */
    static getCameras() {
        return new Promise((resolve, reject) => {
            if (navigator.mediaDevices
                && navigator.mediaDevices.enumerateDevices
                && navigator.mediaDevices.getUserMedia) {
                this._log("navigator.mediaDevices used");
                navigator.mediaDevices.getUserMedia(
                    { audio: false, video: true })
                    .then(stream => {
                        // hacky approach to close any active stream if they are
                        // active.
                        stream.oninactive
                            = _ => this._log("All streams closed");
                        const closeActiveStreams = stream => {
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
                                this._log(`${results.length} results found`);
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
            } else if (MediaStreamTrack && MediaStreamTrack.getSources) {
                this._log("MediaStreamTrack.getSources used");
                const callback = sourceInfos => {
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
                    this._log(`${results.length} results found`);
                    resolve(results);
                }
                MediaStreamTrack.getSources(callback);
            } else {
                this._log("unable to query supported devices.");
                reject("unable to query supported devices.");
            }
        });
    }

    _clearElement() {
        if (this._isScanning) {
            throw 'Cannot clear while scan is ongoing, close it first.';
        }
        const element = document.getElementById(this._elementId);
        element.innerHTML = "";
    }

    _createCanvasElement(width, height, customId) {
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

    _createVideoElement(width) {
        const videoElement = document.createElement('video');
        videoElement.style.width = `${width}px`;
        videoElement.muted = true;
        videoElement.playsInline = true;
        return videoElement;
    }

    _getShadedRegionBounds(width, height, qrboxSize) {
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

    _possiblyInsertShadingElement(element, height, qrRegion) {
        if (qrRegion.x == 0 && qrRegion.y == 0) {
            // No shading
            return;
        }

        const shaders = {};
        shaders[Html5Qrcode.SHADED_LEFT] = this._createShadedElement(
            height, qrRegion, Html5Qrcode.SHADED_LEFT);
        shaders[Html5Qrcode.SHADED_RIGHT] = this._createShadedElement(
            height, qrRegion, Html5Qrcode.SHADED_RIGHT);
        shaders[Html5Qrcode.SHADED_TOP] = this._createShadedElement(
            height, qrRegion, Html5Qrcode.SHADED_TOP);
        shaders[Html5Qrcode.SHADED_BOTTOM] = this._createShadedElement(
            height, qrRegion, Html5Qrcode.SHADED_BOTTOM);

        Object.keys(shaders).forEach(key => element.append(shaders[key]));

        if (qrRegion.x < 10 || qrRegion.y < 10) {
            this.hasBorderShaders = false;
        } else {
            Object.keys(shaders).forEach(key =>
                this._insertShaderBorders(shaders[key], qrRegion, key));
            this.hasBorderShaders = true;
        }

    }

    _createShadedElement(height, qrRegion, shadingPosition) {
        const elem = document.createElement('div');
        elem.style.position = "absolute";
        elem.style.height = `${height}px`;
        elem.className = Html5Qrcode.SHADED_REGION_CLASSNAME;
        elem.id = `${Html5Qrcode.SHADED_REGION_CLASSNAME}_${shadingPosition}`
        // TODO(mebjas): maken this configurable
        elem.style.background = `#0000007a`;
        switch (shadingPosition) {
            case Html5Qrcode.SHADED_LEFT:
                elem.style.top = "0px";
                elem.style.left = "0px";
                elem.style.width = `${qrRegion.x}px`;
                elem.style.height = `${height}px`;
                break;
            case Html5Qrcode.SHADED_RIGHT:
                elem.style.top = "0px";
                elem.style.right = "0px";
                elem.style.width = `${qrRegion.x}px`;
                elem.style.height = `${height}px`;
                break;
            case Html5Qrcode.SHADED_TOP:
                elem.style.top = "0px";
                elem.style.left = `${qrRegion.x}px`;
                elem.style.width = `${qrRegion.width}px`;
                elem.style.height = `${qrRegion.y}px`;
                break;
            case Html5Qrcode.SHADED_BOTTOM:
                const top = qrRegion.y + qrRegion.height;
                elem.style.top = `${top}px`;
                elem.style.left = `${qrRegion.x}px`;
                elem.style.width = `${qrRegion.width}px`;
                elem.style.height = `${qrRegion.y}px`;
                break;
            default:
                throw "Unsupported shadingPosition";
        }

        return elem;
    }

    _insertShaderBorders(shaderElem, qrRegion, shadingPosition) {
        shadingPosition = parseInt(shadingPosition);
        const $this = this;
        const borderOffset = 5;
        const smallSize = 5;
        const largeSize = 40;
        const createBorder = () => {
            const elem = document.createElement("div");
            elem.style.position = "absolute";
            elem.style.backgroundColor
                = Html5Qrcode.BORDER_SHADER_DEFAULT_COLOR;
            switch (shadingPosition) {
                case Html5Qrcode.SHADED_LEFT:   // intentional
                case Html5Qrcode.SHADED_RIGHT:
                    const height = largeSize + borderOffset;
                    elem.style.width = `${smallSize}px`;
                    elem.style.height = `${height}px`;
                    break;
                case Html5Qrcode.SHADED_TOP:   // intentional
                case Html5Qrcode.SHADED_BOTTOM:
                    const width = largeSize + borderOffset;
                    elem.style.width = `${width}px`;
                    elem.style.height = `${smallSize}px`;
                    break;
                default:
                    throw "Unsupported shadingPosition";
            }
            return elem;
        }

        const insertBorder = (top, left) => {
            if (!(top !== null && left !== null)) {
                throw "Shaders should have defined positions"
            }
            const borderElem = createBorder();
            borderElem.style.top = `${top}px`;
            borderElem.style.left = `${left}px`;
            shaderElem.appendChild(borderElem);

            if (!$this.borderShaders) {
                $this.borderShaders = [];
            }

            $this.borderShaders.push(borderElem);
        }

        let firstTop = null;
        let firstLeft = null;
        let secondTop = null;
        let secondLeft = null;
        switch (shadingPosition) {
            case Html5Qrcode.SHADED_LEFT:
                firstTop = qrRegion.y - borderOffset;
                firstLeft = qrRegion.x - smallSize;
                secondTop = qrRegion.y + qrRegion.height - largeSize;
                secondLeft = firstLeft;
                break;
            case Html5Qrcode.SHADED_RIGHT:
                firstTop = qrRegion.y - borderOffset;
                firstLeft = 0;
                secondTop = qrRegion.y + qrRegion.height - largeSize;
                secondLeft = firstLeft;
                break;
            case Html5Qrcode.SHADED_TOP:
                firstTop = qrRegion.y - borderOffset;
                firstLeft = -smallSize;
                secondTop = firstTop;
                secondLeft = qrRegion.width - largeSize;
                break;
            case Html5Qrcode.SHADED_BOTTOM:
                firstTop = 0;
                firstLeft = -smallSize;
                secondTop = firstTop;
                secondLeft = qrRegion.width - largeSize;
                break;
            default:
                throw "Unsupported shadingPosition";
        }

        insertBorder(firstTop, firstLeft);
        insertBorder(secondTop, secondLeft);
    }

    _possiblyUpdateShaders(qrMatch) {
        if (this.qrMatch === qrMatch) {
            return;
        }

        if (this.hasBorderShaders
            && this.borderShaders
            && this.borderShaders.length) {
            this.borderShaders.forEach(shader => {
                shader.style.backgroundColor = qrMatch
                    ? Html5Qrcode.BORDER_SHADER_MATCH_COLOR
                    : Html5Qrcode.BORDER_SHADER_DEFAULT_COLOR;
            });
        }
        this.qrMatch = qrMatch;
    }

    _possiblyCloseLastScanImageFile() {
        if (this._lastScanImageFile) {
            URL.revokeObjectURL(this._lastScanImageFile);
            this._lastScanImageFile = null;
        }
    }

    static _getTimeoutFps(fps) {
        return 1000 / fps;
    }

    static _log(message) {
        if (Html5Qrcode.VERBOSE) {
            console.log(message);
        }
    }
}

/**
 * Complete Scanner build on top of {@link Html5Qrcode}.
 */
class Html5QrcodeScanner {

    static SCAN_TYPE_CAMERA = "SCAN_TYPE_CAMERA";
    static SCAN_TYPE_FILE = "SCAN_TYPE_FILE";
    static STATUS_SUCCESS = "STATUS_SUCCESS";
    static STATUS_WARNING = "STATUS_WARNING";
    static STATUS_DEFAULT = "STATUS_DEFAULT";

    static ASSET_FILE_SCAN = "data:image/gif;base64,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MS8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICB4bWxuczpib2R5bW92aW49ImJvZHltb3ZpbiIKICAgIHhtbG5zOnhtcERNPSJodHRwOi8vbnMuYWRvYmUuY29tL3htcC8xLjAvRHluYW1pY01lZGlhLyIKICAgIHhtbG5zOnN0RGltPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvRGltZW5zaW9ucyMiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZjZmYzc4ODQtZWYxMy1iNTRkLTk0ZGMtMDI5OTYxYWE2ZDBkIgogICB4bXBNTTpEb2N1bWVudElEPSI2MzU4ZTE5Yi1mOTQxLTA3MzMtNTEzNy03YTg0MDAwMDAwNTEiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozZTk2YzgxNS1jNGVlLTQzNDUtYjMzZi0yYjFiN2NlMWE5NzciCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMTktMTItMDRUMTE6Mjk6MDcrMDM6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTA0VDExOjI5OjA3KzAzOjAwIgogICB4bXA6Q3JlYXRlRGF0ZT0iMjAxOS0xMi0wNFQxMToyODozNiswMzowMCIKICAgZGM6Zm9ybWF0PSLQkNC90LjQvNC40YDQvtCy0LDQvdC90YvQuSBHSUYiCiAgIGJvZHltb3Zpbjpwcm9qZWN0X2lkPSI5ZHhpaGxxMXQzbjN1N2hjdXZjOCIKICAgeG1wRE06dmlkZW9GcmFtZVJhdGU9IjI0LjAwMDAwMCIKICAgeG1wRE06dmlkZW9GaWVsZE9yZGVyPSJQcm9ncmVzc2l2ZSIKICAgeG1wRE06dmlkZW9QaXhlbEFzcGVjdFJhdGlvPSIxLzEiCiAgIHhtcERNOnN0YXJ0VGltZVNjYWxlPSIyNCIKICAgeG1wRE06c3RhcnRUaW1lU2FtcGxlU2l6ZT0iMSI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJmZDVkNzVlYi1iN2RlLWZjYjUtYzRlZC04OTJjMDAwMDAwN2UiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDRUMTE6Mjk6MDcrMDM6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo0ZGVkNDY0NC00OThmLTFkNGUtOTUyNy0xYTFmM2ViMjY3MzUiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDRUMDg6Mjc6MTArMDM6MDAiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Mzk4NDEzNTEtNzFjZi0zNzQ3LTkyMGQtMzE2MDkwYjhkMTIxIgogICAgICBzdEV2dDp3aGVuPSIyMDE5LTEyLTA0VDA4OjQyOjM1KzAzOjAwIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvY29udGVudCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2MzQ2MzVmNy02YWQwLTYyNGUtOWUzNi01NjRkZWY3YzZkNTIiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDRUMDk6MDQ6NDcrMDM6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii9jb250ZW50Ii8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249ImRlcml2ZWQiCiAgICAgIHN0RXZ0OnBhcmFtZXRlcnM9InNhdmVkIHRvIG5ldyBsb2NhdGlvbiIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo0YjMwMTM3MS0yZjM0LWIzNDEtOGMxYy0xZjZmNjhlMmY0YTkiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDRUMDk6MDQ6NDcrMDM6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YTEwOGYwZjQtZDNiMC1lMzQzLWJkMGQtMDMxMWEzMGFkZGNjIgogICAgICBzdEV2dDp3aGVuPSIyMDE5LTEyLTA0VDA5OjE0OjExKzAzOjAwIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvY29udGVudCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3YmQyOGRiYi1jMzI5LTA3NDEtOTk0YS1mMGJkZDIwZmU3MmEiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDRUMDk6MTk6MzgrMDM6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii9jb250ZW50Ii8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjJhOTkzY2E2LWU0YzctZjk0Mi05OWMyLTJiZTI2YWJmYjRjMCIKICAgICAgc3RFdnQ6d2hlbj0iMjAxOS0xMi0wNFQxMToyNzo0OSswMzowMCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjYjI2ZjkyNS1jYmY2LWExNDktYTYwNi00YTIxYTIwN2VlY2IiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDRUMTE6Mjg6NTYrMDM6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii9jb250ZW50Ii8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjk5ZWE2MmRhLTQyMDctNjA0Ni1hYmVkLTBjMmEzOWQ0NDgyZSIKICAgICAgc3RFdnQ6d2hlbj0iMjAxOS0xMi0wNFQxMToyODo1NiswMzowMCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplMTg5MTkxMy1mYTQwLTYxNDktYjdmZS03YzI1YjIzNTg5YzEiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDRUMTE6Mjk6MDcrMDM6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZjZmYzc4ODQtZWYxMy1iNTRkLTk0ZGMtMDI5OTYxYWE2ZDBkIgogICAgICBzdEV2dDp3aGVuPSIyMDE5LTEyLTA0VDExOjI5OjA3KzAzOjAwIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvbWV0YWRhdGEiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8eG1wTU06RGVyaXZlZEZyb20KICAgIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZTc2ZGE2ZWMtMmUzYy0zMTRkLTkyZjEtNThkNzJjNTJhMzMyIgogICAgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDplNzZkYTZlYy0yZTNjLTMxNGQtOTJmMS01OGQ3MmM1MmEzMzIiCiAgICBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NGRlZDQ2NDQtNDk4Zi0xZDRlLTk1MjctMWExZjNlYjI2NzM1Ii8+CiAgIDx4bXBNTTpJbmdyZWRpZW50cz4KICAgIDxyZGY6QmFnPgogICAgIDxyZGY6bGkKICAgICAgc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpiZWMzNTdhOS05MGJmLWFjNDAtYjk2OS00NDIwMjNiMzI0YjEiCiAgICAgIHN0UmVmOmZyb21QYXJ0PSJ0aW1lOjBkMjk2MzUyMDAwMDAwZjI1NDAxNjAwMDAwMCIKICAgICAgc3RSZWY6dG9QYXJ0PSJ0aW1lOjBkMjk2MzUyMDAwMDAwZjI1NDAxNjAwMDAwMCIKICAgICAgc3RSZWY6bWFza01hcmtlcnM9Ik5vbmUiLz4KICAgIDwvcmRmOkJhZz4KICAgPC94bXBNTTpJbmdyZWRpZW50cz4KICAgPHhtcE1NOlBhbnRyeT4KICAgIDxyZGY6QmFnPgogICAgIDxyZGY6bGk+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24KICAgICAgIGRjOmZvcm1hdD0iYXBwbGljYXRpb24vdm5kLmFkb2JlLmFmdGVyZWZmZWN0cy5sYXllciIKICAgICAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NzhhNWE2MmItYzAzYy03YzQxLWIzMGQtMTk0OTFkOTJhZmFlIj4KICAgICAgPGRjOnRpdGxlPgogICAgICAgPHJkZjpBbHQ+CiAgICAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5CYWNrZ3JvdW5kPC9yZGY6bGk+CiAgICAgICA8L3JkZjpBbHQ+CiAgICAgIDwvZGM6dGl0bGU+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICAgIDwvcmRmOmxpPgogICAgIDxyZGY6bGk+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24KICAgICAgIGRjOmZvcm1hdD0iYXBwbGljYXRpb24vdm5kLmFkb2JlLmFmdGVyZWZmZWN0cy5sYXllciIKICAgICAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODYxOGExZTUtMzY4Yy0wYjQ5LWJkNDctNzI0NmFkOTU3MmZjIj4KICAgICAgPGRjOnRpdGxlPgogICAgICAgPHJkZjpBbHQ+CiAgICAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5tYXNrMzwvcmRmOmxpPgogICAgICAgPC9yZGY6QWx0PgogICAgICA8L2RjOnRpdGxlPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICA8L3JkZjpsaT4KICAgICA8cmRmOmxpPgogICAgICA8cmRmOkRlc2NyaXB0aW9uCiAgICAgICBkYzpmb3JtYXQ9ImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5hZnRlcmVmZmVjdHMubGF5ZXIiCiAgICAgICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk0YjA5MTY2LTVmZWQtNzA0OS04YzQ4LWExODQwNjY3MjJlZiI+CiAgICAgIDxkYzp0aXRsZT4KICAgICAgIDxyZGY6QWx0PgogICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+cGhvdG8yPC9yZGY6bGk+CiAgICAgICA8L3JkZjpBbHQ+CiAgICAgIDwvZGM6dGl0bGU+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICAgIDwvcmRmOmxpPgogICAgIDxyZGY6bGk+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24KICAgICAgIGRjOmZvcm1hdD0iYXBwbGljYXRpb24vdm5kLmFkb2JlLmFmdGVyZWZmZWN0cy5sYXllciIKICAgICAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YWQ2ZWFiMmYtMWMxNS1jZjQ0LTg5YzgtNWJlZWVmMjUwOTA4Ij4KICAgICAgPGRjOnRpdGxlPgogICAgICAgPHJkZjpBbHQ+CiAgICAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5waG90bzE8L3JkZjpsaT4KICAgICAgIDwvcmRmOkFsdD4KICAgICAgPC9kYzp0aXRsZT4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgICAgPC9yZGY6bGk+CiAgICAgPHJkZjpsaT4KICAgICAgPHJkZjpEZXNjcmlwdGlvbgogICAgICAgZGM6Zm9ybWF0PSJhcHBsaWNhdGlvbi92bmQuYWRvYmUuYWZ0ZXJlZmZlY3RzLmNvbXAiCiAgICAgICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmJlYzM1N2E5LTkwYmYtYWM0MC1iOTY5LTQ0MjAyM2IzMjRiMSI+CiAgICAgIDxkYzp0aXRsZT4KICAgICAgIDxyZGY6QWx0PgogICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+cGhvdG8tZ2FsbGVyeSAyPC9yZGY6bGk+CiAgICAgICA8L3JkZjpBbHQ+CiAgICAgIDwvZGM6dGl0bGU+CiAgICAgIDx4bXBNTTpJbmdyZWRpZW50cz4KICAgICAgIDxyZGY6QmFnPgogICAgICAgIDxyZGY6bGkKICAgICAgICAgc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3OGE1YTYyYi1jMDNjLTdjNDEtYjMwZC0xOTQ5MWQ5MmFmYWUiCiAgICAgICAgIHN0UmVmOmZyb21QYXJ0PSJ0aW1lOjBkMjk2MzUyMDAwMDAwZjI1NDAxNjAwMDAwMCIKICAgICAgICAgc3RSZWY6dG9QYXJ0PSJ0aW1lOjBkMjk2MzUyMDAwMDAwZjI1NDAxNjAwMDAwMCIKICAgICAgICAgc3RSZWY6bWFza01hcmtlcnM9Ik5vbmUiLz4KICAgICAgICA8cmRmOmxpCiAgICAgICAgIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODYxOGExZTUtMzY4Yy0wYjQ5LWJkNDctNzI0NmFkOTU3MmZjIgogICAgICAgICBzdFJlZjpmcm9tUGFydD0idGltZTowZDI5NjM1MjAwMDAwMGYyNTQwMTYwMDAwMDAiCiAgICAgICAgIHN0UmVmOnRvUGFydD0idGltZTowZDI5NjM1MjAwMDAwMGYyNTQwMTYwMDAwMDAiCiAgICAgICAgIHN0UmVmOm1hc2tNYXJrZXJzPSJOb25lIi8+CiAgICAgICAgPHJkZjpsaQogICAgICAgICBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjk0YjA5MTY2LTVmZWQtNzA0OS04YzQ4LWExODQwNjY3MjJlZiIKICAgICAgICAgc3RSZWY6ZnJvbVBhcnQ9InRpbWU6MGQyOTYzNTIwMDAwMDBmMjU0MDE2MDAwMDAwIgogICAgICAgICBzdFJlZjp0b1BhcnQ9InRpbWU6MGQyOTYzNTIwMDAwMDBmMjU0MDE2MDAwMDAwIgogICAgICAgICBzdFJlZjptYXNrTWFya2Vycz0iTm9uZSIvPgogICAgICAgIDxyZGY6bGkKICAgICAgICAgc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDphZDZlYWIyZi0xYzE1LWNmNDQtODljOC01YmVlZWYyNTA5MDgiCiAgICAgICAgIHN0UmVmOmZyb21QYXJ0PSJ0aW1lOjBkMjk2MzUyMDAwMDAwZjI1NDAxNjAwMDAwMCIKICAgICAgICAgc3RSZWY6dG9QYXJ0PSJ0aW1lOjBkMjk2MzUyMDAwMDAwZjI1NDAxNjAwMDAwMCIKICAgICAgICAgc3RSZWY6bWFza01hcmtlcnM9Ik5vbmUiLz4KICAgICAgICA8cmRmOmxpCiAgICAgICAgIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YzkwOWFiOGMtY2IxZC01ZDQxLWJkNDgtMzU2MDQ4NmZkNmE2IgogICAgICAgICBzdFJlZjpmcm9tUGFydD0idGltZTowZDI5NjM1MjAwMDAwMGYyNTQwMTYwMDAwMDAiCiAgICAgICAgIHN0UmVmOnRvUGFydD0idGltZTowZDI5NjM1MjAwMDAwMGYyNTQwMTYwMDAwMDAiCiAgICAgICAgIHN0UmVmOm1hc2tNYXJrZXJzPSJOb25lIi8+CiAgICAgICAgPHJkZjpsaQogICAgICAgICBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmYxY2I0ODQ2LTNmNDItZDk0ZS05MmI4LTVjOTQyNjk4N2JkMyIKICAgICAgICAgc3RSZWY6ZnJvbVBhcnQ9InRpbWU6MGQyOTYzNTIwMDAwMDBmMjU0MDE2MDAwMDAwIgogICAgICAgICBzdFJlZjp0b1BhcnQ9InRpbWU6MGQyOTYzNTIwMDAwMDBmMjU0MDE2MDAwMDAwIgogICAgICAgICBzdFJlZjptYXNrTWFya2Vycz0iTm9uZSIvPgogICAgICAgPC9yZGY6QmFnPgogICAgICA8L3htcE1NOkluZ3JlZGllbnRzPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICA8L3JkZjpsaT4KICAgICA8cmRmOmxpPgogICAgICA8cmRmOkRlc2NyaXB0aW9uCiAgICAgICBkYzpmb3JtYXQ9ImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5hZnRlcmVmZmVjdHMubGF5ZXIiCiAgICAgICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmM5MDlhYjhjLWNiMWQtNWQ0MS1iZDQ4LTM1NjA0ODZmZDZhNiI+CiAgICAgIDxkYzp0aXRsZT4KICAgICAgIDxyZGY6QWx0PgogICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+bWFzazE8L3JkZjpsaT4KICAgICAgIDwvcmRmOkFsdD4KICAgICAgPC9kYzp0aXRsZT4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgICAgPC9yZGY6bGk+CiAgICAgPHJkZjpsaT4KICAgICAgPHJkZjpEZXNjcmlwdGlvbgogICAgICAgZGM6Zm9ybWF0PSJhcHBsaWNhdGlvbi92bmQuYWRvYmUuYWZ0ZXJlZmZlY3RzLmxheWVyIgogICAgICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpmMWNiNDg0Ni0zZjQyLWQ5NGUtOTJiOC01Yzk0MjY5ODdiZDMiPgogICAgICA8ZGM6dGl0bGU+CiAgICAgICA8cmRmOkFsdD4KICAgICAgICA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPnBob3RvMzwvcmRmOmxpPgogICAgICAgPC9yZGY6QWx0PgogICAgICA8L2RjOnRpdGxlPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICA8L3JkZjpsaT4KICAgIDwvcmRmOkJhZz4KICAgPC94bXBNTTpQYW50cnk+CiAgIDx4bXBETTp2aWRlb0ZyYW1lU2l6ZQogICAgc3REaW06dz0iNTAiCiAgICBzdERpbTpoPSI1MCIKICAgIHN0RGltOnVuaXQ9InBpeGVsIi8+CiAgIDx4bXBETTpkdXJhdGlvbgogICAgeG1wRE06dmFsdWU9IjI4IgogICAgeG1wRE06c2NhbGU9IjEvMjQiLz4KICAgPHhtcERNOnN0YXJ0VGltZWNvZGUKICAgIHhtcERNOnRpbWVGb3JtYXQ9IjI0VGltZWNvZGUiCiAgICB4bXBETTp0aW1lVmFsdWU9IjAwOjAwOjAwOjAwIi8+CiAgIDx4bXBETTphbHRUaW1lY29kZQogICAgeG1wRE06dGltZVZhbHVlPSIwMDowMDowMDowMCIKICAgIHhtcERNOnRpbWVGb3JtYXQ9IjI0VGltZWNvZGUiLz4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAA7";
    static ASSET_CAMERA_SCAN = "data:image/gif;base64,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L25zLmFkb2JlLmNvbS94bXAvMS4wL0R5bmFtaWNNZWRpYS8iCiAgICB4bWxuczpzdERpbT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL0RpbWVuc2lvbnMjIgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjFkNzgwZGNmLWVkZTctZWU0My04N2E0LTdlMTg3YThlYTI3NSIKICAgeG1wTU06RG9jdW1lbnRJRD0iZDMxNDk3ZmItM2Y1Zi0yMzkwLTFlZDEtYjU3NDAwMDAwMDVmIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NTdiYmYyOTgtY2M5Ny02MzRlLWE4MjAtODFiMjAxY2RmZjllIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTA1VDA5OjEzOjIyKzA1OjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAxOS0xMi0wNVQwOToxMzoyMiswNTowMCIKICAgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBBZnRlciBFZmZlY3RzIENDIDIwMTggKFdpbmRvd3MpIgogICB4bXA6Q3JlYXRlRGF0ZT0iMjAxOS0xMi0wNVQwOToxMjo1MCswNTowMCIKICAgZGM6Zm9ybWF0PSLQkNC90LjQvNC40YDQvtCy0LDQvdC90YvQuSBHSUYiCiAgIGJvZHltb3Zpbjpwcm9qZWN0X2lkPSJvZWU3ZTRyM2gwaGtjZTdiODgzMyIKICAgeG1wRE06dmlkZW9GcmFtZVJhdGU9IjI1LjAwMDAwMCIKICAgeG1wRE06dmlkZW9GaWVsZE9yZGVyPSJQcm9ncmVzc2l2ZSIKICAgeG1wRE06dmlkZW9QaXhlbEFzcGVjdFJhdGlvPSIxLzEiCiAgIHhtcERNOnN0YXJ0VGltZVNjYWxlPSIyNSIKICAgeG1wRE06c3RhcnRUaW1lU2FtcGxlU2l6ZT0iMSI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSI5YWE0NzI4ZC1iYWU1LTAyMDEtMjM4MC0zZTlhMDAwMDAwOGMiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDVUMDk6MTM6MjIrMDU6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphYTA2OGRlZi1hY2NhLTM5NDgtODM1Yi02MWQ1MmU2NWI3NDIiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMDgtMzBUMDE6Mzg6MTErMDM6MDAiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIEFmdGVyIEVmZmVjdHMgQ0MgMjAxOCAoV2luZG93cykiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZThjY2QxNzEtNWFkZC01MzRmLWIyZjgtODc0NzNhOGMxYWJmIgogICAgICBzdEV2dDp3aGVuPSIyMDE5LTA4LTMwVDAxOjM4OjMxKzAzOjAwIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBBZnRlciBFZmZlY3RzIENDIDIwMTggKFdpbmRvd3MpIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvY29udGVudCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2ZmVmYzVhNC00YWY3LTVhNGYtYjJiYS1hMWRkYTM1YWRkMTQiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMDgtMzBUMDI6MDY6MjcrMDM6MDAiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIEFmdGVyIEVmZmVjdHMgQ0MgMjAxOCAoV2luZG93cykiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii9jb250ZW50Ii8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249ImRlcml2ZWQiCiAgICAgIHN0RXZ0OnBhcmFtZXRlcnM9InNhdmVkIHRvIG5ldyBsb2NhdGlvbiIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmYjg3ZmQwYS00Njc2LTQ2NDMtOWZlYS03Mjk2NzllYmVhY2YiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMDgtMzBUMDI6MDY6NTYrMDM6MDAiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIEFmdGVyIEVmZmVjdHMgQ0MgMjAxOCAoV2luZG93cykiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MTBmZDdiYzMtNDllMy1hNzRjLWI0Y2UtNzI5NjYxM2NjMmYwIgogICAgICBzdEV2dDp3aGVuPSIyMDE5LTA4LTMwVDAyOjA3OjA3KzAzOjAwIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBBZnRlciBFZmZlY3RzIENDIDIwMTggKFdpbmRvd3MpIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvY29udGVudCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowMWZlOTE3MC1lYTQ1LTcyNDItOGVmNy1mMzQyNTU0ZWEwN2UiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMDgtMzBUMDI6MDc6MDcrMDM6MDAiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIEFmdGVyIEVmZmVjdHMgQ0MgMjAxOCAoV2luZG93cykiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZjJjN2ViNzEtMGJhZC03OTRiLWI4ZTAtMWVhZTkzOTM3Njk2IgogICAgICBzdEV2dDp3aGVuPSIyMDE5LTA4LTMwVDAyOjI2OjIzKzAzOjAwIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBBZnRlciBFZmZlY3RzIENDIDIwMTggKFdpbmRvd3MpIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvY29udGVudCIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5ZDFlN2UzNi1kZWVjLWJmNDYtOGE0Mi1kODE4YzBlMjc5YjIiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDRUMTM6NDk6MDIrMDU6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii9jb250ZW50Ii8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjA1Y2RkNWI3LTM0MGMtOGM0ZC1hMWUyLTlkYWJlMjg0OTA0MyIKICAgICAgc3RFdnQ6d2hlbj0iMjAxOS0xMi0wNFQxMzo0OTowMiswNTowMCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozYmY3YjIzNi1kNTI3LTA0NGUtYTlkMS00MjUzY2FlZGM0N2MiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDRUMTM6NDk6MjMrMDU6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii9jb250ZW50Ii8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjAxYTc1YTU2LTMyZGMtYmU0OS1hZWFkLWFjMmQ5YjNkZjJiMiIKICAgICAgc3RFdnQ6d2hlbj0iMjAxOS0xMi0wNFQxMzo0OToyMyswNTowMCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo4OTJiYmEyYy1iMjljLWNjNDgtOTI1My0wOGE0ODYwZTY5ZDAiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDVUMDk6MDE6MzArMDU6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii9jb250ZW50Ii8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmYwZTI3MTZlLWU5ZTAtYWE0ZS05ZjcwLTQxNTdjNmNlMGZlYSIKICAgICAgc3RFdnQ6d2hlbj0iMjAxOS0xMi0wNVQwOToxMzoxMSswNTowMCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iL2NvbnRlbnQiLz4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6Y2I2NjE4ZDItOTcwMC01NTRjLWI5ZTktNmEzYWUxM2Q5NGYyIgogICAgICBzdEV2dDp3aGVuPSIyMDE5LTEyLTA1VDA5OjEzOjExKzA1OjAwIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIi8+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjlkZWU2YWY2LWQ1ZWYtMzg0My04MjY5LTQyMGY1ODFlMjdlZiIKICAgICAgc3RFdnQ6d2hlbj0iMjAxOS0xMi0wNVQwOToxMzoyMiswNTowMCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIvPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxZDc4MGRjZi1lZGU3LWVlNDMtODdhNC03ZTE4N2E4ZWEyNzUiCiAgICAgIHN0RXZ0OndoZW49IjIwMTktMTItMDVUMDk6MTM6MjIrMDU6MDAiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii9tZXRhZGF0YSIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgIDx4bXBNTTpEZXJpdmVkRnJvbQogICAgc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3MzNkMjZhMi1iN2I4LTA3NGItODhkNy1iOGE1OGM5ZmQwYzUiCiAgICBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjczM2QyNmEyLWI3YjgtMDc0Yi04OGQ3LWI4YTU4YzlmZDBjNSIKICAgIHN0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDphYTA2OGRlZi1hY2NhLTM5NDgtODM1Yi02MWQ1MmU2NWI3NDIiLz4KICAgPHhtcE1NOkluZ3JlZGllbnRzPgogICAgPHJkZjpCYWc+CiAgICAgPHJkZjpsaQogICAgICBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjRkOTdmOTNlLWIwZjEtZjU0NC1iZmMxLWFmZThhMzEyNjkzZCIKICAgICAgc3RSZWY6ZnJvbVBhcnQ9InRpbWU6MGQyOTYzNTIwMDAwMDBmMjU0MDE2MDAwMDAwIgogICAgICBzdFJlZjp0b1BhcnQ9InRpbWU6MGQyOTYzNTIwMDAwMDBmMjU0MDE2MDAwMDAwIgogICAgICBzdFJlZjptYXNrTWFya2Vycz0iTm9uZSIvPgogICAgPC9yZGY6QmFnPgogICA8L3htcE1NOkluZ3JlZGllbnRzPgogICA8eG1wTU06UGFudHJ5PgogICAgPHJkZjpCYWc+CiAgICAgPHJkZjpsaT4KICAgICAgPHJkZjpEZXNjcmlwdGlvbgogICAgICAgZGM6Zm9ybWF0PSJhcHBsaWNhdGlvbi92bmQuYWRvYmUuYWZ0ZXJlZmZlY3RzLmNvbXAiCiAgICAgICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjRkOTdmOTNlLWIwZjEtZjU0NC1iZmMxLWFmZThhMzEyNjkzZCI+CiAgICAgIDxkYzp0aXRsZT4KICAgICAgIDxyZGY6QWx0PgogICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+cG9ydHJhaXQtbW9kZS1zY2FubmluZzwvcmRmOmxpPgogICAgICAgPC9yZGY6QWx0PgogICAgICA8L2RjOnRpdGxlPgogICAgICA8eG1wTU06SW5ncmVkaWVudHM+CiAgICAgICA8cmRmOkJhZz4KICAgICAgICA8cmRmOmxpCiAgICAgICAgIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjBlNWU0MmUtM2U1NS0zYTQ1LTlkZDYtZjY1YzFlNzAxMDRhIgogICAgICAgICBzdFJlZjpmcm9tUGFydD0idGltZTowZDI5NjM1MjAwMDAwMGYyNTQwMTYwMDAwMDAiCiAgICAgICAgIHN0UmVmOnRvUGFydD0idGltZTowZDI5NjM1MjAwMDAwMGYyNTQwMTYwMDAwMDAiCiAgICAgICAgIHN0UmVmOm1hc2tNYXJrZXJzPSJOb25lIi8+CiAgICAgICAgPHJkZjpsaQogICAgICAgICBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmFjZDllMjg3LWZjMzEtMWQ0Ni1hNzdmLTQ1NjQ1ZmFhNWUwYyIKICAgICAgICAgc3RSZWY6ZnJvbVBhcnQ9InRpbWU6MGQyODU3NjgwMDAwMDBmMjU0MDE2MDAwMDAwIgogICAgICAgICBzdFJlZjp0b1BhcnQ9InRpbWU6MTA1ODQwMDAwMDBmMjU0MDE2MDAwMDAwZDI4NTc2ODAwMDAwMGYyNTQwMTYwMDAwMDAiCiAgICAgICAgIHN0UmVmOm1hc2tNYXJrZXJzPSJOb25lIi8+CiAgICAgICAgPHJkZjpsaQogICAgICAgICBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmQwMDE4YzVkLWU2MDEtZWM0NS1hZWQ5LTdhZTNjZTViNmIzZCIKICAgICAgICAgc3RSZWY6ZnJvbVBhcnQ9InRpbWU6MGQyOTYzNTIwMDAwMDBmMjU0MDE2MDAwMDAwIgogICAgICAgICBzdFJlZjp0b1BhcnQ9InRpbWU6MGQyOTYzNTIwMDAwMDBmMjU0MDE2MDAwMDAwIgogICAgICAgICBzdFJlZjptYXNrTWFya2Vycz0iTm9uZSIvPgogICAgICAgIDxyZGY6bGkKICAgICAgICAgc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDplODdiN2UyOC02NTQ5LTM5NGEtODNjOS05ZjdkOTUyNDJjNmUiCiAgICAgICAgIHN0UmVmOmZyb21QYXJ0PSJ0aW1lOjBkMjk2MzUyMDAwMDAwZjI1NDAxNjAwMDAwMCIKICAgICAgICAgc3RSZWY6dG9QYXJ0PSJ0aW1lOjBkMjk2MzUyMDAwMDAwZjI1NDAxNjAwMDAwMCIKICAgICAgICAgc3RSZWY6bWFza01hcmtlcnM9Ik5vbmUiLz4KICAgICAgICA8cmRmOmxpCiAgICAgICAgIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZThlY2VkNGMtNWVjZi0xNTQ1LWI3ZGYtNmViNmMwNjQxNGZiIgogICAgICAgICBzdFJlZjpmcm9tUGFydD0idGltZTowZDI5NjM1MjAwMDAwMGYyNTQwMTYwMDAwMDAiCiAgICAgICAgIHN0UmVmOnRvUGFydD0idGltZTowZDI5NjM1MjAwMDAwMGYyNTQwMTYwMDAwMDAiCiAgICAgICAgIHN0UmVmOm1hc2tNYXJrZXJzPSJOb25lIi8+CiAgICAgICA8L3JkZjpCYWc+CiAgICAgIDwveG1wTU06SW5ncmVkaWVudHM+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICAgIDwvcmRmOmxpPgogICAgIDxyZGY6bGk+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24KICAgICAgIGRjOmZvcm1hdD0iYXBwbGljYXRpb24vdm5kLmFkb2JlLmFmdGVyZWZmZWN0cy5sYXllciIKICAgICAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjBlNWU0MmUtM2U1NS0zYTQ1LTlkZDYtZjY1YzFlNzAxMDRhIj4KICAgICAgPGRjOnRpdGxlPgogICAgICAgPHJkZjpBbHQ+CiAgICAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5wYXBlcjwvcmRmOmxpPgogICAgICAgPC9yZGY6QWx0PgogICAgICA8L2RjOnRpdGxlPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICA8L3JkZjpsaT4KICAgICA8cmRmOmxpPgogICAgICA8cmRmOkRlc2NyaXB0aW9uCiAgICAgICBkYzpmb3JtYXQ9ImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5hZnRlcmVmZmVjdHMubGF5ZXIiCiAgICAgICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmFjZDllMjg3LWZjMzEtMWQ0Ni1hNzdmLTQ1NjQ1ZmFhNWUwYyI+CiAgICAgIDxkYzp0aXRsZT4KICAgICAgIDxyZGY6QWx0PgogICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+bGluZS1zY2FubmluZzwvcmRmOmxpPgogICAgICAgPC9yZGY6QWx0PgogICAgICA8L2RjOnRpdGxlPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICA8L3JkZjpsaT4KICAgICA8cmRmOmxpPgogICAgICA8cmRmOkRlc2NyaXB0aW9uCiAgICAgICBkYzpmb3JtYXQ9ImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5hZnRlcmVmZmVjdHMubGF5ZXIiCiAgICAgICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmQwMDE4YzVkLWU2MDEtZWM0NS1hZWQ5LTdhZTNjZTViNmIzZCI+CiAgICAgIDxkYzp0aXRsZT4KICAgICAgIDxyZGY6QWx0PgogICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+bWFzazwvcmRmOmxpPgogICAgICAgPC9yZGY6QWx0PgogICAgICA8L2RjOnRpdGxlPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgICA8L3JkZjpsaT4KICAgICA8cmRmOmxpPgogICAgICA8cmRmOkRlc2NyaXB0aW9uCiAgICAgICBkYzpmb3JtYXQ9ImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5hZnRlcmVmZmVjdHMubGF5ZXIiCiAgICAgICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmU4N2I3ZTI4LTY1NDktMzk0YS04M2M5LTlmN2Q5NTI0MmM2ZSI+CiAgICAgIDxkYzp0aXRsZT4KICAgICAgIDxyZGY6QWx0PgogICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+ZnJhbWU8L3JkZjpsaT4KICAgICAgIDwvcmRmOkFsdD4KICAgICAgPC9kYzp0aXRsZT4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgICAgPC9yZGY6bGk+CiAgICAgPHJkZjpsaT4KICAgICAgPHJkZjpEZXNjcmlwdGlvbgogICAgICAgZGM6Zm9ybWF0PSJhcHBsaWNhdGlvbi92bmQuYWRvYmUuYWZ0ZXJlZmZlY3RzLmxheWVyIgogICAgICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDplOGVjZWQ0Yy01ZWNmLTE1NDUtYjdkZi02ZWI2YzA2NDE0ZmIiPgogICAgICA8ZGM6dGl0bGU+CiAgICAgICA8cmRmOkFsdD4KICAgICAgICA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPkJhY2tncm91bmQ8L3JkZjpsaT4KICAgICAgIDwvcmRmOkFsdD4KICAgICAgPC9kYzp0aXRsZT4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgICAgPC9yZGY6bGk+CiAgICA8L3JkZjpCYWc+CiAgIDwveG1wTU06UGFudHJ5PgogICA8eG1wRE06dmlkZW9GcmFtZVNpemUKICAgIHN0RGltOnc9IjUwIgogICAgc3REaW06aD0iNTAiCiAgICBzdERpbTp1bml0PSJwaXhlbCIvPgogICA8eG1wRE06ZHVyYXRpb24KICAgIHhtcERNOnZhbHVlPSIyOSIKICAgIHhtcERNOnNjYWxlPSIxLzI1Ii8+CiAgIDx4bXBETTpzdGFydFRpbWVjb2RlCiAgICB4bXBETTp0aW1lRm9ybWF0PSIyNVRpbWVjb2RlIgogICAgeG1wRE06dGltZVZhbHVlPSIwMDowMDowMDowMCIvPgogICA8eG1wRE06YWx0VGltZWNvZGUKICAgIHhtcERNOnRpbWVWYWx1ZT0iMDA6MDA6MDA6MDAiCiAgICB4bXBETTp0aW1lRm9ybWF0PSIyNVRpbWVjb2RlIi8+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAOw==";

    /**
     * Creates instance of this class.
     *
     * @param {String} elementId - Id of the HTML element.
     * @param {Object} config extra configurations to tune QR code scanner.
     *  Supported Fields:
     *      - fps: expected framerate of qr code scanning. example { fps: 2 }
     *          means the scanning would be done every 500 ms.
     *      - qrbox: width of QR scanning box, this should be smaller than
     *          the width and height of the box. This would make the scanner
     *          look like this:
     *          ----------------------
     *          |********************|
     *          |******,,,,,,,,,*****|      <--- shaded region
     *          |******|       |*****|      <--- non shaded region would be
     *          |******|       |*****|          used for QR code scanning.
     *          |******|_______|*****|
     *          |********************|
     *          |********************|
     *          ----------------------
     * @param {Boolean} verbose - Optional argument, if true, all logs
     *                  would be printed to console. 
     */
    constructor(elementId, config, verbose) {
        this.elementId = elementId;
        this.config = config;
        this.verbose = verbose === true;

        if (!document.getElementById(elementId)) {
            throw `HTML Element with id=${elementId} not found`;
        }

        this.currentScanType = Html5QrcodeScanner.SCAN_TYPE_CAMERA;
        this.sectionSwapAllowed = true;

        this.section = undefined;
        this.html5Qrcode = undefined;
        this.qrCodeSuccessCallback = undefined;
        this.qrCodeErrorCallback = undefined;
    }

    /**
     * Renders the User Interface
     * 
     * @param {Function} qrCodeSuccessCallback - callback on QR Code found.
     *  Example:
     *      function(qrCodeMessage) {}
     * @param {Function} qrCodeErrorCallback - callback on QR Code parse error.
     *  Example:
     *      function(errorMessage) {}
     * 
     */
    render(qrCodeSuccessCallback, qrCodeErrorCallback) {
        const $this = this;

        this.lastMatchFound = undefined;
        // Add wrapper to success callback.
        this.qrCodeSuccessCallback = message => {
            $this.__setStatus("MATCH", Html5QrcodeScanner.STATUS_SUCCESS);
            if (qrCodeSuccessCallback) {
                qrCodeSuccessCallback(message);
            } else {
                if ($this.lastMatchFound == message) {
                    return;
                }
                $this.lastMatchFound = message;
                $this.__setHeaderMessage(
                    `Last Match: ${message}`, Html5QrcodeScanner.STATUS_SUCCESS);
            }
        }

        // Add wrapper to failure callback
        this.qrCodeErrorCallback = error => {
            $this.__setStatus("Scanning");
            if (qrCodeErrorCallback) {
                qrCodeErrorCallback(error);
            }
        }

        const container = document.getElementById(this.elementId);
        container.innerHTML = "";
        this.__createBasicLayout(container);

        this.html5Qrcode = new Html5Qrcode(
            this.__getScanRegionId(), this.verbose);
    }

    /**
     * Removes the QR Code scanner.
     * 
     * @returns Promise which succeeds if the cleanup is complete successfully,
     *  fails otherwise.
     */
    clear() {
        const $this = this;
        const emptyHtmlContainer = () => {
            const mainContainer = document.getElementById(this.elementId);
            if (mainContainer) {
                mainContainer.innerHTML = "";
                this.__resetBasicLayout(mainContainer);
            }
        }

        if (this.html5Qrcode) {
            return new Promise((resolve, reject) => {
                if ($this.html5Qrcode._isScanning) {
                    $this.html5Qrcode.stop().then(_ => {
                        $this.html5Qrcode.clear();
                        emptyHtmlContainer();
                        resolve();
                    }).catch(error => {
                        if ($this.verbose) {
                            console.error("Unable to stop qrcode scanner", error);
                        }
                        reject(error);
                    })
                }
            });
        }
    }

    //#region private control methods
    __createBasicLayout(parent) {
        parent.style.position = "relative";
        parent.style.padding = "0px";
        parent.style.border = "1px solid silver";
        this.__createHeader(parent);

        const qrCodeScanRegion = document.createElement("div");
        const scanRegionId = this.__getScanRegionId();
        qrCodeScanRegion.id = scanRegionId;
        qrCodeScanRegion.style.width = "100%";
        qrCodeScanRegion.style.minHeight = "100px";
        qrCodeScanRegion.style.textAlign = "center";
        parent.appendChild(qrCodeScanRegion);
        this.__insertCameraScanImageToScanRegion();

        const qrCodeDashboard = document.createElement("div");
        const dashboardId = this.__getDashboardId();
        qrCodeDashboard.id = dashboardId;
        qrCodeDashboard.style.width = "100%";
        parent.appendChild(qrCodeDashboard);

        this.__setupInitialDashboard(qrCodeDashboard);
	}
	
	__resetBasicLayout(parent) {
        parent.style.border = "none";
	}

    __setupInitialDashboard(dashboard) {
        this.__createSection(dashboard);
        this.__createSectionControlPanel();
        this.__createSectionSwap();
    }

    __createHeader(dashboard) {
        const header = document.createElement("div");
        header.style.textAlign = "left";
        header.style.margin = "0px";
        header.style.padding = "5px";
        header.style.fontSize = "20px";
        header.style.borderBottom = "1px solid rgba(192, 192, 192, 0.18)";
        dashboard.appendChild(header);

        const titleSpan = document.createElement("span");
        titleSpan.innerHTML = "QR Code Scanner";
        header.appendChild(titleSpan);

        const statusSpan = document.createElement("span");
        statusSpan.id = this.__getStatusSpanId();
        statusSpan.style.float = "right";
        statusSpan.style.padding = "5px 7px";
        statusSpan.style.fontSize = "14px";
        statusSpan.style.background = "#dedede6b";
        statusSpan.style.border = "1px solid #00000000";
        statusSpan.style.color = "rgb(17, 17, 17)";
        header.appendChild(statusSpan);
        this.__setStatus("IDLE");

        const headerMessageContainer = document.createElement("div");
        headerMessageContainer.id = this.__getHeaderMessageContainerId();
        headerMessageContainer.style.display = "none";
        headerMessageContainer.style.fontSize = "14px";
        headerMessageContainer.style.padding = "2px 10px";
        headerMessageContainer.style.marginTop = "4px";
        headerMessageContainer.style.borderTop = "1px solid #f6f6f6";
        header.appendChild(headerMessageContainer);
    }

    __createSection(dashboard) {
        const section = document.createElement("div");
        section.id = this.__getDashboardSectionId();
        section.style.width = "100%";
        section.style.padding = "10px";
        section.style.textAlign = "left";
        dashboard.appendChild(section);
    }

    __createSectionControlPanel() {
        const $this = this;
        const section = document.getElementById(this.__getDashboardSectionId());
        const sectionControlPanel = document.createElement("div");
        section.appendChild(sectionControlPanel);
        const scpCameraScanRegion = document.createElement("div");
        scpCameraScanRegion.id = this.__getDashboardSectionCameraScanRegionId();
        scpCameraScanRegion.style.display
            = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA
                ? "block" : "none";
        sectionControlPanel.appendChild(scpCameraScanRegion);

        // Assuming when the object is created permission is needed.
        const requestPermissionContainer = document.createElement("div");
        requestPermissionContainer.style.textAlign = "center";

        const requestPermissionButton = document.createElement("button");
        requestPermissionButton.innerHTML = "Request Camera Permissions";
        requestPermissionButton.addEventListener("click", function () {
            requestPermissionButton.disabled = true;
            $this.__setStatus("PERMISSION");
            $this.__setHeaderMessage("Requesting camera permissions...");

            Html5Qrcode.getCameras().then(cameras => {
                $this.__setStatus("IDLE");
                $this.__resetHeaderMessage();
                if (!cameras || cameras.length == 0) {
                    $this.__setStatus(
                        "No Cameras", Html5QrcodeScanner.STATUS_WARNING);
                } else {
                    scpCameraScanRegion.removeChild(requestPermissionContainer);
                    $this.__renderCameraSelection(cameras);
                }
            }).catch(error => {
                requestPermissionButton.disabled = false;
                $this.__setStatus("IDLE");
                $this.__setHeaderMessage(error, Html5QrcodeScanner.STATUS_WARNING);
            });
        });
        requestPermissionContainer.appendChild(requestPermissionButton);
        scpCameraScanRegion.appendChild(requestPermissionContainer);

        const fileBasedScanRegion = document.createElement("div");
        fileBasedScanRegion.id = this.__getDashboardSectionFileScanRegionId();
        fileBasedScanRegion.style.textAlign = "center";
        fileBasedScanRegion.style.display
            = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA
                ? "none" : "block";
        sectionControlPanel.appendChild(fileBasedScanRegion);

        const fileScanInput = document.createElement("input");
        fileScanInput.id = this.__getFileScanInputId();
        fileScanInput.accept = "image/*";
        fileScanInput.type = "file";
        fileScanInput.style.width = "200px";
        fileScanInput.disabled
            = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA;
        const fileScanLabel = document.createElement("span");
        fileScanLabel.innerHTML = "&nbsp; Select Image";
        fileBasedScanRegion.appendChild(fileScanInput);
        fileBasedScanRegion.appendChild(fileScanLabel);
        fileScanInput.addEventListener('change', e => {
            if ($this.currentScanType !== Html5QrcodeScanner.SCAN_TYPE_FILE) {
                return;
            }
            if (e.target.files.length == 0) {
                return;
            }
            const file = e.target.files[0];
            $this.html5Qrcode.scanFile(file, true)
                .then(qrCode => {
                    $this.__resetHeaderMessage();
                    $this.qrCodeSuccessCallback(qrCode);
                })
                .catch(error => {
                    $this.__setStatus("ERROR", Html5QrcodeScanner.STATUS_WARNING);
                    $this.__setHeaderMessage(error, Html5QrcodeScanner.STATUS_WARNING);
                });
        });
    }

    __renderCameraSelection(cameras) {
        const $this = this;
        const scpCameraScanRegion = document.getElementById(
            this.__getDashboardSectionCameraScanRegionId());
        scpCameraScanRegion.style.textAlign = "center";

        const cameraSelectionContainer = document.createElement("span");
        cameraSelectionContainer.innerHTML
            = `Select Camera (${cameras.length}) &nbsp;`;
        cameraSelectionContainer.style.marginRight = "10px";

        const cameraSelectionSelect = document.createElement("select");
        cameraSelectionSelect.id = this.__getCameraSelectionId();
        for (var i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            const value = camera.id;
            const name = camera.label == null ? value : camera.label;
            const option = document.createElement('option');
            option.value = value;
            option.innerHTML = name;
            cameraSelectionSelect.appendChild(option);
        }
        cameraSelectionContainer.appendChild(cameraSelectionSelect);
        scpCameraScanRegion.appendChild(cameraSelectionContainer);

        const cameraActionContainer = document.createElement("span");
        const cameraActionStartButton = document.createElement("button");
        cameraActionStartButton.innerHTML = "Start Scanning";
        cameraActionContainer.appendChild(cameraActionStartButton);

        const cameraActionStopButton = document.createElement("button");
        cameraActionStopButton.innerHTML = "Stop Scanning";
        cameraActionStopButton.style.display = "none";
        cameraActionStopButton.disabled = true;
        cameraActionContainer.appendChild(cameraActionStopButton);

        scpCameraScanRegion.appendChild(cameraActionContainer);

        cameraActionStartButton.addEventListener('click', _ => {
            cameraSelectionSelect.disabled = true;
            cameraActionStartButton.disabled = true;
            $this._showHideScanTypeSwapLink(false);

            const config = $this.config ?
                $this.config : { fps: 10, qrbox: 250 };

            const cameraId = cameraSelectionSelect.value;
            $this.html5Qrcode.start(
                cameraId,
                config,
                $this.qrCodeSuccessCallback,
                $this.qrCodeErrorCallback)
                .then(_ => {
                    cameraActionStopButton.disabled = false;
                    cameraActionStopButton.style.display = "inline-block";
                    cameraActionStartButton.style.display = "none";
                    $this.__setStatus("Scanning");
                })
                .catch(error => {
                    $this._showHideScanTypeSwapLink(true);
                    cameraSelectionSelect.disabled = false;
                    cameraActionStartButton.disabled = false;
                    $this.__setStatus("IDLE");
                    $this.__setHeaderMessage(
                        error, Html5QrcodeScanner.STATUS_WARNING);
                });
        });

        cameraActionStopButton.addEventListener('click', _ => {
            cameraActionStopButton.disabled = true;
            $this.html5Qrcode.stop()
                .then(_ => {
                    $this._showHideScanTypeSwapLink(true);
                    cameraSelectionSelect.disabled = false;
                    cameraActionStartButton.disabled = false;
                    cameraActionStopButton.style.display = "none";
                    cameraActionStartButton.style.display = "inline-block";
                    $this.__setStatus("IDLE");
                    $this.__insertCameraScanImageToScanRegion();
                }).catch(error => {
                    cameraActionStopButton.disabled = false;
                    $this.__setStatus("ERROR", Html5QrcodeScanner.STATUS_WARNING);
                    $this.__setHeaderMessage(
                        error, Html5QrcodeScanner.STATUS_WARNING);
                });
        });
    }

    __createSectionSwap() {
        const $this = this;
        const TEXT_IF_CAMERA_SCAN_SELECTED
            = "Scan an Image File";
        const TEXT_IF_FILE_SCAN_SELECTED
            = "Scan using camera directly";

        const section = document.getElementById(this.__getDashboardSectionId());
        const switchContainer = document.createElement("div");
        switchContainer.style.textAlign = "center";
        const swithToFileBasedLink = document.createElement("a");
        swithToFileBasedLink.style.textDecoration = "underline";
        swithToFileBasedLink.id = this.__getDashboardSectionSwapLinkId();
        swithToFileBasedLink.innerHTML
            = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA
                ? TEXT_IF_CAMERA_SCAN_SELECTED : TEXT_IF_FILE_SCAN_SELECTED;
        swithToFileBasedLink.href = "#scan-using-file";
        swithToFileBasedLink.addEventListener('click', function () {
            if (!$this.sectionSwapAllowed) {
                if ($this.verbose) {
                    console.error("Section swap called when not allowed");
                }
                return;
            }

            // Cleanup states
            $this.__setStatus("IDLE");
            $this.__resetHeaderMessage();
            $this.__getFileScanInput().value = "";

            $this.sectionSwapAllowed = false;
            if ($this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA) {
                // swap to file
                $this.__clearScanRegion();
                $this.__getFileScanInput().disabled = false;
                $this.__getCameraScanRegion().style.display = "none";
                $this.__getFileScanRegion().style.display = "block";
                swithToFileBasedLink.innerHTML = TEXT_IF_FILE_SCAN_SELECTED;
                $this.currentScanType = Html5QrcodeScanner.SCAN_TYPE_FILE;
                $this.__insertFileScanImageToScanRegion();
            } else {
                // swap to camera based scanning
                $this.__clearScanRegion();
                $this.__getFileScanInput().disabled = true;
                $this.__getCameraScanRegion().style.display = "block";
                $this.__getFileScanRegion().style.display = "none";
                swithToFileBasedLink.innerHTML = TEXT_IF_CAMERA_SCAN_SELECTED;
                $this.currentScanType = Html5QrcodeScanner.SCAN_TYPE_CAMERA;
                $this.__insertCameraScanImageToScanRegion();
            }

            $this.sectionSwapAllowed = true;
        });
        switchContainer.appendChild(swithToFileBasedLink);
        section.appendChild(switchContainer);
    }

    __setStatus(statusText, statusClass) {
        if (!statusClass) {
            statusClass = Html5QrcodeScanner.STATUS_DEFAULT;
        }
        const statusSpan = document.getElementById(this.__getStatusSpanId());
        statusSpan.innerHTML = statusText;

        switch (statusClass) {
            case Html5QrcodeScanner.STATUS_SUCCESS:
                statusSpan.style.background = "#6aaf5042";
                statusSpan.style.color = "#477735";
                break;
            case Html5QrcodeScanner.STATUS_WARNING:
                statusSpan.style.background = "#cb243124";
                statusSpan.style.color = "#cb2431";
                break;
            case Html5QrcodeScanner.STATUS_DEFAULT:
            default:
                statusSpan.style.background = "#eef";
                statusSpan.style.color = "rgb(17, 17, 17)";
                break;
        }
    }

    __resetHeaderMessage() {
        const messageDiv = document.getElementById(
            this.__getHeaderMessageContainerId());
        messageDiv.style.display = "none";
    }

    __setHeaderMessage(messageText, statusClass) {
        if (!statusClass) {
            statusClass = Html5QrcodeScanner.STATUS_DEFAULT;
        }
        const messageDiv = document.getElementById(
            this.__getHeaderMessageContainerId());
        messageDiv.innerHTML = messageText;
        messageDiv.style.display = "block";

        switch (statusClass) {
            case Html5QrcodeScanner.STATUS_SUCCESS:
                messageDiv.style.background = "#6aaf5042";
                messageDiv.style.color = "#477735";
                break;
            case Html5QrcodeScanner.STATUS_WARNING:
                messageDiv.style.background = "#cb243124";
                messageDiv.style.color = "#cb2431";
                break;
            case Html5QrcodeScanner.STATUS_DEFAULT:
            default:
                messageDiv.style.background = "#00000000";
                messageDiv.style.color = "rgb(17, 17, 17)";
                break;
        }
    }

    _showHideScanTypeSwapLink(shouldDisplay) {
        if (shouldDisplay !== true) {
            shouldDisplay = false;
        }

        this.sectionSwapAllowed = shouldDisplay;
        this.__getDashboardSectionSwapLink().style.display
            = shouldDisplay ? "inline-block" : "none";
    }

    __insertCameraScanImageToScanRegion() {
        const $this = this;
        const qrCodeScanRegion = document.getElementById(
            this.__getScanRegionId());

        if (this.cameraScanImage) {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild(this.cameraScanImage);
            return;
        }

        this.cameraScanImage = new Image;
        this.cameraScanImage.onload = _ => {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild($this.cameraScanImage);
        }
        this.cameraScanImage.width = 64;
        this.cameraScanImage.style.opacity = 0.3;
        this.cameraScanImage.src = Html5QrcodeScanner.ASSET_CAMERA_SCAN;
    }

    __insertFileScanImageToScanRegion() {
        const $this = this;
        const qrCodeScanRegion = document.getElementById(
            this.__getScanRegionId());

        if (this.fileScanImage) {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild(this.fileScanImage);
            return;
        }

        this.fileScanImage = new Image;
        this.fileScanImage.onload = _ => {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild($this.fileScanImage);
        }
        this.fileScanImage.width = 64;
        this.fileScanImage.style.opacity = 0.3;
        this.fileScanImage.src = Html5QrcodeScanner.ASSET_FILE_SCAN;
    }

    __clearScanRegion() {
        const qrCodeScanRegion = document.getElementById(
            this.__getScanRegionId());
        qrCodeScanRegion.innerHTML = "";
    }
    //#endregion

    //#region state getters
    __getDashboardSectionId() {
        return `${this.elementId}__dashboard_section`;
    }

    __getDashboardSectionCameraScanRegionId() {
        return `${this.elementId}__dashboard_section_csr`;
    }

    __getDashboardSectionFileScanRegionId() {
        return `${this.elementId}__dashboard_section_fsr`;
    }

    __getDashboardSectionSwapLinkId() {
        return `${this.elementId}__dashboard_section_swaplink`;
    }

    __getScanRegionId() {
        return `${this.elementId}__scan_region`;
    }

    __getDashboardId() {
        return `${this.elementId}__dashboard`;
    }

    __getFileScanInputId() {
        return `${this.elementId}__filescan_input`;
    }

    __getStatusSpanId() {
        return `${this.elementId}__status_span`;
    }

    __getHeaderMessageContainerId() {
        return `${this.elementId}__header_message`;
    }

    __getCameraSelectionId() {
        return `${this.elementId}__camera_selection`;
    }

    __getCameraScanRegion() {
        return document.getElementById(
            this.__getDashboardSectionCameraScanRegionId());
    }

    __getFileScanRegion() {
        return document.getElementById(
            this.__getDashboardSectionFileScanRegionId());
    }

    __getFileScanInput() {
        return document.getElementById(this.__getFileScanInputId());
    }

    __getDashboardSectionSwapLink() {
        return document.getElementById(this.__getDashboardSectionSwapLinkId());
    }
    //#endregion
}
