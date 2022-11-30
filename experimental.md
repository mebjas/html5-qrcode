# Experimental features
Some of the features that are supported by the library but not officially
recommended to be used across devices. If you find any of the features useful,
please feel free to use them at your own risk, they are configurable in the
library. In future, based on the support level and compatibility, some of
these features will get upgraded to general feature list.

## Using experimental native BarcodeDetector API

> **Update** This config has now been graduated to `Html5QrcodeConfigs` and deprecated from experimental config. This feature is now enabled by default.

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
