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