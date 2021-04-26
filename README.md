# Html5-QRCode 
## (supports barcodes now :))
A cross-platform HTML5 QR code & barcode reader.

Use this lightweight library to easily / quickly integrate QR code, bar code, and other common code scanning capabilities to your web application. 
 - Supports easy scanning using an integrated webcam or camera in smartphones (Android / IOS).
 - Supports scanning codes from files or default cameras on smartphones. 
 - **<u>Recently Added</u>**  Supports bar code scanning in various formats.
 - Supports two kind of APIs
    - `Html5QrcodeScanner` - End-to-end scanner with UI, integrate with less than ten lines of code.
    - `Html5Qrcode` - Powerful set of APIs you can use to build your UI without worrying about camera setup, handling permissions, reading codes, etc.

> Support for scanning local files on the device is a new addition and helpful for the web browser which does not support inline web-camera access in smartphones. **Note:** This doesn't upload files to any server - everything is done locally.

[![Build Status](https://travis-ci.org/mebjas/html5-qrcode.svg?branch=master)](https://travis-ci.org/mebjas/html5-qrcode) [![GitHub issues](https://img.shields.io/github/issues/mebjas/html5-qrcode)](https://github.com/mebjas/html5-qrcode/issues) [![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/mebjas/html5-qrcode)](https://github.com/mebjas/html5-qrcode/releases) ![GitHub](https://img.shields.io/github/license/mebjas/html5-qrcode)

[![npm](https://nodei.co/npm/html5-qrcode.png)](https://www.npmjs.com/package/html5-qrcode)

| <img src="./assets/pixel3.gif" width="200px"> | <img src="./assets/pixel4_barcode_480.gif" width="180px">|
| -- | -- |
| _Figure: Running on Android, Pixel 3_ | _Figure: Running on Android, Pixel 4, **Scanning different types of codes**_  |

## Supported platforms
We are working continuously on adding support for more and more platforms. If you find a platform or a browser where the library is not working, please feel free to file an issue. Check the [demo link](https://blog.minhazav.dev/research/html5-qrcode.html) to test it out.

##### Legends
 - ![](assets/done.png) Means full support - inline webcam and file based 
 - ![](assets/partial.png) Means partial support - only file based, webcam in progress

### PC / Mac

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" /><br/>Firefox | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" /><br/>Chrome | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" /><br/>Safari | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" /><br/>Opera | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" /><br/> Edge
| --------- | --------- | --------- | --------- | ------- |
|![](./assets/done.png)| ![](assets/done.png)| ![](assets/done.png)| ![](assets/done.png) | ![](assets/done.png)

### Android

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" /><br/>Chrome | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" /><br/>Firefox | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" /><br/> Edge | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" /><br/>Opera | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera-mini/opera-mini_48x48.png" alt="Opera-Mini" width="24px" height="24px" /><br/> Opera Mini | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/uc/uc_24x24.png" alt="UC" width="24px" height="24px" /> <br/> UC
| --------- | --------- | --------- | --------- |  --------- | --------- |
|![](./assets/done.png)| ![](assets/done.png)| ![](assets/done.png)| ![](assets/done.png)| ![](assets/partial.png) | ![](assets/partial.png) 

### IOS

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_24x24.png" alt="Safari" width="24px" height="24px" /><br/>Safari | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" /><br/>Chrome | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" /><br/>Firefox | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" /><br/> Edge 
| --------- | --------- | --------- | --------- |
|![](./assets/done.png)| ![](assets/partial.png)| ![](assets/partial.png)| ![](assets/partial.png) 

> Apparently, Webkit for IOS is used by Chrome, Firefox, and other browsers in IOS and they do not have webcam permissions yet. There is an ongoing issue on fixing the support for iOS - [issue/14](https://github.com/mebjas/html5-qrcode/issues/14)

### Framework support
The library can be easily used with several other frameworks, I have been adding examples for a few of them and would continue to add more.

|<img src="./assets/html5.png" width="30px">| <img src="./assets/vuejs.png" width="30px">|<img src="./assets/electron.png" width="30px"> | <img src="./assets/react.svg" width="30px">
| -------- | -------- | -------- | -------- |
| [Html5](./examples/html5) | [VueJs](./examples/vuejs) | [ElectronJs](./examples/electron) | [React](./examples/react)

### Supported Code formats
Code scanning is dependent on [Zxing-js](https://github.com/zxing-js/library) library. We will be working on top of it to add support for more types of code scanning. If you feel a certain type of code would be helpful to have, please file a feature request.

| Code | Example |
| ---- | ----- |
| QR Code | <img src="./assets/qr-code.png" width="200px"> |
| AZTEC | <img src="./assets/aztec.png" > |
| CODE_39|  <img src="./assets/code_39.gif" > |
| CODE_93| <img src="./assets/code_93.gif" >|
| CODE_128| <img src="./assets/code_128.gif" >|
| MAXICODE| <img src="./assets/maxicode.gif" > |
| ITF| <img src="./assets/itf.png" >|
| EAN_13|<img src="./assets/ean13.jpeg" > |
| EAN_8| <img src="./assets/ean8.jpeg" >|
| PDF_417| <img src="./assets/pdf417.png" >|
| RSS_14| <img src="./assets/rss14.gif" >|
| RSS_EXPANDED|<img src="./assets/rssexpanded.gif" > |
| UPC_A| <img src="./assets/upca.jpeg" >|
| UPC_E| <img src="./assets/upce.jpeg" >|
| DATA_MATRIX|<img src="./assets/datamatrix.png" > |

## Description - [View Demo](https://blog.minhazav.dev/research/html5-qrcode.html)

This is a cross-platform Javascript library to integrate QR code, bar codes & a few other types of code scanning capabilities to your applications running on HTML5 compatible browser.

Supports:
 - Querying camera on the device (with user permissions)
 - Rendering live camera feed, with easy to use user interface for scanning
 - Supports scanning a different kind of QR codes, bar codes and other formats
 - Supports selecting image files from the device for scanning codes

## How to use?
> For full information [read this article](https://blog.minhazav.dev/HTML5-QR-Code-scanning-launched-v1.0.1/).

Download the script from [release page](https://github.com/mebjas/html5-qrcode/releases) or `npm` with:
```
npm i html5-qrcode
```

Add an element you want to use as a placeholder for QR Code scanner
```html
<div id="reader" width="600px"></div>
```
> Ideally do not set the height of this container as the height should depend on the height of the video feed from the camera. The library would honor the existing width, otherwise apply the default width. The height is derived from the aspect ratio of the video feed.

Add `minified/html5-qrcode.min.js` in your web page. 
> I would recommend using the minified version as it's transformed to standard javascript. The `html5-qrcode.js` is written with ECMAScript and may not be supported in the older version of the browsers. I wrote in this as it's easier to maintain!

```html
<script src="./minified/html5-qrcode.js"></script>
<!--
  Or use directly from Github

<script src="https://raw.githubusercontent.com/mebjas/html5-qrcode/master/minified/html5-qrcode.min.js"></script>
-->
```

### Easy Mode - With end to end scanner user interface
`Html5QrcodeScanner` lets you implement an end to end scanner with few lines of code with the default user interface which allows scanning using the camera or selecting an image from the file system.

You can setup the scanner as follows:
```js
function onScanSuccess(qrMessage) {
	// handle the scanned code as you like, for example:
	console.log(`QR matched = ${qrMessage}`);
}

function onScanFailure(error) {
	// handle scan failure, usually better to ignore and keep scanning.
  // for example:
	console.warn(`QR error = ${error}`);
}

let html5QrcodeScanner = new Html5QrcodeScanner(
	"reader", { fps: 10, qrbox: 250 }, /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);
```

### Pro Mode - if you want to implement your own user interface
You can use `Html5Qrcode` class to set up your QR code scanner (with your own user interface) and allow users to scan QR codes using the camera or by choosing an image file in the file system or native cameras in smartphones.

You can use the following APIs to `fetch camera`, `start` scanning and `stop` scanning.

#### For using inline QR Code scanning with Webcam or Smartphone camera

##### Start Scanning
To get a list of supported cameras, query it using static method `Html5Qrcode.getCameras()`. This method returns a `Promise` with a list of devices supported in format `{ id: "id", label: "label" }`. 
```js
// This method will trigger user permissions
Html5Qrcode.getCameras().then(devices => {
  /**
   * devices would be an array of objects of type:
   * { id: "id", label: "label" }
   */
  if (devices && devices.length) {
    var cameraId = devices[0].id;
    // .. use this to start scanning.
  }
}).catch(err => {
  // handle err
});
```

**Important**: Note that this method will trigger user permission if the user has not granted it already. 
> Warning: Direct access to the camera is a powerful feature. It requires consent from the user, and your site MUST be on a secure origin (HTTPS).
> 
> Warning: Asking for access to the camera on page load will result in most of your users rejecting access to it. [More info](https://developers.google.com/web/fundamentals/media/capturing-images)

Once you have the camera id from `device.id`, start camera using `Html5Qrcode#start(..)`. This method returns a `Promise` with Qr code scanning initiation.
```js
const html5QrCode = new Html5Qrcode(/* element id */ "reader");
html5QrCode.start(
  cameraId, 
  {
    fps: 10,    // Optional frame per seconds for qr code scanning
    qrbox: 250  // Optional if you want bounded box UI
  },
  qrCodeMessage => {
    // do something when code is read
  },
  errorMessage => {
    // parse error, ignore it.
  })
.catch(err => {
  // Start failed, handle it.
});
```

> You can optionally set another argument in constructor called `verbose` to print all logs to console

```js
const html5QrCode = new Html5Qrcode("reader", /* verbose= */ true);
```

##### Scanning without cameraId
In mobile devices you may want users to directly scan the QR code using the back camera or the front camera for some use cases. For such cases you can avoid using the exact camera device id that you get from `Html5Qrcode.getCameras()`. The `start()` method allows passing constraints in place of camera device id similar to [html5 web API syntax](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Syntax). You can start scanning like mentioned in these examples:

```js
const html5QrCode = new Html5Qrcode("reader");
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

Passing the `cameraId` (recommended appraoch) is similar to
```js
html5QrCode.start({ deviceId: { exact: cameraId} }, config, qrCodeSuccessCallback);
```

##### Stop Scanning

To stop using camera and thus stop scanning, call `Html5Qrcode#stop()` which returns a `Promise` for stopping the video feed and scanning.
```js
html5QrCode.stop().then(ignore => {
  // QR Code scanning is stopped.
}).catch(err => {
  // Stop failed, handle it.
});
```

> Note that the class is stateful and `stop()` should be called to properly tear down the video and camera objects safely after calling `start()` when the scan is over or the user intend to move on. `stop()` will stop the video feed on the viewfinder.

#### For QR Code scanning using local files or inbuild camera on Smartphones
| Selector in Android | Selector in IOS|
|------|-------|
| Taken on Pixel 3, Google Chrome<br><img src="./assets/selector_android.png" width="300px"> |  Taken on iPhone 7, Google Chrome<br><img src="./assets/selector_iphone.jpg" width="300px"> |

You can alternatively leverage QR Code scanning for local files on the device or default camera on the device. It works similar to inline QR Code scanning.

Define the HTML container and import the javascript library as mentioned above
```html
<div id="reader" width="600px" height="600px"></div>
<script src="./minified/html5-qrcode.js"></script>
```
> It's not mandatory to set the height and width of the HTML element. If provided, the library would try to honor it. If it's not set, the library would set a default width and derive the height based on the input image's aspect ratio.

Add an `Input` element for supporting file selection like this:
```html
<input type="file" id="qr-input-file" accept="image/*">
<!-- 
  Or add captured if you only want to enable smartphone camera, PC browsers will ignore it.
-->

<input type="file" id="qr-input-file" accept="image/*" capture>
```
Find more information about this at [developers.google.com](https://developers.google.com/web/fundamentals/media/capturing-images).

And in javascript code initialize the object and attach listener like this:
```js
const html5QrCode = new Html5Qrcode(/* element id */ "reader");
// File based scanning
const fileinput = document.getElementById('qr-input-file');
fileinput.addEventListener('change', e => {
  if (e.target.files.length == 0) {
    // No file selected, ignore 
    return;
  }

  const imageFile = e.target.files[0];
  // Scan QR Code
  html5QrCode.scanFile(imageFile, true)
  .then(qrCodeMessage => {
    // success, use qrCodeMessage
    console.log(qrCodeMessage);
  })
  .catch(err => {
    // failure, handle it.
    console.log(`Error scanning file. Reason: ${err}`)
  });
});
```

> Note that inline scanning and file-based scanning are mutually exclusive at the moment. This means you can only use one of them at a time. I'll soon be adding support for the option to have both if the requirement comes in. If you want to use both, use `html5QrCode#clear()` method to clear the canvas.

## Demo
<img src="./assets/qr-code.png" width="200px"><br>
_Scan this image or visit [blog.minhazav.dev/research/html5-qrcode.html](https://blog.minhazav.dev/research/html5-qrcode.html)_

### For more information
Check these articles on how to use this library:
 - [HTML5 QR Code scanning - launched v1.0.1 without jQuery dependency and refactored Promise based APIs](https://blog.minhazav.dev/HTML5-QR-Code-scanning-launched-v1.0.1/).
 - [HTML5 QR Code scanning with javascript - Support for scanning the local file and using default camera added (v1.0.5)](https://blog.minhazav.dev/HTML5-QR-Code-scanning-support-for-local-file-and-default-camera/)

## Screenshots
![screenshot](assets/screen.gif)<br>
_Figure: Screenshot from Google Chrome running on Macbook Pro_

## Documentation
Following methods are available in this library

```js
class Html5Qrcode {
  /**
   * Returns a Promise with list of all cameras supported by the device.
   * 
   * The returned object is a list of result object of type:
   * [{
   *      id: String;     // Id of the camera.
   *      label: String;  // Human readable name of the camera.
   * }]
   */
  static getCameras() // Returns a Promise

  /**
   * Initialize QR Code scanner.
   * 
   * @param {String} elementId - Id of the HTML element.
   * @param {Boolean} verbose - Optional argument, if true, all logs
   *                  would be printed to console. 
   */
  constructor(elementId, verbose /* Optional */) {}

  /**
   * Start scanning QR Code for given camera.
   * 
   * @param {String or Object} identifier of the camera, it can either be the
   *  cameraId retrieved from {@code Html5Qrcode#getCameras()} method or
   *  object with facingMode constraint.
   *  Example values:
   *      - "a76afe74e951cde2d3e29aa73065c9cd89438627b3bde"
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
      qrCodeErrorCallback) {}  // Returns a Promise

  /**
   * Stops streaming QR Code video and scanning. 
   * 
   * @returns Promise for safely closing the video stream.
   */
  stop() {} // Returns a Promise

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
  scanFile(imageFile, /* default=true */ showImage) {}

  /**
   * Clears the existing canvas.
   * 
   * Note: in case of ongoing web cam based scan, it needs to be explicitly
   * closed before calling this method, else it will throw exception.
   */
  clear() {}  // Returns void
}

class Html5QrcodeScanner {
    /**
     * Creates instance of this class.
     *
     * @param {String} elementId - Id of the HTML element.
     * @param {Object} config extra configurations to tune QR code scanner.
     *  Supported Fields:
     *      - fps: expected framerate of qr scanning. example { fps: 2 }
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
     * @param {Boolean} verbose - Optional argument, if true, all logs
     *                  would be printed to console. 
     */
    constructor(elementId, config, verbose) {}

    /**
     * Renders the User Interface
     * 
     * @param {Function} qrCodeSuccessCallback - callback on QR Code found.
     *  Example:
     *      function(qrCodeMessage) {}
     * @param {Function} qrCodeErrorCallback - callback on QR Code parse error.
     *  Example:
     *      function(errorMessage) {}
     * 
     */
    render(qrCodeSuccessCallback, qrCodeErrorCallback) {}

    /**
     * Removes the QR Code scanner.
     * 
     * @returns Promise which succeeds if the cleanup is complete successfully,
     *  fails otherwise.
     */
    clear() {}
}
```

### Extra optional `configuration` in `start()` method
Configuration object that can be used to configure both the scanning behavior and the user interface (UI). Most of the fields have default properties that will be used unless a different value is provided. If you do not want to override anything, you can just pass in an empty object `{}`.

#### `fps` - Integer, Example = 10
A.K.A frame per second, the default value for this is 2 but it can be increased to get faster scanning. Increasing too high value could affect performance. Value `>1000` will simply fail.

#### `qrbox` - Integer, Example = 250
Use this property to limit the region of the viewfinder you want to use for scanning. The rest of the viewfinder would be shaded. For example, by passing config `{ qrbox : 250 }`, the screen will look like:

<img src="./assets/screen.gif">

#### `aspectRatio` - Float, Example 1.777778 for 16:9 aspect ratio
Use this property to render the video feed in a certain aspect ratio. Passing a nonstandard aspect ratio like `100000:1` could lead to the video feed not even showing up. Ideal values can be:
| Value | Aspect Ratio | Use Case |
| ----- | ------------ | -------- |
|1.333334 | 4:3 | Standard camera aspect ratio |
|1.777778 | 16:9 | Fullscreen, cinematic |
|1.0 | 1:1 | Square view |

If you do not pass any value, the whole viewfinder would be used for scanning. 
**Note**: this value has to be smaller than the width and height of the `QR code HTML element`.

#### `disableFlip` - Boolean (Optional), default = false.
By default, the scanner can scan for horizontally flipped QR Codes. This also enables scanning QR code using the front camera on mobile devices which are sometimes mirrored. This is `false` by default and I recommend changing this only if:
 - You are sure that the camera feed cannot be mirrored (Horizontally flipped)
 - You are facing performance issues with this enabled.

Here's an example of normal and mirrored QR Code
| Normal QR Code | Mirrored QR Code |
| ----- | ---- |
| <img src="./assets/qr-code.png" width="200px"> | <img src="./assets/qr-code-flipped.png" width="200px"><br> |

## How to modify and build
1. Code changes should only be made to 
   - [src/html5-qrcode.js](./src/html5-qrcode.js)
   - [src/html5-qrcode-scanner.js](./src/html5-qrcode-scanner.js)
   - [third_party/qrcode.js](./third_party/qrcode.js)
2. Run `npm run-script build`. 
    > This should do `transpiling` --> `minification` --> `merging` different js code.
3. Testing
    - Run `npm test`
    - Run the tests before sending PR, all tests should run.
    - Please add tests for new behaviors sent in PR.
4. Send a pull request
    - Include all the changes to `./src`, `./transpiled`, `./minified`. **Do not change `./transpiled` or `./minified` manually.**
    - In the PR add a comment like
      ```
      @all-contributors please add @mebjas for this new feature or tests
      ```
      For calling out your contributions - the bot will update the contributions file.

## Credits
The decoder used for the QRcode reading is from `Zxing-js` https://github.com/zxing-js/library<br>
