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

    static ASSET_FILE_SCAN = "https://raw.githubusercontent.com/mebjas/html5-qrcode/master/assets/file-scan.gif";
    static ASSET_CAMERA_SCAN = "https://raw.githubusercontent.com/mebjas/html5-qrcode/master/assets/camera-scan.gif";

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
