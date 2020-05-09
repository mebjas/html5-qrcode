var assert = chai.assert;
var expect = chai.expect;

describe('Html5Qrcode is defined', function()  {
    it('qrcode is defined', function()  {
          assert.notEqual(qrcode, undefined);
    });

    it('Html5Qrcode is defined', function()  {
        assert.notEqual(Html5Qrcode, undefined);
    });
});

describe('Constructor', function()  {
    it('Constructor works', function()  {
        var html5Qrcode = new Html5Qrcode("qr");
        assert.notEqual(html5Qrcode, undefined);
    });

    it('Constructor fails if qrcode not defined', function() {
        var expectedErrorMessage = "qrcode is not defined, use the minified"
            + "/html5-qrcode.min.js for proper support";
        var qrCodeDeepCopy = JSON.parse(JSON.stringify(qrcode));
        qrcode = undefined;
        try {
            new Html5Qrcode("qr");
            assert.fail("exception should be thrown");
        } catch (exception) {
            assert.equal(exception, expectedErrorMessage);
        }

        qrcode = qrCodeDeepCopy;
    });

    describe('Verbosity is set', function()  {
        it('When explicitly provided as true, set to true', function()  {
            new Html5Qrcode("qr", true);
            assert.isTrue(Html5Qrcode.VERBOSE);
        });

        it('When explicitly provided as false, set to false', function()  {
            new Html5Qrcode("qr", false);
            assert.isFalse(Html5Qrcode.VERBOSE);
        });

        it('When not provided, set to false', function()  {
            new Html5Qrcode("qr");
            assert.isFalse(Html5Qrcode.VERBOSE);
        });

        it('When provided with !== true, set to false', function()  {
            new Html5Qrcode("qr", 123);
            assert.isFalse(Html5Qrcode.VERBOSE);
        });
    }); 

    // We should ideally not test for internal states.
    describe('Testing expected internal states', function()  {
        it('_elementId is set', function()  {
            var elementId = "qr";
            var html5Qrcode = new Html5Qrcode(elementId);
            assert.equal(html5Qrcode._elementId, elementId);
        });
    
        it('_localMediaStream is null', function()  {
            var html5Qrcode = new Html5Qrcode("qr");
            assert.isNull(html5Qrcode._localMediaStream);
        });
    
        it('_shouldScan is true', function()  {
            var html5Qrcode = new Html5Qrcode("qr");
            assert.isTrue(html5Qrcode._shouldScan);
        });

        it('_isScanning is false', function()  {
            var html5Qrcode = new Html5Qrcode("qr");
            assert.isFalse(html5Qrcode._isScanning);
        });
    });    
});

describe('getCameras()', function()  {
    var __getUserMedia;
    var __enumerateDevices;

    /** 
     * Sets up fake navigator.mediaDevices.getUserMedia
     * @param {Object} rejectionObject (Optional) rejection object of type
     *                  { name: <name>, message: <message> }
     */
    function setupFakeUserMedia(rejectionObj) {
        navigator.mediaDevices.getUserMedia = function (_) {
            return new Promise(function(resolve, reject) {
                if (rejectionObj) {
                    reject(rejectionObj);
                    return;
                }

                var stream = {};
                stream.getVideoTracks = function() { return []; }
                resolve(stream);
            });
        }
    }

    /**
     * Sets up fake navigator.mediaDevices.enumerateDevices
     * @param {Array} customList (Optional) custom list of devices to return
     * @param {Object} rejectionObject (Optional) rejection object of type
     *                  { name: <name>, message: <message> }
     */
    function setupFakeEnumerateDevicesDevices(customList, rejectionObject) {
        navigator.mediaDevices.enumerateDevices = function(_) {
            return new Promise(function(resolve, reject) {
                if (rejectionObject) {
                    reject(rejectionObject);
                    return;
                }

                if (customList) {
                    resolve(customList);
                    return;
                }

                var list = [];
                list.push(createInput("audio", 1));
                list.push(createInput("video", 2));
                list.push(createInput("video", 3));
                list.push(createInput("audio", 4));
                resolve(list);
            });
        }
    }

    this.beforeEach(function() {
        __getUserMedia = navigator.mediaDevices.getUserMedia;
        __enumerateDevices = navigator.mediaDevices.enumerateDevices;
    });

    this.afterEach(function() {
        navigator.mediaDevices.getUserMedia = __getUserMedia;
        navigator.mediaDevices.enumerateDevices = __enumerateDevices;
    })

    it('returns two cameras', async function() {
        setupFakeUserMedia();
        setupFakeEnumerateDevicesDevices();

        var cameras = await Html5Qrcode.getCameras();
        cameras.should.have.length(2);
    });
    
    it('returns correct id and label', async function() {
        setupFakeUserMedia();
        setupFakeEnumerateDevicesDevices();

        var cameras = await Html5Qrcode.getCameras();
        var firstCamera = cameras[0];
        assert.equal(firstCamera.id, "id2");
        assert.equal(firstCamera.label, "label2");
    });

    it('returns no devices if no device exist', async function() {
        setupFakeUserMedia();
        setupFakeEnumerateDevicesDevices([createInput("audio", 1)]);

        var cameras = await Html5Qrcode.getCameras();
        cameras.should.have.length(0);
    });

    it('promise to fail if enumerateDevices fails', async function() {
        var rejectionObj = {
            name: "UnableToQuery",
            message: "Unable to query"
        };
        setupFakeUserMedia();
        setupFakeEnumerateDevicesDevices([], rejectionObj);

        // TODO(mebjas): This is an antipatter, use eventually.rejectWith
        try {
            await Html5Qrcode.getCameras();
            assert.fail("Promise should fail");
        } catch (exception) {
            assert.equal(
                exception, `${rejectionObj.name} : ${rejectionObj.message}`);
        }
    });

    it('promise to fail if getUserMedia fails', async function() {
        var rejectionObj = {
            name: "OverconstrainedError",
            message: "over constriants"
        };
        setupFakeUserMedia();
        setupFakeEnumerateDevicesDevices([], rejectionObj);

        // TODO(mebjas): This is an antipatter, use eventually.rejectWith
        try {
            await Html5Qrcode.getCameras();
            assert.fail("Promise should fail");
        } catch (exception) {
            assert.equal(
                exception, `${rejectionObj.name} : ${rejectionObj.message}`);
        }
    });

    // TODO(mebjas): Add tests for backward compatible 
    // MediaStreamTrack.getSources
});

describe('start()', function()  {
    // TODO(mebjas): add tests for this method
});

describe('stop()', function()  {
    // TODO(mebjas): add tests for this method
});

describe('scanFile()', function()  {
    // TODO(mebjas): add tests for this method
});

describe('Non public methods for sanity', function() {
    describe('_log', function() {
        var expectedMessage = "expectedMessage";
        var _consoleLog;
        var _consoleMessage;
        function consoleLogInterceptor(message) {
            _consoleMessage = message;
        }

        this.beforeEach(function() {
            _consoleMessage = null;
            _consoleLog = console.log;
            console.log = consoleLogInterceptor;
        });

        this.afterEach(function() {
            console.log = _consoleLog;
        });

        it("If verbose, logs to console", function() {
            Html5Qrcode.VERBOSE = true;
            Html5Qrcode._log(expectedMessage);
            assert.equal(_consoleMessage, expectedMessage);
        });
        
        it("If not verbose, doesn't logs to console", function() {
            Html5Qrcode.VERBOSE = false;
            Html5Qrcode._log(expectedMessage);
            assert.isNull(_consoleMessage);
        });
    });

    describe('_getTimeoutFps', function() {
        it("returns 1000 / fps value", function() {
            assert.equal(Html5Qrcode._getTimeoutFps(10), 100);
        });
    });
});