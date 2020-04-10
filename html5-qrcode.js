/**
 * HTML5 QR code scanning library.
 * 
 * Note that ECMA Script is not supported by all browsers. Use minified/html5-qrcode.min.js for better
 * browser support. The code is currently transformed using https://babeljs.io.
 * 
 * TODO(mebjas): Add support for autmated transpiling using babel.
 */
class Html5Qrcode {
    static DEFAULT_HEIGHT = 300;
    static DEFAULT_HEIGHT_OFFSET = 2;
    static DEFAULT_WIDTH = 300;
    static DEFAULT_WIDTH_OFFSET = 2;
    static SCAN_DEFAULT_FPS = 2;
    static MIN_QR_BOX_SIZE = 50;
    static SHADED_LEFT = 1;
    static SHADED_RIGHT = 2;
    static SHADED_TOP = 3;
    static SHADED_BOTTOM = 4;
    static SHADED_REGION_CLASSNAME = "qr-shaded-region";
    static VERBOSE = false;

    /**
     * Initialize QR Code scanner.
     * 
     * @param {String} elementId - Id of the HTML element. 
     */
    constructor(elementId) {
        this._elementId = elementId;
        this._foreverScanTimeout = null;
        this._localMediaStream = null;
        this._shouldScan = true;
        this._url = window.URL || window.webkitURL || window.mozURL || window.msURL;
        this._userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
            || navigator.mozGetUserMedia || navigator.msGetUserMedia;
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

        if (!qrCodeSuccessCallback || typeof qrCodeSuccessCallback != "function") {
            throw "qrCodeSuccessCallback is required and should be a function."
        }

        if (!qrCodeErrorCallback) {
            qrCodeErrorCallback = console.log;
        }

        const $this = this;

        // Create configuration by merging default and input settings.
        const config = configuration ? configuration : {};
        config.fps = config.fps ? config.fps : Html5Qrcode.SCAN_DEFAULT_FPS;
        
        // qr shaded box
        const isShadedBoxEnabled = config.qrbox != undefined;
        
        const element = document.getElementById(this._elementId);
        const width = element.clientWidth ? element.clientWidth : Html5Qrcode.DEFAULT_WIDTH;
        const height = element.clientHeight ? element.clientHeight : Html5Qrcode.DEFAULT_HEIGHT;

        // Validate before insertion
        if (isShadedBoxEnabled) {
            const qrboxSize = config.qrbox;
            if (qrboxSize < Html5Qrcode.MIN_QR_BOX_SIZE) {
                throw "minimum size of 'config.qrbox' is 50px.";
            }

            if (qrboxSize > width || qrboxSize > height) {
                throw "'config.qrbox' should be greater than width and height of the HTML element.";
            }
        }

        const qrRegion = isShadedBoxEnabled ? this._getShadedRegionBounds(width, height, config.qrbox) : {
            x: 0,
            y: 0,
            width: width,
            height: height
        };

        const videoElement = this._createVideoElement(width, height);
        const canvasElement = this._createCanvasElement(qrRegion.width, qrRegion.height);
        const context = canvasElement.getContext('2d');
        context.canvas.width = qrRegion.width;
        context.canvas.height = qrRegion.height;

        element.style.position = "relative";
        element.append(videoElement);
        element.append(canvasElement);
        if (isShadedBoxEnabled) {
            this._possiblyInsertShadingElement(element, height, qrRegion);
        }

        // save local states
        this._element = element;
        this._videoElement = videoElement;
        this._canvasElement = canvasElement;

        // Setup QR code.
        this._shouldScan = true;
        qrcode.callback = qrCodeSuccessCallback;

        // Method that scans forever.
        const foreverScan = () => {
            if (!$this._shouldScan) {
                // Stop scanning.
                return;
            }
            if ($this._localMediaStream) {
                context.drawImage(
                    videoElement,
                    /* sx= */ qrRegion.x, 
                    /* sy= */ qrRegion.y, 
                    /* sWidth= */ qrRegion.width, 
                    /* sHeight= */ qrRegion.height,
                    /* dx= */ 0,
                    /* dy= */  0, 
                    /* dWidth= */ qrRegion.width, 
                    /* dHeight= */ qrRegion.height);
                try {
                    qrcode.decode();
                } catch (exception) {
                    qrCodeErrorCallback(`QR code parse error, error = ${exception}`);
                }
            }
            $this._foreverScanTimeout = setTimeout(foreverScan, Html5Qrcode._getTimeoutFps(config.fps));
        }

        // success callback when user media (Camera) is attached.
        const getUserMediaSuccessCallback = stream => {
            videoElement.srcObject = stream;
            videoElement.play();
            $this._localMediaStream = stream;
            foreverScan();
        }

        return new Promise((resolve, reject) => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia(
                    { audio: false, video: { deviceId: { exact: cameraId }}})
                    .then(stream => {
                        getUserMediaSuccessCallback(stream);
                        resolve();
                    })
                    .catch(err => {
                        reject(`Error getting userMedia, error = ${err}`);
                    });
            } else if (navigator.getUserMedia) {
                const getCameraConfig = { video: { optional: [{ sourceId: cameraId }]}};
                navigator.getUserMedia(getCameraConfig,
                    stream => {
                        getUserMediaSuccessCallback(stream);
                        resolve();
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
            const tracksToClose = $this._localMediaStream.getVideoTracks().length;
            var tracksClosed = 0;

            const removeQrRegion = () => {
                while ($this._element.getElementsByClassName(Html5Qrcode.SHADED_REGION_CLASSNAME).length) {
                    $this._element.removeChild($this._element.getElementsByClassName(Html5Qrcode.SHADED_REGION_CLASSNAME)[0]);
                }
            }

            const onAllTracksClosed = () => {
                $this._localMediaStream = null;
                $this._element.removeChild($this._videoElement);
                $this._element.removeChild($this._canvasElement);

                removeQrRegion();
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
                navigator.mediaDevices.getUserMedia({audio: false, video: true}).then(ignore => {
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
                        resolve(results);
                    })
                    .catch(err => {
                        reject(`${err.name} : ${err.message}`);
                    });
                }).catch(err => {
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

    _createCanvasElement(width, height) {
        const canvasWidth = width;// - Html5Qrcode.DEFAULT_WIDTH_OFFSET;
        const canvasHeight = height;// - Html5Qrcode.DEFAULT_HEIGHT_OFFSET;
        const canvasElement = document.createElement('canvas');
        canvasElement.style.width = `${canvasWidth}px`;
        canvasElement.style.height = `${canvasHeight}px`;
        canvasElement.style.display = "none";
        // This id is set by lazarsoft/jsqrcode
        canvasElement.id = 'qr-canvas';
        return canvasElement;
    }

    _createVideoElement(width, height) {
        const videoElement = document.createElement('video');
        videoElement.style.height = `${height}px`;
        videoElement.style.width = `${width}px`;
        return videoElement;
    }

    _getShadedRegionBounds(width, height, qrboxSize) {
        if (qrboxSize > width || qrboxSize > height) {
            throw "'config.qrbox' should be greater than width and height of the HTML element.";
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

        element.append(this._createShadedElement(height, qrRegion, Html5Qrcode.SHADED_LEFT));
        element.append(this._createShadedElement(height, qrRegion, Html5Qrcode.SHADED_RIGHT));
        element.append(this._createShadedElement(height, qrRegion, Html5Qrcode.SHADED_TOP));
        element.append(this._createShadedElement(height, qrRegion, Html5Qrcode.SHADED_BOTTOM));
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
                elem.style.bottom = "0px";
                elem.style.left = `${qrRegion.x}px`;
                elem.style.width = `${qrRegion.width}px`;
                elem.style.height = `${qrRegion.y}px`;
                break;
            default:
                throw "Unsupported shadingPosition";
        }

        return elem;
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
