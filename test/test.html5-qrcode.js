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
        const html5Qrcode = new Html5Qrcode("qr");
        assert.notEqual(html5Qrcode, undefined);
    });

    it('Constructor fails if qrcode not defined', function() {
        const expectedErrorMessage = "qrcode is not defined, use the minified"
            + "/html5-qrcode.min.js for proper support";
        const qrCodeDeepCopy = JSON.parse(JSON.stringify(qrcode));
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