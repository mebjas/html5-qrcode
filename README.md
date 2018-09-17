# html5-qrcode
A cross platform HTML5 QR code reader.

## Description - [View Demo](https://www.minhazav.xyz/samples/html5-qrcode/)

This is a cross platform jQuery library to create a QRcode reader for HTML5 compatible browser.
It comes with option to `scan QR Code`, `Stop scanning`, `Switch Camera` and `get info on camera`.

## How to use?
 -  Add an element you want to use as placeholder for QR Code scanner
```html
<div id="reader"></div>
```

 - Add `jQuery library`, `jsqrcode-combined.js` and `html5-qrcode.js` (or their minified versions).
```js
<script scr="./jqeury.js"></script>
<script scr="./jsqrcode-combined.js"></script>
<script scr="./html5-qrcode.js"></script>
```

 -  To start the camera and start reading QR code
```js
  $('#reader').html5_qrcode(function(data){
    /* do something when code is read */
  }, function(error){
    /* show read errors */
  }, function(videoError){
    /* the video stream could be opened */
  });
```
Note: you can also pass `fourth parameter` which is the `camera index` to use. If the device has 2 cameras and fourth parameter is `1` so 2nd camera will be used. If a wrong number is passed default camera shall be used.

 -  To stop using camera and thus stop scanning, call
```js
  $('#reader').html5_qrcode_stop();
```

 -  To switch camera, call
```js
  $('#reader').html5_qrcode_changeCamera();
```

 -  To get no of cameras, call
```js
  var cameraCount = $("#reader").html5_qrcode_cameraCount();
```
## Demo
Demo is available at: [https://minhazav.xyz > samples](https://www.minhazav.xyz/samples/html5-qrcode/)

## Credits
The decoder used for the QRcode reading is from `LazarSoft` https://github.com/LazarSoft/jsqrcode<br>
The jqeury plugin has been adopted from `dwa012` https://github.com/dwa012/html5-qrcode


## MIT LICENSE

Copyright © 2015 A V Minhaz <minhazav@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
