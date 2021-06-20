# Experimental features
Some of the features that are supported by the library but not officially
recommended to be used across devices. If you find any of the features useful,
please feel free to use them at your own risk, they are configurable in the
library. In future, based on the support level and compatibility, some of
these features will get upgraded to general feature list.

## Using experimental native BarcodeDetector API
Turning on this flag allows using native [BarcodeDetector](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector)
api now being introduced in web browsers for code scanning instead of `ZXing`
library we use officially.

### How to turn this on
It can be turned on using new config called `useBarCodeDetectorIfSupported`
added to `experimentalFeatures` config group. It's off (`value = false`) by
default. If set to on (`value = true`) and the `BarcodeDetector` is supported
by the browser, it'll be used for scanning all the kind of 1d and 2d codes.

#### Html5Qrcode class

```js
function onScanSuccess(decodedText, decodedResult) {
    /** Handle success condition. */
}

let html5qrcode = new Html5Qrcode("reader", {
    // Use this flag to turn on the feature.
    experimentalFeatures: {
        useBarCodeDetectorIfSupported: false
    }
});

const scanConfig = { fps: 10, qrbox: 250 };
// If you want to prefer front camera
html5qrcode.start({ facingMode: "user" }, scanConfig, onScanSuccess);
```

#### Html5QrcodeScanner class

```js
function onScanSuccess(decodedText, decodedResult) {
    /** Handle success condition. */
}

let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { 
        fps: 10,
        qrbox: 250,
        // Use this flag to turn on the feature.
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: false
        }
    });
html5QrcodeScanner.render(onScanSuccess);
```

### performance

Native scanning library seems to be giving better performance for scanning QR
codes than with Zxing library.

| Device | With ZXing | With BarcodeDecoder |
|--|--|--|
| Macbook Pro 16, Google Chrome | 21 ms |  10 ms|
| Pixel 4 Google Chrome | 56 ms | 23 ms |
| Pixel 4a Google Chrome | 92 ms| 47.3 ms |
| (low end) Android Device Google Chrome | 373 ms | 77.5 ms|

Not supported on:
-   Macbook Pro 16, Safari (macOS Big Sur)

### More references
-   [https://web.dev/shape-detection/#barcodedetector](https://web.dev/shape-detection/#barcodedetector)
