### Version 2.1.1
-   Fixed dashboard section exceeding the parent HTML element width.
-   Added support for following beta APIs which allows modifying running video
    stream state, which camera stream is running.
    ```js
    /**
     * Returns the capabilities of the running video track.
     * 
     * Note: Should only be called if {@code Html5QrcodeScanner#getState()}
     *   returns {@code Html5QrcodeScannerState#SCANNING} or 
     *   {@code Html5QrcodeScannerState#PAUSED}.
     *
     * @beta This is an experimental API
     * @returns the capabilities of a running video track.
     * @throws error if the scanning is not in running state.
     */
    public getRunningTrackCapabilities(): MediaTrackCapabilities;

    /**
     * Apply a video constraints on running video track from camera.
     *
     * Note: Should only be called if {@code Html5QrcodeScanner#getState()}
     *   returns {@code Html5QrcodeScannerState#SCANNING} or 
     *   {@code Html5QrcodeScannerState#PAUSED}.
     *
     * @beta This is an experimental API
     * @param {MediaTrackConstraints} specifies a variety of video or camera
     *  controls as defined in
     *  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * @returns a Promise which succeeds if the passed constraints are applied,
     *  fails otherwise.
     * @throws error if the scanning is not in running state.
     */
    public applyVideoConstraints(videoConstaints: MediaTrackConstraints)   
    ```

    **Important note**: Both these APIs are beta and not publicly documented.

-   Support for pausing and resuming code scanning in camera scan mode. New APIs
    are added to both `Html5QrcodeScanner` and `Html5Qrcode`. They should only be called when the scanner state is `Html5QrcodeScannerState#SCANNING` (== `2`) or
    `Html5QrcodeScannerState#PAUSED` (== `3`).
    
    APIs added:
    ```js
    /**
     * Pauses the ongoing scan.
     * 
     * Note: this will not stop the viewfinder, but stop decoding camera stream.
     * 
     * @throws error if method is called when scanner is not in scanning state.
     */
    public pause();

    /**
     * Resumes the paused scan.
     * 
     * Note: with this caller will start getting results in success and error
     * callbacks.
     * 
     * @throws error if method is called when scanner is not in paused state.
     */
    public resume();

        /**
     * Gets state of the camera scan.
     *
     * @returns state of type {@enum ScannerState}.
     */
    public getState(): Html5QrcodeScannerState;
    ```

    Example usage:

    ```js
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10,
            qrbox: {width: 250, height: 250},
            rememberLastUsedCamera: true,
            aspectRatio: 1.7777778
        });

    function onScanSuccess(decodedText, decodedResult) {
        if (html5QrcodeScanner.getState() 
            !== Html5QrcodeScannerState.NOT_STARTED) {
            // Add this check to ensure success callback is not being called
            // from file based scanner.

            // Pause on scan result
            html5QrcodeScanner.pause();
        }


        // Handle your business logic
        // ...

        // .. ok to resume now or elsewhere.
        // just call html5QrcodeScanner.resume();
        // Make sure to check if the state is !== NOT_STARTED
    }
	html5QrcodeScanner.render(onScanSuccess);
    ```

    Note: when camera scan is paused it adds a UI element indicating that state.

### Version 2.1.0
-   `[Fixed]` issues related to using with lodash - https://github.com/mebjas/html5-qrcode/issues/284
-   `[Fixed]` Unable to use with typescript definition - https://github.com/mebjas/html5-qrcode/issues/283
-   `[Fixed]` Not working with react - https://github.com/mebjas/html5-qrcode/issues/322
-   `[Fixed]` TypeError: Html5QrcodeScanner is not a constructor - https://github.com/mebjas/html5-qrcode/issues/270
-   `[Fixed]` TypeError: window._ is undefined - https://github.com/mebjas/html5-qrcode/issues/248

### Version 2.0.13
Added ability to set custom width and height to the scanner with `config.qrbox` argument.

Now we can pass `config.qrbox` argument as instance of interface `QrDimensions`.

```js
function onScanSuccess(decodedText, decodedResult) { /* handle success. */ }
function onScanFailure(error) { /* handle failure. */ }

let config = { fps: 10, qrbox: { width: 250, height: 250 } };

let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", config , /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);
```

For a rectangular QR Scanning box we can set it to something like:
```js
// .. rest of the code
let config = { fps: 10, qrbox: { width: 400, height: 150 } };

let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", config , /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);
```

### Version 2.0.12
-   Redundant information in the top status bar removed.
-   Added support for remembering permission and last camera used. This feature is on by default. Can be turned on or off using `rememberLastUsedCamera` flag in `Html5QrcodeScannerConfig`. How to explicitly enable it:
    ```js
      function onScanSuccess(decodedText, decodedResult) {
          // handle success.
      }
      let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10,
            qrbox: 250,
            rememberLastUsedCamera: true
            // ^ set this to false to disable this.
        });
      html5QrcodeScanner.render(onScanSuccess);
      ```

### Version 2.0.11
 -    Add support for native [BarcodeDetector](https://web.dev/shape-detection/#barcodedetector) based scanning.
      - On Chrome `ZXing` based decoder takes `20-25` ms on my Mac book pro 16.
      - On Chrome `BarcodeDetector` based decoder takes `8.6-11 ms` on my Mac book pro 16.
      ```js
      // How to enable
      // Note: will only work if browser / OS supports this HTML api.
      // Read more: https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector#browser_compatibility
      function onScanSuccess(decodedText, decodedResult) {
          // handle success.
      }
      let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10,
            qrbox: 250,
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            }
        });
      html5QrcodeScanner.render(onScanSuccess);
      ```

### Version 2.0.10
 -    Migrate from assets hosted on Github to embedded base64 assets.

### Version 2.0.9
 -    Added support for returning the type of code scanned ([feature request](https://github.com/mebjas/html5-qrcode/issues/224))

### Version 2.0.8
 - Added support for configuring supported formats in `Html5Qrcode` & `Html5QrcodeScanner`.

### Version 2.0.6
 - [Issue#211](https://github.com/mebjas/html5-qrcode/issues/211) fixed - swapped text for file based scanning and camera scanning during typescript migration.

### Version 2.0.5
 - [Issue#202](https://github.com/mebjas/html5-qrcode/issues/202) fixed - error logs dumped to console even if verbose flag is not set in `Html5Qrcode`.

### Version 2.0.4
 - **Source code migrated from javascript to typescript.**
 - [Issue#198](https://github.com/mebjas/html5-qrcode/issues/198) fixed - Fixing autoplay in Cordova Android apps

### Version 2.0.3
 - Show specific error messages if web-cam access fails due to insecure contexts like web page being neither `https` or `localhost`.

### Version 2.0.2
 - Bug fix: [Compatibility - [Android 11] [Chrome 88.0 ] - [Call stopScan will cause crash]](https://github.com/mebjas/html5-qrcode/issues/159) with PR from [MrGussio](https://github.com/MrGussio) - https://github.com/mebjas/html5-qrcode/pull/169

### Version 2.0.1
 - **Bug fix**: Zxing-js library was logging to console even if `verbose` is false - https://github.com/mebjas/html5-qrcode/issues/175

### Version 2.0.0
 - **Major Change** Migrated from Lazarsoft QR Code scanning to `ZXing-js`.
   - More robust support for QR Code scanning
   - Support for barcode scanning in the following formats
     ```
      ZXing.BarcodeFormat.QR_CODE,
      ZXing.BarcodeFormat.AZTEC,
      ZXing.BarcodeFormat.CODABAR,
      ZXing.BarcodeFormat.CODE_39,
      ZXing.BarcodeFormat.CODE_93,
      ZXing.BarcodeFormat.CODE_128,
      ZXing.BarcodeFormat.DATA_MATRIX,
      ZXing.BarcodeFormat.MAXICODE,
      ZXing.BarcodeFormat.ITF,
      ZXing.BarcodeFormat.EAN_13,
      ZXing.BarcodeFormat.EAN_8,
      ZXing.BarcodeFormat.PDF_417,
      ZXing.BarcodeFormat.RSS_14,
      ZXing.BarcodeFormat.RSS_EXPANDED,
      ZXing.BarcodeFormat.UPC_A,
      ZXing.BarcodeFormat.UPC_E,
      ZXing.BarcodeFormat.UPC_EAN_EXTENSION
      ```
   - Library size increased to `319Kb`.

### Version 1.2.3
 - Added support for `videoConstraints` in config as an experimental config.
    ```js
        /* videoConstraints: {MediaTrackConstraints}, Optional
         *  @beta(this config is not well supported yet).
         *
         *  Important: When passed this will override other configurations
         *  like 'cameraIdOrConfig' or configurations like 'aspectRatio'.
         *
         *  videoConstraints should be of type {@code MediaTrackConstraints}
         *  as defined in
         *  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
         *  and is used to specify a variety of video or camera controls
         *  like: aspect ratio, facing mode, video frame rate.
         */
    ```
    If passed this will override `cameraIdOrConfig` and `aspectRatio`.

 - Added two new experimental APIs in `Html5Qrcode` class
    - `getRunningTrackCapabilities()` - New

        ```js
        /**
         * Returns the capabilities of the running video track.
         * 
         * @beta This is an experimental API
         * @returns the capabilities of a running video track.
         * @throws error if the scanning is not in running state.
         */
        getRunningTrackCapabilities() {}
        ```
    - `applyVideoConstraints(videoConstaints)` - New

        ```js
        /**
         * Apply a video constraints on running video track.
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
        applyVideoConstraints(videoConstaints) {}
        ```

### Version 1.2.2
 - Bug fix in `Html5QrcodeScanner` - file scanning.

### Version 1.2.1
 + Added support for `facingMode` constraing in `Html5Qrcode#start`
 
**Update**:
In mobile devices you may want users to directly scan the QR code using the back camera or the front camera for some use cases. For such cases you can avoid using the exact camera device id that you get from `Html5Qrcode.getCameras()`. The `start()` method allows passing constraints in place of camera device id similar to [html5 web API syntax](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Syntax). You can start scanning like mentioned in these examples:

```js
const html5QrCode = new Html5Qrcode("#reader");
const qrCodeSuccessCallback = message => { /* handle success */ }
const config = { fps: 10, qrbox: 250 };

// If you want to prefer front camera
html5QrCode.start({ facingMode: "user" }, config, qrCodeSuccessCallback);

// If you want to prefer back camera
html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);

// Select front camera or fail with `OverconstrainedError`.
html5QrCode.start({ facingMode: { exact: "user"} }, config, qrCodeSuccessCallback);

// Select back camera or fail with `OverconstrainedError`.
html5QrCode.start({ facingMode: { exact: "environment"} }, config, qrCodeSuccessCallback);
```

### Version 1.2.0
 + Added support for scanning mirrored QR code, or scanning in case camera feed is mirrored (horizontally flipped).

### Version 1.1.9
 + Added support for `config.aspectRatio` in both `Html5Qrcode` and `Html5QrcodeScanner`

    Use this property to render the video feed in a certain aspect ratio. Passing a nonstandard aspect ratio like `100000:1` could lead to the video feed not even showing up. Ideal values can be:
    | Value | Aspect Ratio | Use Case |
    | ----- | ------------ | -------- |
    |1.333334 | 4:3 | Standard camera aspect ratio |
    |1.777778 | 16:9 | Fullscreen, cinematic |
    |1.0 | 1:1 | Square view |


### Version 1.1.8
 + Bug fix on `Html5QrcodeScanner#clear()`

### Version 1.1.7
 + `Html5QrcodeScanner#clear()` returns a `Promise`.

### Version 1.1.6
 + Bug fixes
   + [#74](https://github.com/mebjas/html5-qrcode/issues/74) - state errors on file based scanning.

### Version 1.1.0
 + Added support for a full scanner with end to end UI - `Html5QrcodeScanner`

### Version 1.0.9
 + Fixed issue [#41](https://github.com/mebjas/html5-qrcode/issues/41)
 + Added support for verbose logging in the library as a constructor argument.

### Version 1.0.8
 + Added support for realtime feedbacks on viewfinder for inline scanning
    |Platform|Screenshot|
    |------|-----------|
    |On PC | ![](./assets/screen.gif)|
    |On Android|![](./assets/pixel3.gif)|

### Version 1.0.7
 + Fixed the video size issue in [#21](https://github.com/mebjas/html5-qrcode/issues/21)
 + Removed fixed height of viewfinder, now the height is based on the video stream. The width is honored if the input element has a default width. Otherwise default width is applied.
 + If `config.qrbox` is greater than derived height, the config is ignored & no shading is applied.
 + The sequence of steps have changed
    + First we get the video feed from the selected camera
    + Then we render video
    + Then based on the height of the video we set the canvas and start scanning.
 + For file scanning, if the container element has some height or width both are honored. 
    Otherwise default width is applied and height is derived from the image.

### Older versions
Mostly covered in [readme](./README.md), changelog tracking started since `version 1.0.7`
