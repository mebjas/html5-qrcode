if (!assert) {
    assert = require("chai");
}

describe('Html5Qrcode is defined', function()  {
    it('Html5Qrcode is defined', function()  {
        assert.notEqual(Html5Qrcode, undefined);
    });
});

describe('Constructor', function()  {
    it('Constructor works', function()  {
        const html5Qrcode = new Html5Qrcode("qr");
        assert.notEqual(html5Qrcode, undefined);
    });

    it('Constructor fails if ZXing not defined', function() {
        const expectedErrorMessage = "Use html5qrcode.min.js without edit, ZXing not found.";
        const __ZXing = ZXing;
        ZXing = undefined;
        try {
            new Html5Qrcode("qr");
            assert.fail("exception should be thrown");
        } catch (exception) {
            assert.equal(exception, expectedErrorMessage);
        }

        ZXing = __ZXing;
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
            const elementId = "qr";
            const html5Qrcode = new Html5Qrcode(elementId);
            assert.equal(html5Qrcode._elementId, elementId);
        });
    
        it('_localMediaStream is null', function()  {
            const html5Qrcode = new Html5Qrcode("qr");
            assert.isNull(html5Qrcode._localMediaStream);
        });
    
        it('_shouldScan is true', function()  {
            const html5Qrcode = new Html5Qrcode("qr");
            assert.isTrue(html5Qrcode._shouldScan);
        });

        it('_isScanning is false', function()  {
            const html5Qrcode = new Html5Qrcode("qr");
            assert.isFalse(html5Qrcode._isScanning);
        });
    });    
});

describe('_createVideoConstraints', function() {
    it('direct deviceId', function() {
        const id = "deviceId";
        const html5Qrcode = new Html5Qrcode("qr");
        const config = html5Qrcode._createVideoConstraints(id);
        assert.deepEqual(config, { deviceId: { exact: id } });
    });

    it('deviceId as object', function() {
        const id = "deviceId";
        const html5Qrcode = new Html5Qrcode("qr");
        const config = html5Qrcode._createVideoConstraints({deviceId: id});
        assert.deepEqual(config, { deviceId: id });
    });

    it('deviceId as an exact object', function() {
        const inputConfig = {deviceId: {exact: "deviceId"}};
        const html5Qrcode = new Html5Qrcode("qr");
        const outputConfig = html5Qrcode._createVideoConstraints(inputConfig);
        assert.deepEqual(inputConfig, outputConfig);
    });

    it('deviceId as an incorrect object', function() {
        const inputConfig = {deviceId: {something: "deviceId"}};
        const html5Qrcode = new Html5Qrcode("qr");
        try {
            html5Qrcode._createVideoConstraints(inputConfig);
            assert.fail();
        } catch (exception) {
            assert.equal(
                exception,
                "'deviceId' should be string or object with exact as key.");
        }
    });

    it('facingMode:user as string', function() {
        const inputConfig = {facingMode: "user"};
        const html5Qrcode = new Html5Qrcode("qr");
        const outputConfig = html5Qrcode._createVideoConstraints(inputConfig);
        assert.deepEqual(inputConfig, outputConfig);
    });

    it('facingMode:environment as string', function() {
        const inputConfig = {facingMode: "environment"};
        const html5Qrcode = new Html5Qrcode("qr");
        const outputConfig = html5Qrcode._createVideoConstraints(inputConfig);
        assert.deepEqual(inputConfig, outputConfig);
    });

    it('facingMode:random as string fails', function() {
        const inputConfig = { facingMode: "random" };
        const html5Qrcode = new Html5Qrcode("qr");
        try {
            html5Qrcode._createVideoConstraints(inputConfig);
            assert.fail();
        } catch (exception) {
            assert.equal(
                exception,
                "config has invalid 'facingMode' value = 'random'");
        }
    });

    it('facingMode:user as object', function() {
        const inputConfig = {facingMode: {exact: "user"}};
        const html5Qrcode = new Html5Qrcode("qr");
        const outputConfig = html5Qrcode._createVideoConstraints(inputConfig);
        assert.deepEqual(inputConfig, outputConfig);
    });

    it('facingMode:environment as object', function() {
        const inputConfig = {facingMode: {exact: "environment"}};
        const html5Qrcode = new Html5Qrcode("qr");
        const outputConfig = html5Qrcode._createVideoConstraints(inputConfig);
        assert.deepEqual(inputConfig, outputConfig);
    });

    it('facingMode:random as object fails', function() {
        const inputConfig = {facingMode: {exact: "random"}};
        const html5Qrcode = new Html5Qrcode("qr");
        try {
            html5Qrcode._createVideoConstraints(inputConfig);
            assert.fail();
        } catch (exception) {
            assert.equal(
                exception,
                "config has invalid 'facingMode' value = 'random'");
        }
    });

    it('facingMode non exact as object fails', function() {
        const inputConfig = {facingMode: {random: "random"}};
        const html5Qrcode = new Html5Qrcode("qr");
        try {
            html5Qrcode._createVideoConstraints(inputConfig);
            assert.fail();
        } catch (exception) {
            assert.equal(
                exception,
                "'facingMode' should be string or object with exact as key.");
        }
    });

    it('empty config fails', function() {
        const inputConfig = {};
        const html5Qrcode = new Html5Qrcode("qr");
        try {
            html5Qrcode._createVideoConstraints(inputConfig);
            assert.fail();
        } catch (exception) {
            assert.equal(
                exception,
                "'cameraIdOrConfig' object should have exactly 1 key, "
                + "if passed as an object, found 0 keys");
        }
    });

    it('too many config fails', function() {
        const inputConfig = {facingMode: "user", random: "random"};
        const html5Qrcode = new Html5Qrcode("qr");
        try {
            html5Qrcode._createVideoConstraints(inputConfig);
            assert.fail();
        } catch (exception) {
            assert.equal(
                exception,
                "'cameraIdOrConfig' object should have exactly 1 key, "
                + "if passed as an object, found 2 keys");
        }
    });
});
