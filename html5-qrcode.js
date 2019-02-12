(function($) {
    var cameraIds = [];

    /**
     * Code to initialise the cameraIds field
     */
    function gotSources(sourceInfos) {
        for (var i = 0; i !== sourceInfos.length; ++i) {
            var sourceInfo = sourceInfos[i];
            if (sourceInfo.kind === 'video') {
                cameraIds.push(sourceInfo.id);
            }
        }
    }

    if (typeof MediaStreamTrack === 'undefined' ||
        typeof MediaStreamTrack.getSources === 'undefined') {
        console.log('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
    } else {
        MediaStreamTrack.getSources(gotSources);
    }

    jQuery.fn.extend({
        /**
         * jQuery method, 
         * @param: qrcodeSuccess (function) - callback on success
         * @param: qrcodeError (function) - callback on qr error
         * @param: videoError (function) - callback on video error
         * @param: camera (int) - which camera to use
         */
        html5_qrcode: function(qrcodeSuccess, qrcodeError, videoError, camera) {
            return this.each(function() {

                var currentElem = $(this);

                $.data(currentElem[0], "qrcodeSuccess", qrcodeSuccess);
                $.data(currentElem[0], "qrcodeError", qrcodeError);
                $.data(currentElem[0], "videoError", videoError);

                if (typeof camera != 'undefined' && typeof cameraIds[camera] != 'undefined')
                    $.data(currentElem[0], "sourceId", camera);
                else $.data(currentElem[0], "sourceId", 0);

                if (typeof cameraIds[currentElem.data('sourceId')] != 'undefined')
                    $.data(currentElem[0], "cameraId", cameraIds[currentElem.data('sourceId')] );

                var height = currentElem.height();
                var width = currentElem.width();

                if (height == null) {
                    height = 250;
                }

                if (width == null) {
                    width = 300;
                }

                var vidElem = $('<video width="' + width + 'px" height="' + height + 'px"></video>').appendTo(currentElem);
                var canvasElem = $('<canvas id="qr-canvas" width="' + (width - 2) + 'px" height="' + (height - 2) + 'px" style="display:none;"></canvas>').appendTo(currentElem);

                var video = vidElem[0];
                var canvas = canvasElem[0];
                var context = canvas.getContext('2d');
                var localMediaStream;

                var scan = function() {
                    if (localMediaStream) {
                        context.drawImage(video, 0, 0, 307, 250);

                        try {
                            qrcode.decode();
                        } catch (e) {
                            qrcodeError(e, localMediaStream);
                        }

                        $.data(currentElem[0], "timeout", setTimeout(scan, 500));

                    } else {
                        $.data(currentElem[0], "timeout", setTimeout(scan, 500));
                    }
                };//end snapshot function

                window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

                var successCallback = function(stream) {
                    video.srcObject = stream;
                    localMediaStream = stream;
                    $.data(currentElem[0], "stream", stream);

                    video.play();
                    $.data(currentElem[0], "timeout", setTimeout(scan, 1000));
                };

                // Call the getUserMedia method with our callback functions
                if (navigator.getUserMedia) {
                    var config = {video: true};
                    if (typeof currentElem.data("cameraId") != 'undefined') {
                        config = {
                            video: {
                              optional: [{
                                sourceId: currentElem.data("cameraId")
                              }]
                            }
                          };
                    }

                    navigator.getUserMedia(config, successCallback, function(error) {
                        if (typeof videoError == 'function') videoError(error, localMediaStream);
                        else console.log('Error callback is undefined or not a function.');
                    });
                } else {
                    console.log('Native web camera streaming (getUserMedia) not supported in this browser.');
                    // Display a friendly "sorry" message to the user
                }

                qrcode.callback = function (result) {
                    if (typeof qrcodeSuccess == 'function')
                        qrcodeSuccess(result, localMediaStream);
                    else console.log('Success callback is undefined or not a function.');
                };
            }); // end of html5_qrcode
        },
        html5_qrcode_stop: function() {
            return this.each(function() {
                //stop the stream and cancel timeouts
                $(this).data('stream').getVideoTracks().forEach(function(videoTrack) {
                    videoTrack.stop();
                });

                $(this).children('video').remove();
                $(this).children('canvas').remove();

                clearTimeout($(this).data('timeout'));
            });
        },
        html5_qrcode_changeCamera: function() {
            return this.each(function() {
                //stop the stream and cancel timeouts
                $(this).html5_qrcode_stop();
                $(this).html5_qrcode(
                    $(this).data('qrcodeSuccess'),
                    $(this).data('qrcodeError'),
                    $(this).data('videoError'),
                    ($(this).data('sourceId') + 1) % cameraIds.length
                );
            });
        },
        html5_qrcode_cameraCount: function() {
            return cameraIds.length;
        }
    });
})(jQuery);