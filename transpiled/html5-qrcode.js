"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
var Html5Qrcode = /*#__PURE__*/function () {
  //#region static constants
  //#endregion

  /**
   * Initialize QR Code scanner.
   *
   * @param {String} elementId - Id of the HTML element.
   * @param {Boolean} verbose - Optional argument, if true, all logs
   *                  would be printed to console.
   */
  function Html5Qrcode(elementId, verbose) {
    _classCallCheck(this, Html5Qrcode);

    if (!getLazarSoftScanner) {
      throw 'Use html5qrcode.min.js without edit, getLazarSoftScanner' + 'not found.';
    }

    this.qrcode = getLazarSoftScanner();

    if (!this.qrcode) {
      throw 'qrcode is not defined, use the minified/html5-qrcode.min.js' + ' for proper support';
    }

    this._elementId = elementId;
    this._foreverScanTimeout = null;
    this._localMediaStream = null;
    this._shouldScan = true;
    this._url = window.URL || window.webkitURL || window.mozURL || window.msURL;
    this._userMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    this._isScanning = false;
    Html5Qrcode.VERBOSE = verbose === true;
  }
  /**
   * Start scanning QR Code for given camera.
   *
   * @param {String or Object} identifier of the camera, it can either be the
   *  cameraId retrieved from {@code Html5Qrcode#getCameras()} method or
   *  object with facingMode constraint.
   *  Example values:
   *      - "a76afe74e95e3aba9fc1b69c39b8701cde2d3e29aa73065c9cd89438627b3bde"
   *          ^ This is 'deviceId' from camera retrieved from
   *          {@code Html5Qrcode#getCameras()}
   *      - { facingMode: "user" }
   *      - { facingMode: "environment" }
   *      - { facingMode: { exact: "environment" } }
   *      - { facingMode: { exact: "user" } }
   *      - { deviceId: { exact: "a76afe74e95e3....73065c9cd89438627b3bde" }
   *      - { deviceId: "a76afe74e95e3....73065c9cd89438627b3bde" }
   *  Reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Syntax
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
   *      - aspectRatio: Optional, desired aspect ratio for the video feed.
   *          Ideal aspect ratios are 4:3 or 16:9. Passing very wrong aspect
   *          ratio could lead to video feed not showing up.
   *      - disableFlip: Optional, if {@code true} flipped QR Code won't be
   *          scanned. Only use this if you are sure the camera cannot give
   *          mirrored feed if you are facing performance constraints.
   *      - videoConstraints: {MediaTrackConstraints}, Optional
   *          @beta(this config is not well supported yet).
   *
   *          Important: When passed this will override other parameters
   *          like 'cameraIdOrConfig' or configurations like 'aspectRatio'.
   *
   *          videoConstraints should be of type {@code MediaTrackConstraints}
   *          as defined in
   *          https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
   *          and is used to specify a variety of video or camera controls
   *          like: aspectRatio, facingMode, frameRate, etc.
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


  _createClass(Html5Qrcode, [{
    key: "start",
    value: function start(cameraIdOrConfig, configuration, qrCodeSuccessCallback, qrCodeErrorCallback) {
      var _this = this;

      if (!cameraIdOrConfig) {
        throw "cameraIdOrConfig is required";
      }

      if (!qrCodeSuccessCallback || typeof qrCodeSuccessCallback != "function") {
        throw "qrCodeSuccessCallback is required and should be a function.";
      }

      if (!qrCodeErrorCallback) {
        qrCodeErrorCallback = console.log;
      } // Cleanup.


      this._clearElement();

      var $this = this; // Create configuration by merging default and input settings.

      var config = configuration ? configuration : {};
      config.fps = config.fps ? config.fps : Html5Qrcode.SCAN_DEFAULT_FPS; // Check if videoConstraints is passed and valid

      var videoConstraintsAvailableAndValid = false;

      if (config.videoConstraints) {
        if (!this._isMediaStreamConstraintsValid(config.videoConstraints)) {
          Html5Qrcode._logError("'videoConstraints' is not valid 'MediaStreamConstraints, " + "it will be ignored.'",
          /* experimental= */
          true);
        } else {
          videoConstraintsAvailableAndValid = true;
        }
      }

      var videoConstraintsEnabled = videoConstraintsAvailableAndValid; // qr shaded box

      var isShadedBoxEnabled = config.qrbox != undefined;
      var element = document.getElementById(this._elementId);
      var width = element.clientWidth ? element.clientWidth : Html5Qrcode.DEFAULT_WIDTH;
      element.style.position = "relative";
      this._shouldScan = true;
      this._element = element;
      this.qrcode.callback = qrCodeSuccessCallback; // Validate before insertion

      if (isShadedBoxEnabled) {
        var qrboxSize = config.qrbox;

        if (qrboxSize < Html5Qrcode.MIN_QR_BOX_SIZE) {
          throw "minimum size of 'config.qrbox' is" + " ".concat(Html5Qrcode.MIN_QR_BOX_SIZE, "px.");
        }

        if (qrboxSize > width) {
          throw "'config.qrbox' should not be greater than the " + "width of the HTML element.";
        }
      } //#region local methods

      /**
       * Setups the UI elements, changes the state of this class.
       *
       * @param width derived width of viewfinder.
       * @param height derived height of viewfinder.
       */


      var setupUi = function setupUi(width, height) {
        var qrboxSize = config.qrbox;

        if (qrboxSize > height) {
          // TODO(mebjas): Migrate to common logging.
          console.warn("[Html5Qrcode] config.qrboxsize is greater " + "than video height. Shading will be ignored");
        }

        var shouldShadingBeApplied = isShadedBoxEnabled && qrboxSize <= height;
        var defaultQrRegion = {
          x: 0,
          y: 0,
          width: width,
          height: height
        };
        var qrRegion = shouldShadingBeApplied ? _this._getShadedRegionBounds(width, height, qrboxSize) : defaultQrRegion;

        var canvasElement = _this._createCanvasElement(qrRegion.width, qrRegion.height);

        var context = canvasElement.getContext('2d');
        context.canvas.width = qrRegion.width;
        context.canvas.height = qrRegion.height; // Insert the canvas

        element.append(canvasElement);

        if (shouldShadingBeApplied) {
          _this._possiblyInsertShadingElement(element, width, height, qrboxSize);
        } // Update local states


        $this._qrRegion = qrRegion;
        $this._context = context;
        $this._canvasElement = canvasElement;
      };
      /**
       * Scans current context using the qrcode library.
       *
       * <p>This method call would result in callback being triggered by the
       * qrcode library. This method also handles the border coloring.
       *
       * @returns true if scan match is found, false otherwise.
       */


      var scanContext = function scanContext() {
        try {
          $this.qrcode.decode();

          _this._possiblyUpdateShaders(
          /* qrMatch= */
          true);

          return true;
        } catch (exception) {
          _this._possiblyUpdateShaders(
          /* qrMatch= */
          false);

          qrCodeErrorCallback("QR code parse error, error = ".concat(exception));
          return false;
        }
      }; // Method that scans forever.


      var foreverScan = function foreverScan() {
        if (!$this._shouldScan) {
          // Stop scanning.
          return;
        }

        if ($this._localMediaStream) {
          // There is difference in size of rendered video and one that is
          // considered by the canvas. Need to account for scaling factor.
          var videoElement = $this._videoElement;
          var widthRatio = videoElement.videoWidth / videoElement.clientWidth;
          var heightRatio = videoElement.videoHeight / videoElement.clientHeight;
          var sWidthOffset = $this._qrRegion.width * widthRatio;
          var sHeightOffset = $this._qrRegion.height * heightRatio;
          var sxOffset = $this._qrRegion.x * widthRatio;
          var syOffset = $this._qrRegion.y * heightRatio; // Only decode the relevant area, ignore the shaded area,
          // More reference:
          // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

          $this._context.drawImage($this._videoElement,
          /* sx= */
          sxOffset,
          /* sy= */
          syOffset,
          /* sWidth= */
          sWidthOffset,
          /* sHeight= */
          sHeightOffset,
          /* dx= */
          0,
          /* dy= */
          0,
          /* dWidth= */
          $this._qrRegion.width,
          /* dHeight= */
          $this._qrRegion.height); // Try scanning normal frame and in case of failure, scan
          // the inverted context if not explictly disabled.
          // TODO(mebjas): Move this logic to qrcode.js


          if (!scanContext() && config.disableFlip !== true) {
            // scan inverted context.
            _this._context.translate(_this._context.canvas.width, 0);

            _this._context.scale(-1, 1);

            scanContext();
          }
        }

        $this._foreverScanTimeout = setTimeout(foreverScan, Html5Qrcode._getTimeoutFps(config.fps));
      }; // success callback when user media (Camera) is attached.


      var onMediaStreamReceived = function onMediaStreamReceived(mediaStream) {
        return new Promise(function (resolve, reject) {
          var setupVideo = function setupVideo() {
            var videoElement = _this._createVideoElement(width);

            $this._element.append(videoElement); // Attach listeners to video.


            videoElement.onabort = reject;
            videoElement.onerror = reject;

            videoElement.onplaying = function () {
              var videoWidth = videoElement.clientWidth;
              var videoHeight = videoElement.clientHeight;
              setupUi(videoWidth, videoHeight); // start scanning after video feed has started

              foreverScan();
              resolve();
            };

            videoElement.srcObject = mediaStream;
            videoElement.play(); // Set state

            $this._videoElement = videoElement;
          };

          $this._localMediaStream = mediaStream; // If videoConstraints is passed, ignore all other configs.

          if (videoConstraintsEnabled || !config.aspectRatio) {
            setupVideo();
          } else {
            var constraints = {
              aspectRatio: config.aspectRatio
            };
            var track = mediaStream.getVideoTracks()[0];
            track.applyConstraints(constraints).then(function (_) {
              return setupVideo();
            })["catch"](function (error) {
              // TODO(mebjas): Migrate to common logging.
              console.log("[Warning] [Html5Qrcode] Constriants could not " + "be satisfied, ignoring constraints", error);
              setupVideo();
            });
          }
        });
      }; //#endregion


      return new Promise(function (resolve, reject) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Ignore all other video constraints if the videoConstraints
          // is passed.
          var videoConstraints = videoConstraintsEnabled ? config.videoConstraints : $this._createVideoConstraints(cameraIdOrConfig);
          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: videoConstraints
          }).then(function (stream) {
            onMediaStreamReceived(stream).then(function (_) {
              $this._isScanning = true;
              resolve();
            })["catch"](reject);
          })["catch"](function (err) {
            reject("Error getting userMedia, error = ".concat(err));
          });
        } else if (navigator.getUserMedia) {
          if (typeof cameraIdOrConfig != "string") {
            throw "The device doesn't support navigator.mediaDevices" + ", only supported cameraIdOrConfig in this case is" + " deviceId parameter (string).";
          }

          var getCameraConfig = {
            video: {
              optional: [{
                sourceId: cameraIdOrConfig
              }]
            }
          };
          navigator.getUserMedia(getCameraConfig, function (stream) {
            onMediaStreamReceived(stream).then(function (_) {
              $this._isScanning = true;
              resolve();
            })["catch"](reject);
          }, function (err) {
            reject("Error getting userMedia, error = ".concat(err));
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

  }, {
    key: "stop",
    value: function stop() {
      // TODO(mebjas): fail fast if the start() wasn't called.
      this._shouldScan = false;
      clearTimeout(this._foreverScanTimeout);
      var $this = this;
      return new Promise(function (resolve,
      /* ignore */
      reject) {
        $this.qrcode.callback = null;

        var tracksToClose = $this._localMediaStream.getVideoTracks().length;

        var tracksClosed = 0; // Removes the shaded region if exists.

        var removeQrRegion = function removeQrRegion() {
          while ($this._element.getElementsByClassName(Html5Qrcode.SHADED_REGION_CLASSNAME).length) {
            var shadedChild = $this._element.getElementsByClassName(Html5Qrcode.SHADED_REGION_CLASSNAME)[0];

            $this._element.removeChild(shadedChild);
          }
        };

        var onAllTracksClosed = function onAllTracksClosed() {
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
        };

        $this._localMediaStream.getVideoTracks().forEach(function (videoTrack) {
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

  }, {
    key: "scanFile",
    value: function scanFile(imageFile,
    /* default=true */
    showImage) {
      var $this = this;

      if (!imageFile || !(imageFile instanceof File)) {
        throw "imageFile argument is mandatory and should be instance " + "of File. Use 'event.target.files[0]'";
      }

      showImage = showImage === undefined ? true : showImage;

      if ($this._isScanning) {
        throw "Close ongoing scan before scanning a file.";
      }

      var computeCanvasDrawConfig = function computeCanvasDrawConfig(imageWidth, imageHeight, containerWidth, containerHeight) {
        if (imageWidth <= containerWidth && imageHeight <= containerHeight) {
          // no downsampling needed.
          var xoffset = (containerWidth - imageWidth) / 2;
          var yoffset = (containerHeight - imageHeight) / 2;
          return {
            x: xoffset,
            y: yoffset,
            width: imageWidth,
            height: imageHeight
          };
        } else {
          var formerImageWidth = imageWidth;
          var formerImageHeight = imageHeight;

          if (imageWidth > containerWidth) {
            imageHeight = containerWidth / imageWidth * imageHeight;
            imageWidth = containerWidth;
          }

          if (imageHeight > containerHeight) {
            imageWidth = containerHeight / imageHeight * imageWidth;
            imageHeight = containerHeight;
          }

          Html5Qrcode._log("Image downsampled from " + "".concat(formerImageWidth, "X").concat(formerImageHeight) + " to ".concat(imageWidth, "X").concat(imageHeight, "."));

          return computeCanvasDrawConfig(imageWidth, imageHeight, containerWidth, containerHeight);
        }
      };

      return new Promise(function (resolve, reject) {
        $this._possiblyCloseLastScanImageFile();

        $this._clearElement();

        $this._lastScanImageFile = imageFile;
        var inputImage = new Image();

        inputImage.onload = function () {
          var imageWidth = inputImage.width;
          var imageHeight = inputImage.height;
          var element = document.getElementById($this._elementId);
          var containerWidth = element.clientWidth ? element.clientWidth : Html5Qrcode.DEFAULT_WIDTH; // No default height anymore.

          var containerHeight = Math.max(element.clientHeight ? element.clientHeight : imageHeight, Html5Qrcode.FILE_SCAN_MIN_HEIGHT);
          var config = computeCanvasDrawConfig(imageWidth, imageHeight, containerWidth, containerHeight);

          if (showImage) {
            var visibleCanvas = $this._createCanvasElement(containerWidth, containerHeight, 'qr-canvas-visible');

            visibleCanvas.style.display = "inline-block";
            element.appendChild(visibleCanvas);

            var _context = visibleCanvas.getContext('2d');

            _context.canvas.width = containerWidth;
            _context.canvas.height = containerHeight; // More reference
            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

            _context.drawImage(inputImage,
            /* sx= */
            0,
            /* sy= */
            0,
            /* sWidth= */
            imageWidth,
            /* sHeight= */
            imageHeight,
            /* dx= */
            config.x,
            /* dy= */
            config.y,
            /* dWidth= */
            config.width,
            /* dHeight= */
            config.height);
          }

          var hiddenCanvas = $this._createCanvasElement(config.width, config.height);

          element.appendChild(hiddenCanvas);
          var context = hiddenCanvas.getContext('2d');
          context.canvas.width = config.width;
          context.canvas.height = config.height;
          context.drawImage(inputImage,
          /* sx= */
          0,
          /* sy= */
          0,
          /* sWidth= */
          imageWidth,
          /* sHeight= */
          imageHeight,
          /* dx= */
          0,
          /* dy= */
          0,
          /* dWidth= */
          config.width,
          /* dHeight= */
          config.height);

          try {
            resolve($this.qrcode.decode());
          } catch (exception) {
            reject("QR code parse error, error = ".concat(exception));
          }
        };

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

  }, {
    key: "clear",
    value: function clear() {
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

  }, {
    key: "getRunningTrackCapabilities",

    /**
     * Returns the capabilities of the running video track.
     *
     * @beta This is an experimental API
     * @returns the capabilities of a running video track.
     * @throws error if the scanning is not in running state.
     */
    value: function getRunningTrackCapabilities() {
      if (this._localMediaStream == null) {
        throw "Scanning is not in running state, call this API only when" + " QR code scanning using camera is in running state.";
      }

      if (this._localMediaStream.getVideoTracks().length == 0) {
        throw "No video tracks found";
      }

      var videoTrack = this._localMediaStream.getVideoTracks()[0];

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

  }, {
    key: "applyVideoConstraints",
    value: function applyVideoConstraints(videoConstaints) {
      var _this2 = this;

      if (!videoConstaints) {
        throw "videoConstaints is required argument.";
      } else if (!this._isMediaStreamConstraintsValid(videoConstaints)) {
        throw "invalid videoConstaints passed, check logs for more details";
      }

      if (this._localMediaStream == null) {
        throw "Scanning is not in running state, call this API only when" + " QR code scanning using camera is in running state.";
      }

      if (this._localMediaStream.getVideoTracks().length == 0) {
        throw "No video tracks found";
      }

      return new Promise(function (resolve, reject) {
        if ("aspectRatio" in videoConstaints) {
          reject("Chaning 'aspectRatio' in run-time is not yet " + "supported.");
          return;
        }

        var videoTrack = _this2._localMediaStream.getVideoTracks()[0]; // TODO(mebjas): This can be simplified to just return the promise
        // directly.


        videoTrack.applyConstraints(videoConstaints).then(function (_) {
          resolve(_);
        })["catch"](function (error) {
          reject(error);
        });
      });
    }
  }, {
    key: "_clearElement",
    value: function _clearElement() {
      if (this._isScanning) {
        throw 'Cannot clear while scan is ongoing, close it first.';
      }

      var element = document.getElementById(this._elementId);
      element.innerHTML = "";
    }
  }, {
    key: "_createCanvasElement",
    value: function _createCanvasElement(width, height, customId) {
      var canvasWidth = width;
      var canvasHeight = height;
      var canvasElement = document.createElement('canvas');
      canvasElement.style.width = "".concat(canvasWidth, "px");
      canvasElement.style.height = "".concat(canvasHeight, "px");
      canvasElement.style.display = "none"; // This id is set by lazarsoft/jsqrcode

      canvasElement.id = customId == undefined ? 'qr-canvas' : customId;
      return canvasElement;
    }
  }, {
    key: "_createVideoElement",
    value: function _createVideoElement(width) {
      var videoElement = document.createElement('video');
      videoElement.style.width = "".concat(width, "px");
      videoElement.muted = true;
      videoElement.playsInline = true;
      return videoElement;
    }
  }, {
    key: "_getShadedRegionBounds",
    value: function _getShadedRegionBounds(width, height, qrboxSize) {
      if (qrboxSize > width || qrboxSize > height) {
        throw "'config.qrbox' should not be greater than the " + "width and height of the HTML element.";
      }

      return {
        x: (width - qrboxSize) / 2,
        y: (height - qrboxSize) / 2,
        width: qrboxSize,
        height: qrboxSize
      };
    }
  }, {
    key: "_possiblyInsertShadingElement",
    value: function _possiblyInsertShadingElement(element, width, height, qrboxSize) {
      if (width - qrboxSize < 1 || height - qrboxSize < 1) {
        return;
      }

      var shadingElement = document.createElement('div');
      shadingElement.style.position = "absolute";
      shadingElement.style.borderLeft = "".concat((width - qrboxSize) / 2, "px solid #0000007a");
      shadingElement.style.borderRight = "".concat((width - qrboxSize) / 2, "px solid #0000007a");
      shadingElement.style.borderTop = "".concat((height - qrboxSize) / 2, "px solid #0000007a");
      shadingElement.style.borderBottom = "".concat((height - qrboxSize) / 2, "px solid #0000007a");
      shadingElement.style.boxSizing = "border-box";
      shadingElement.style.top = "0px";
      shadingElement.style.bottom = "0px";
      shadingElement.style.left = "0px";
      shadingElement.style.right = "0px";
      shadingElement.id = "".concat(Html5Qrcode.SHADED_REGION_CLASSNAME); // Check if div is too small for shadows. As there are two 5px width borders the needs to have a size above 10px.

      if (width - qrboxSize < 11 || height - qrboxSize < 11) {
        this.hasBorderShaders = false;
      } else {
        var smallSize = 5;
        var largeSize = 40;

        this._insertShaderBorders(shadingElement, largeSize, smallSize, -smallSize, 0, true);

        this._insertShaderBorders(shadingElement, largeSize, smallSize, -smallSize, 0, false);

        this._insertShaderBorders(shadingElement, largeSize, smallSize, qrboxSize + smallSize, 0, true);

        this._insertShaderBorders(shadingElement, largeSize, smallSize, qrboxSize + smallSize, 0, false);

        this._insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, -smallSize, -smallSize, true);

        this._insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, qrboxSize + smallSize - largeSize, -smallSize, true);

        this._insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, -smallSize, -smallSize, false);

        this._insertShaderBorders(shadingElement, smallSize, largeSize + smallSize, qrboxSize + smallSize - largeSize, -smallSize, false);

        this.hasBorderShaders = true;
      }

      element.append(shadingElement);
    }
  }, {
    key: "_insertShaderBorders",
    value: function _insertShaderBorders(shaderElem, width, height, top, side, isLeft) {
      var elem = document.createElement("div");
      elem.style.position = "absolute";
      elem.style.backgroundColor = Html5Qrcode.BORDER_SHADER_DEFAULT_COLOR;
      elem.style.width = "".concat(width, "px");
      elem.style.height = "".concat(height, "px");
      elem.style.top = "".concat(top, "px");

      if (isLeft) {
        elem.style.left = "".concat(side, "px");
      } else {
        elem.style.right = "".concat(side, "px");
      }

      if (!this.borderShaders) {
        this.borderShaders = [];
      }

      this.borderShaders.push(elem);
      shaderElem.appendChild(elem);
    }
  }, {
    key: "_possiblyUpdateShaders",
    value: function _possiblyUpdateShaders(qrMatch) {
      if (this.qrMatch === qrMatch) {
        return;
      }

      if (this.hasBorderShaders && this.borderShaders && this.borderShaders.length) {
        this.borderShaders.forEach(function (shader) {
          shader.style.backgroundColor = qrMatch ? Html5Qrcode.BORDER_SHADER_MATCH_COLOR : Html5Qrcode.BORDER_SHADER_DEFAULT_COLOR;
        });
      }

      this.qrMatch = qrMatch;
    }
  }, {
    key: "_possiblyCloseLastScanImageFile",
    value: function _possiblyCloseLastScanImageFile() {
      if (this._lastScanImageFile) {
        URL.revokeObjectURL(this._lastScanImageFile);
        this._lastScanImageFile = null;
      }
    } //#region private method to create correct camera selection filter.

  }, {
    key: "_createVideoConstraints",
    value: function _createVideoConstraints(cameraIdOrConfig) {
      if (typeof cameraIdOrConfig == "string") {
        // If it's a string it should be camera device Id.
        return {
          deviceId: {
            exact: cameraIdOrConfig
          }
        };
      } else if (_typeof(cameraIdOrConfig) == "object") {
        var facingModeKey = "facingMode";
        var deviceIdKey = "deviceId";
        var allowedFacingModeValues = {
          "user": true,
          "environment": true
        };
        var exactKey = "exact";

        var isValidFacingModeValue = function isValidFacingModeValue(value) {
          if (value in allowedFacingModeValues) {
            // Valid config
            return true;
          } else {
            // Invalid config
            throw "config has invalid 'facingMode' value = " + "'".concat(value, "'");
          }
        };

        var keys = Object.keys(cameraIdOrConfig);

        if (keys.length != 1) {
          throw "'cameraIdOrConfig' object should have exactly 1 key," + " if passed as an object, found ".concat(keys.length, " keys");
        }

        var key = Object.keys(cameraIdOrConfig)[0];

        if (key != facingModeKey && key != deviceIdKey) {
          throw "Only '".concat(facingModeKey, "' and '").concat(deviceIdKey, "' ") + " are supported for 'cameraIdOrConfig'";
        }

        if (key == facingModeKey) {
          /**
           * Supported scenarios:
           * - { facingMode: "user" }
           * - { facingMode: "environment" }
           * - { facingMode: { exact: "environment" } }
           * - { facingMode: { exact: "user" } }
           */
          var facingMode = cameraIdOrConfig[key];

          if (typeof facingMode == "string") {
            if (isValidFacingModeValue(facingMode)) {
              return {
                facingMode: facingMode
              };
            }
          } else if (_typeof(facingMode) == "object") {
            if (exactKey in facingMode) {
              if (isValidFacingModeValue(facingMode[exactKey])) {
                return {
                  facingMode: {
                    exact: facingMode[exactKey]
                  }
                };
              }
            } else {
              throw "'facingMode' should be string or object with" + " ".concat(exactKey, " as key.");
            }
          } else {
            var type = _typeof(facingMode);

            throw "Invalid type of 'facingMode' = ".concat(type);
          }
        } else {
          /**
           * key == deviceIdKey; Supported scenarios:
           * - { deviceId: { exact: "a76afe74e95e3.....38627b3bde" }
           * - { deviceId: "a76afe74e95e3....065c9cd89438627b3bde" }
           */
          var deviceId = cameraIdOrConfig[key];

          if (typeof deviceId == "string") {
            return {
              deviceId: deviceId
            };
          } else if (_typeof(deviceId) == "object") {
            if (exactKey in deviceId) {
              return {
                deviceId: {
                  exact: deviceId[exactKey]
                }
              };
            } else {
              throw "'deviceId' should be string or object with" + " ".concat(exactKey, " as key.");
            }
          } else {
            var _type = _typeof(deviceId);

            throw "Invalid type of 'deviceId' = ".concat(_type);
          }
        }
      } else {
        // invalid type
        var _type2 = _typeof(cameraIdOrConfig);

        throw "Invalid type of 'cameraIdOrConfig' = ".concat(_type2);
      }
    } //#endregion
    //#region private method to check for valid videoConstraints

  }, {
    key: "_isMediaStreamConstraintsValid",
    value: function _isMediaStreamConstraintsValid(videoConstraints) {
      if (!videoConstraints) {
        Html5Qrcode._logError("Empty videoConstraints",
        /* experimental= */
        true);

        return false;
      }

      if (_typeof(videoConstraints) !== "object") {
        var typeofVideoConstraints = _typeof(videoConstraints);

        Html5Qrcode._logError("videoConstraints should be of type object, the " + "object passed is of type ".concat(typeofVideoConstraints, "."),
        /* experimental= */
        true);

        return false;
      } // TODO(mebjas): Make this validity check more sophisticuated
      // Following keys are audio controls, audio controls are not supported.


      var bannedKeys = ["autoGainControl", "channelCount", "echoCancellation", "latency", "noiseSuppression", "sampleRate", "sampleSize", "volume"];
      var bannedkeysSet = new Set(bannedKeys);
      var keysInVideoConstraints = Object.keys(videoConstraints);

      for (var i = 0; i < keysInVideoConstraints.length; i++) {
        var key = keysInVideoConstraints[i];

        if (bannedkeysSet.has(key)) {
          Html5Qrcode._logError("".concat(key, " is not supported videoConstaints."),
          /* experimental= */
          true);

          return false;
        }
      }

      return true;
    } //#endregion

  }], [{
    key: "getCameras",
    value: function getCameras() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.getUserMedia) {
          _this3._log("navigator.mediaDevices used");

          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
          }).then(function (stream) {
            // hacky approach to close any active stream if they are
            // active.
            stream.oninactive = function (_) {
              return _this3._log("All streams closed");
            };

            var closeActiveStreams = function closeActiveStreams(stream) {
              var tracks = stream.getVideoTracks();

              for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];
                track.enabled = false;
                track.stop();
                stream.removeTrack(track);
              }
            };

            navigator.mediaDevices.enumerateDevices().then(function (devices) {
              var results = [];

              for (var i = 0; i < devices.length; i++) {
                var device = devices[i];

                if (device.kind == "videoinput") {
                  results.push({
                    id: device.deviceId,
                    label: device.label
                  });
                }
              }

              _this3._log("".concat(results.length, " results found"));

              closeActiveStreams(stream);
              resolve(results);
            })["catch"](function (err) {
              reject("".concat(err.name, " : ").concat(err.message));
            });
          })["catch"](function (err) {
            reject("".concat(err.name, " : ").concat(err.message));
          });
        } else if (MediaStreamTrack && MediaStreamTrack.getSources) {
          _this3._log("MediaStreamTrack.getSources used");

          var callback = function callback(sourceInfos) {
            var results = [];

            for (var i = 0; i !== sourceInfos.length; ++i) {
              var sourceInfo = sourceInfos[i];

              if (sourceInfo.kind === 'video') {
                results.push({
                  id: sourceInfo.id,
                  label: sourceInfo.label
                });
              }
            }

            _this3._log("".concat(results.length, " results found"));

            resolve(results);
          };

          MediaStreamTrack.getSources(callback);
        } else {
          _this3._log("unable to query supported devices.");

          reject("unable to query supported devices.");
        }
      });
    }
  }, {
    key: "_getTimeoutFps",
    value: function _getTimeoutFps(fps) {
      return 1000 / fps;
    }
  }, {
    key: "_log",
    value: function _log(message) {
      if (Html5Qrcode.VERBOSE) {
        console.log(message);
      }
    }
  }, {
    key: "_logError",
    value: function _logError(message, experimental) {
      if (Html5Qrcode.VERBOSE || experimental === true) {
        console.error(message);
      }
    }
  }]);

  return Html5Qrcode;
}();

_defineProperty(Html5Qrcode, "DEFAULT_WIDTH", 300);

_defineProperty(Html5Qrcode, "DEFAULT_WIDTH_OFFSET", 2);

_defineProperty(Html5Qrcode, "FILE_SCAN_MIN_HEIGHT", 300);

_defineProperty(Html5Qrcode, "SCAN_DEFAULT_FPS", 2);

_defineProperty(Html5Qrcode, "MIN_QR_BOX_SIZE", 50);

_defineProperty(Html5Qrcode, "SHADED_LEFT", 1);

_defineProperty(Html5Qrcode, "SHADED_RIGHT", 2);

_defineProperty(Html5Qrcode, "SHADED_TOP", 3);

_defineProperty(Html5Qrcode, "SHADED_BOTTOM", 4);

_defineProperty(Html5Qrcode, "SHADED_REGION_CLASSNAME", "qr-shaded-region");

_defineProperty(Html5Qrcode, "VERBOSE", false);

_defineProperty(Html5Qrcode, "BORDER_SHADER_DEFAULT_COLOR", "#ffffff");

_defineProperty(Html5Qrcode, "BORDER_SHADER_MATCH_COLOR", "rgb(90, 193, 56)");