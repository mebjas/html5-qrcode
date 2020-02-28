(function($) {  
    var TIMEOUT_TAG = "TIMEOUT_TAG";
    var STREAM_TAG = "STREAM_TAG";
    var DEFAULT_HEIGHT = 250;
    var DEFAULT_HEIGHT_OFFSET = 2;
    var DEFAULT_WIDTH = 300;
    var DEFAULT_WIDTH_OFFSET = 2;
    var SCAN_DEFAULT_FPS = 2;

    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
        || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    function createVideoElement(width, height) {
        return '<video width="' + width + 'px" height="' + height + 'px"></video>';
    }

    function createCanvasElement(width, height) {
        return '<canvas id="qr-canvas" width="' 
            + (width - DEFAULT_WIDTH_OFFSET) 
            + 'px" height="' 
            + (height - DEFAULT_HEIGHT_OFFSET) 
            + 'px" style="display:none;"></canvas>';
    }

    function getTimeoutFromFps(fps) {
        return 1000 / fps;
    }

    jQuery.fn.extend({
        /**
         * Initializes QR code scanning on given element.
         *  
         * @param: cameraId (int) - which camera to use
         * @param: qrcodeSuccessCallback (function) - callback on success
         *              type: function (qrCodeMessage) {}
         * @param: qrcodeErrorCallback (function) - callback on QR parse error
         *              type: function (errorMessage) {}
         * @param: videoErrorCallback (function) - callback on video error
         *              type: function (errorMessage) {}
         * @param: config extra configurations to tune QR code scanner.
         *          Supported fields:
         *           - fps: expected framerate of qr code scanning. example { fps: 2 }
         *               means the scanning would be done every 500 ms.
         */
        html5_qrcode: function(
            cameraId,
            qrcodeSuccessCallback,
            qrcodeErrorCallback,
            videoErrorCallback,
            config) {
            return this.each(function() {
                if (cameraId == undefined) {
                    throw "cameraId is required"
                }

                // Initialize the callbacks
                qrcodeSuccessCallback = typeof qrcodeSuccessCallback === 'function' 
                    ? qrcodeSuccessCallback
                    : function (ignore) {
                        console.log('QR Code Success callback is undefined or not a function.');
                    }
                qrcodeErrorCallback = qrcodeErrorCallback ? qrcodeErrorCallback : function (error, stream) {}
                videoErrorCallback = typeof videoErrorCallback === 'function' ? videoErrorCallback : function (error) {
                    console.log('Error callback is undefined or not a function.', error);
                }

                config = config ? config : {};
                config.fps = config.fps ? config.fps : SCAN_DEFAULT_FPS;

                var currentElem = $(this);
                // Empty current item explicitly:
                currentElem.html("");

                var height = currentElem.height() == null ? DEFAULT_HEIGHT : currentElem.height();
                var width = currentElem.width() == null ? DEFAULT_WIDTH : currentElem.width();
                var vidElem = $(createVideoElement(width, height)).appendTo(currentElem);
                var canvasElem = $(createCanvasElement(width, height)).appendTo(currentElem);

                var video = vidElem[0];
                var canvas = canvasElem[0];
                var context = canvas.getContext('2d');
                var localMediaStream;
                var scan = function() {
                    if (localMediaStream) {
                        context.drawImage(video, 0, 0, width, height);
                        try {
                            qrcode.decode();
                        } catch (exception) {
                            qrcodeErrorCallback(exception, localMediaStream);
                        }
                    }
                    $.data(currentElem[0], TIMEOUT_TAG, setTimeout(scan, getTimeoutFromFps(config.fps)));
                }; //end snapshot function

                var successCallback = function (stream) {
                    video.srcObject = stream;
                    localMediaStream = stream;
                    $.data(currentElem[0], STREAM_TAG, stream);
                    $.data(currentElem[0], TIMEOUT_TAG, setTimeout(scan, getTimeoutFromFps(config.fps)));
                    video.play();
                };

                // Call the getUserMedia method with our callback functions
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia(
                        { audio: false, video: { deviceId: { exact: cameraId}}})
                        .then(successCallback)
                        .catch(successCallback);
                } else if (navigator.getUserMedia) {
                    qrcodeConfig = { video: { optional: [{ sourceId: cameraId }]}};
                    navigator.getUserMedia(
                        qrcodeConfig, successCallback, videoErrorCallback);
                }  else {
                    videoErrorCallback(
                        "Native web camera streaming (getUserMedia) not supported in this browser.");
                }

                qrcode.callback = qrcodeSuccessCallback;
            }); // end of html5_qrcode
        },
        /**
         * Stops streaming QR Code video and scanning.
         */
        html5_qrcode_stop: function() {
            return this.each(function() {
                // stop the stream and cancel timeouts
                $(this).data(STREAM_TAG).getVideoTracks().forEach(function (videoTrack) {
                    videoTrack.stop();
                });

                $(this).children('video').remove();
                $(this).children('canvas').remove();
                clearTimeout($(this).data(TIMEOUT_TAG));
            });
        },
        /**
         * Gets the count of number of available cameras.
         * 
         * @param onSuccessCallback (Function) called when camera count is available.
         *              type: Function (Array [{ id: String, label: String }]) {}
         *              This argument is required.
         * @param onErrorCallback (function) called when enumerating cameras fails.
         *              type: Function (String)
         */
        html5_qrcode_getSupportedCameras: function(onSuccessCallback, onErrorCallback) {
            if (typeof onSuccessCallback != 'function') {
                throw "onSuccessCallback (1st argument) should be a function."
            }

            onErrorCallback = typeof onErrorCallback == 'function'
                ? onErrorCallback
                : function (error) {
                    console.error("Unable to retreive supported cameras. Reason: ", error);
                }
            
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                navigator.mediaDevices.enumerateDevices()
                .then(function (devices) {
                    var results = [];
                    for (i = 0; i < devices.length; i++) {
                        var device = devices[i];
                        if (device.kind == "videoinput") {
                            results.push({
                                id: device.deviceId,
                                label: device.label
                            });
                        }
                    }
                    onSuccessCallback(results);
                })
                .catch(function (err) {
                    onErrorCallback(err.name + ": " + err.message);
                });
            } else if (typeof MediaStreamTrack != 'undefined' 
                && typeof MediaStreamTrack.getSources != 'undefined') {
                var callback = function (sourceInfos) {
                    var results = [];
                    for (i = 0; i !== sourceInfos.length; ++i) {
                        var sourceInfo = sourceInfos[i];
                        if (sourceInfo.kind === 'video') {
                            results.push({
                                id: sourceInfo.id,
                                label: sourceInfo.label
                            });
                        }
                    }
                    onSuccessCallback(results);
                }
                MediaStreamTrack.getSources(callback);
            } else {
                onErrorCallback("unable to query supported devices.");
            } 
        }
    });
})(jQuery);