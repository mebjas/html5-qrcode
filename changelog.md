### Version 2.0.2
 - Bug fix: [Compatibility - [Android 11] [Chrome 88.0 ] - [Call stopScan will cause crash]](https://github.com/mebjas/html5-qrcode/issues/159) with PR from [MrGussio](https://github.com/MrGussio) - https://github.com/mebjas/html5-qrcode/pull/169

### Version 2.0.1
 - **Bug fix**: Zxing-js library was logging to console even if `verbose` is false - https://github.com/mebjas/html5-qrcode/issues/175

### Version 2.0.0
 - **Major Change** Migrated from Lazarsoft QR Code scanning to `ZXing-js`.
   - More robust support for QR Code scanning
   - Support for barcode scanning in following formats
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