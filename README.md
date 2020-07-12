# Html5-QRCode
A cross-platform HTML5 QR code reader.
Use this light-weight Javascript library `(~68 Kb)` to add QR Code scanning capability in your web application. 
 - Supports easy scanning using web-cam or camera in the smartphones (Android / IOS).
 - **Recently Added** Scanning QR Code from files or default camera on smartphones. 

> Support for scanning local files on the device is a new addition and helpful for the web browser which does not support inline web-camera access in smartphones. **Note:** This doesn't upload files to any server - everything is done locally.

[![Build Status](https://travis-ci.org/mebjas/html5-qrcode.svg?branch=master)](https://travis-ci.org/mebjas/html5-qrcode) [![GitHub issues](https://img.shields.io/github/issues/mebjas/html5-qrcode)](https://github.com/mebjas/html5-qrcode/issues) [![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/mebjas/html5-qrcode)](https://github.com/mebjas/html5-qrcode/releases) ![GitHub](https://img.shields.io/github/license/mebjas/html5-qrcode)

[![npm](https://nodei.co/npm/html5-qrcode.png)](https://www.npmjs.com/package/html5-qrcode)

<img src="./assets/pixel3.gif" width="200px"><br>
_Figure: Running on Android, Pixel 3_

## Supported platforms
Working on adding support for more and more platforms. If you find a platform or browser where the library is not working please feel free to file an issue. Check the [demo link](https://blog.minhazav.dev/research/html5-qrcode.html) to test out.

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

|<img src="./assets/html5.png" width="30px">| <img src="./assets/vuejs.png" width="30px">|<img src="./assets/electron.png" width="30px">
| -------- | -------- | -------- |
| [Html5](./examples/html5) | [VueJs](./examples/vuejs) | [ElectronJs](./examples/electron)

## Description - [View Demo](https://blog.minhazav.dev/research/html5-qrcode.html)

This is a cross-platform javascript library to create a QRcode reader for HTML5 compatible browser.

Supports:
 - Querying all camera in the device (With user permissions)
 - Using any camera for scanning the QR Code.

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
> Ideally do not set the height of this container as the height should depend on the height of the video feed from the camera. The library would honor the existing width otherwise apply the default width. The height is derived from the aspect ratio of the video feed.

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
`Html5QrcodeScanner` lets you implement end to end scanner with few lines of
code with the default user interface which allows scanning using the camera or 
selecting an image from the file system.

You can setup the scanner as follows:
```js
function onScanSuccess(qrMessage) {
	// handle the scanned code as you like
	console.log(`QR matched = ${qrMessage}`);
}

function onScanFailure(error) {
	// handle scan failure, usually better to ignore and keep scanning
	console.warn(`QR error = ${error}`);
}

let html5QrcodeScanner = new Html5QrcodeScanner(
	"reader", { fps: 10, qrbox: 250 }, /* verbose= */ true);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);
```

### Pro Mode - if you want to implement your own user interface
You can use `Html5Qrcode` class to set up your QR code scanner (with your own user interface) and allow users to scan QR codes using the camera or by choosing an image file in the file system or native cameras in smartphones.

You can use the following APIs to `fetch camera`, `start` scanning and `stop` scanning.

#### For using inline QR Code scanning with Webcam or Smartphone camera

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

> You can optionally set another argument in constructor called `verbose`
> to print all logs to console
>
> ```js
> const html5QrCode = new Html5Qrcode("reader", /* verbose= */ true);
> ```

To stop using camera and thus stop scanning, call `Html5Qrcode#stop()` which returns a `Promise` for stopping the video feed and scanning.
```js
html5QrCode.stop().then(ignore => {
  // QR Code scanning is stopped.
}).catch(err => {
  // Stop failed, handle it.
});
```

> Note that the class is stateful and `stop()` should be called to properly tear down the video and camera objects safely after calling `start()` when the scan is over or user intend to move on. `stop()` will stop the video feed on the viewfinder.

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
> It's not mandatory to set the height and width of the HTML element. If provided the library would try to honour it. If it's not set the library would set a default width and derive the height based on the input image's aspect ratio.

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

> Note that inline scanning and file-based scanning are mutually exclusive at the moment. This means, you can only use one of them at a time. I'll soon be adding support for the option to have both if the requirement comes in. If you want to use both, use `html5QrCode#clear()` method to clear the canvas.

## Demo
<img src="./assets/qr-code.png" width="200px"><br>
_Scan this image or visit [blog.minhazav.dev/research/html5-qrcode.html](https://blog.minhazav.dev/research/html5-qrcode.html)_

### For more information
Check this article on how to use this library, check the following articles:
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
This is a configuration for the QR code scanning which can effect both scanning behavior and UI. There are two optional properties right now if you don't want them you can just pass an empty object `{}`.

#### `fps` - Integer, Example = 10
A.K.A frame per second, the default value for this is 2 but it can be increased to get faster scanning. Increasing too high value could affect performance. Value `>1000` will simply fail.

#### `qrbox` - Integer, Example = 250
Use this property to limit the region of the viewfinder you want to use for scanning. The rest of the viewfinder would be shaded. For example by passing config `{ qrbox : 250 }`, the screen will look like:

<img src="./assets/screen.gif">

If you do not pass any value, the whole viewfinder would be used for scanning. 
**Note**: this value has to be smaller than the width and height of the `QR code HTML element`.

## How to modify and build
1. Code changes should only be made to [html5-qrcode.js](./html5-qrcode.js) or 
[third_party/qrcode.js](./third_party/qrcode.js).
2. Run `npm run-script build`. This should do `transpiling` --> `minification` --> `merging` different js code.

> Before sending a pull request with changes to [html5-qrcode.js](./html5-qrcode.js) please run instruction (2).

## Credits
The decoder used for the QRcode reading is from `LazarSoft` https://github.com/LazarSoft/jsqrcode<br>
