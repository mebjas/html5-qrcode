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
        if (!qrcode) {
          throw 'qrcode is not defined, use the minified/html5-qrcode.min.js for proper support';
        }

        this._elementId = elementId;
        this._foreverScanTimeout = null;
        this._localMediaStream = null;
        this._shouldScan = true;
        this._url = window.URL || window.webkitURL || window.mozURL || window.msURL;
        this._userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
            || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        this._isScanning = false;
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

        // Cleanup.
        this._clearElement();
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
                throw `minimum size of 'config.qrbox' is ${Html5Qrcode.MIN_QR_BOX_SIZE}px.`;
            }

            if (qrboxSize > width || qrboxSize > height) {
                throw "'config.qrbox' should not be greater than the "
                    + "width and height of the HTML element.";
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
                // Only decode the relevant area, ignore the shaded area, More reference:
                // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
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
                        $this._isScanning = true;
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
                        $this._isScanning = true;
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
            qrcode.callback = null;
            const tracksToClose = $this._localMediaStream.getVideoTracks().length;
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
     * This feature is mutually exclusive to camera based scanning, you should call
     * stop() if the camera based scanning was ongoing.
     * 
     * @param {File} imageFile a local file with Image content.
     * @param {boolean} showImage if true the Image will be rendered on given element.
     * 
     * @returns Promise with decoded QR code string on success and error message on failure.
     *            Failure could happen due to different reasons:
     *            1. QR Code decode failed because enough patterns not found in image.
     *            2. Input file was not image or unable to load the image or other image load
     *              errors.
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
  
      const computeCanvasDrawConfig = (imageWidth, imageHeight) => {
        const element = document.getElementById($this._elementId);
        const width = element.clientWidth ? element.clientWidth : Html5Qrcode.DEFAULT_WIDTH;
        const height = element.clientHeight ? element.clientHeight : Html5Qrcode.DEFAULT_HEIGHT;
  
        if (imageWidth <= width && imageHeight <= height) {
          // no downsampling needed.
          const xoffset = (width - imageWidth) / 2;
          const yoffset = (height - imageHeight) / 2;
          return {
            x: xoffset,
            y: yoffset,
            width: imageWidth,
            height: imageHeight
          }
        } else {
          const formerImageWidth = imageWidth;
          const formerImageHeight = imageHeight;
          if (imageWidth > width) {
            imageHeight = (width / imageWidth) * imageHeight;
            imageWidth = width;
          }
  
          if (imageHeight > height) {
            imageWidth = (height / imageHeight) * imageWidth;
            imageHeight = height;
          }
  
          Html5Qrcode._log(`Image downsampled from ${formerImageWidth}X${formerImageHeight}`
            + ` to ${imageWidth}X${imageHeight}.`)
          return computeCanvasDrawConfig(imageWidth, imageHeight);
        }
      }
  
      return new Promise((resolve, reject) => {
        $this._possiblyCloseLastScanImageFile();
        $this._clearElement();
        $this._lastScanImageFile = imageFile;
  
        const inputImage = new Image;
        inputImage.onload = () => {
          const element = document.getElementById($this._elementId);
          const containerWidth = element.clientWidth ? element.clientWidth : Html5Qrcode.DEFAULT_WIDTH;
          const containerHeight = element.clientHeight ? element.clientHeight : Html5Qrcode.DEFAULT_HEIGHT;
          const imageWidth = inputImage.width;
          const imageHeight = inputImage.height;
          const config = computeCanvasDrawConfig(imageWidth, imageHeight);
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
            resolve(qrcode.decode());
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

    _createVideoElement(width, height) {
        const videoElement = document.createElement('video');
        videoElement.style.height = `${height}px`;
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
