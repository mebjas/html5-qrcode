/**
 * HTML5 QR code scanning library.
 * 
 * Note that ECMA Script is not supported by all browsers. Use minified/html5-qrcode.min.js for better
 * browser support. The code is currently transformed using https://babeljs.io.
 * 
 * TODO(mebjas): Add support for autmated transpiling using babel.
 */
class Html5Qrcode {
    static DEFAULT_HEIGHT = 250;
    static DEFAULT_HEIGHT_OFFSET = 2;
    static DEFAULT_WIDTH = 300;
    static DEFAULT_WIDTH_OFFSET = 2;
    static SCAN_DEFAULT_FPS = 2;
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


        const element = document.getElementById(this._elementId);
        const width = element.clientWidth ? element.clientWidth : Html5Qrcode.DEFAULT_WIDTH;
        const height = element.clientHeight ? element.clientHeight : Html5Qrcode.DEFAULT_HEIGHT;
        const videoElement = this._createVideoElement(width, height);
        const canvasElement = this._createCanvasElement(width, height);
        const context = canvasElement.getContext('2d');
        context.canvas.width = width;
        context.canvas.height = height;

        element.append(videoElement);
        element.append(canvasElement);

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
                context.drawImage(videoElement, 0, 0, videoElement.clientWidth, videoElement.clientHeight);
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

            const onAllTracksClosed = () => {
                $this._localMediaStream = null;
                $this._element.removeChild($this._videoElement);
                $this._element.removeChild($this._canvasElement);
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

    static _getTimeoutFps(fps) {
        return 1000 / fps;
    }

    static _log(message) {
        if (Html5Qrcode.VERBOSE) {
            console.log(message);
        }
    }
}
