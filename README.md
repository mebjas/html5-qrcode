# HTML5-QRCode
A cross platform HTML5 QR code reader.

## Description - [View Demo](https://blog.minhazav.dev/research/html5-qrcode.html)

This is a cross platform jQuery library to create a QRcode reader for HTML5 compatible browser.
It comes with option to `scan QR Code`, `Stop scanning`, `Switch Camera` and `get info on camera`.

## How to use?
Add an element you want to use as placeholder for QR Code scanner
```html
<div id="reader"></div>
```

Add `jQuery library`, `jsqrcode-combined.js` and `html5-qrcode.js` (or their minified versions).
```js
<script scr="./jqeury.js"></script>
<script scr="./jsqrcode-combined.js"></script>
<script scr="./html5-qrcode.js"></script>
```

To start the camera and start reading QR code
```js
  $('#reader').html5_qrcode(function(data){
    /* do something when code is read */
  }, function(error){
    /* show read errors */
  }, function(videoError){
    /* the video stream could be opened */
  });
```

> Note: you can also pass `fourth parameter` which is the `camera index` to use. If the device has 2 cameras and fourth parameter is `1` so 2nd camera will be used. If a wrong number is passed default camera shall be used.

To stop using camera and thus stop scanning, call
```js
  $('#reader').html5_qrcode_stop();
```

To switch camera, call
```js
  $('#reader').html5_qrcode_changeCamera();
```

To get no of cameras, call
```js
  var cameraCount = $("#reader").html5_qrcode_cameraCount();
```
## Demo
[blog.minhazav.dev/research/html5-qrcode.html](https://blog.minhazav.dev/research/html5-qrcode.html)

## Credits
The decoder used for the QRcode reading is from `LazarSoft` https://github.com/LazarSoft/jsqrcode<br>
The jqeury plugin has been adopted from `dwa012` https://github.com/dwa012/html5-qrcode