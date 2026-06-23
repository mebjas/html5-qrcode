# Html5-QRCode

Cross-platform library for scanning QR codes, barcodes, and other common symbologies in the browser.

[Try live demo in your browser](https://tpwar.ru/qr/)

This fork is actively maintained and decodes images with [zxing-wasm](https://github.com/Sec-ant/zxing-wasm). The original [html5-qrcode](https://github.com/mebjas/html5-qrcode) project is no longer maintained.

## Install

```bash
npm install @taluks/html5-qrcode
```

Package on npm: [@taluks/html5-qrcode](https://www.npmjs.com/package/@taluks/html5-qrcode)

By default the ZXing reader WASM is loaded from **jsDelivr CDN** (no extra files required). For offline or self-hosted deployments you can load `zxing_reader.wasm` from the same directory as the script or from a custom URL — see [ZXing WASM loading](#zxing-wasm-loading-zxingwasm). The build copies `zxing_reader.wasm` into `dist/` and `minified/` for local hosting.

## Highlights

- Support for many 1D and 2D barcode formats — see [Supported code formats](#supported-code-formats).
- Works on common desktop and mobile browsers.
- Scan from the device camera or from image files selected on the device.
- Ready-made UI via `Html5QrcodeScanner`, or a lower-level API via `Html5Qrcode` for your own interface.
- Optional torch, zoom, and other scanner settings.

Two APIs are available:

- **`Html5QrcodeScanner`** — scanner with built-in UI; a few lines of code to integrate.
- **`Html5Qrcode`** — camera handling, permissions, and decoding without a bundled UI.

File-based scanning runs entirely in the browser. Nothing is uploaded to a server.

[![GitHub issues](https://img.shields.io/github/issues/taluks/html5-qrcode)](https://github.com/taluks/html5-qrcode/issues) [![GitHub tag](https://img.shields.io/github/v/tag/taluks/html5-qrcode)](https://github.com/taluks/html5-qrcode/releases) ![License](https://img.shields.io/github/license/taluks/html5-qrcode) [![npm](https://img.shields.io/npm/v/@taluks/html5-qrcode)](https://www.npmjs.com/package/@taluks/html5-qrcode)

## Documentation

Examples for plain HTML, Vue, Electron, and Lit are in the [examples](./examples) directory.

- [Html5](./examples/html5)
- [VueJs](./examples/vuejs)
- [ElectronJs](./examples/electron)
- [Lit](./examples/lit)

Configuration and API details are described below. Generated TypeScript API docs can be built with `npm run doc_gen`.

## Supported platforms

If the library does not work on your browser or device, please [open an issue](https://github.com/taluks/html5-qrcode/issues).

**Legend:** ✓ camera and file · ◐ file only

### PC / Mac

| Firefox | Chrome | Safari | Opera | Edge |
| ------- | ------ | ------ | ----- | ---- |
| ✓ | ✓ | ✓ | ✓ | ✓ |

### Android

| Chrome | Firefox | Edge | Opera | Opera Mini | UC |
| ------ | ------- | ---- | ----- | ---------- | -- |
| ✓ | ✓ | ✓ | ✓ | ◐ | ◐ |

### iOS

| Safari | Chrome | Firefox | Edge |
| ------ | ------ | ------- | ---- |
| ✓ | ✓* | ✓* | ◐ |

\* iOS 15.1 and later for camera access in non-Safari browsers. Older versions rely on WebKit without camera permission in third-party browsers — see [issue #14](https://github.com/taluks/html5-qrcode/issues/14).

## Supported code formats

Decoding is powered by **zxing-wasm**. Supported symbologies include:

| Format | Format |
| ------ | ------ |
| QR Code | AZTEC |
| CODE_39 | CODE_93 |
| CODE_128 | ITF |
| EAN_13 | EAN_8 |
| PDF_417 | UPC_A |
| UPC_E | DATA_MATRIX |
| MAXICODE* | RSS_14* |
| RSS_EXPANDED* | |

\* Not supported when using the experimental [BarcodeDetector integration](./experimental.md).

## Quick start

```html
<div id="reader" style="width:500px"></div>
```

```js
function onScanSuccess(decodedText, decodedResult) {
  console.log(`Code matched = ${decodedText}`, decodedResult);
}

const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  { fps: 10, qrbox: { width: 250, height: 250 } },
  false
);
html5QrcodeScanner.render(onScanSuccess);
```

Load the library from npm in your bundler, or include the UMD build from `minified/`. See [examples/html5](./examples/html5) for a minimal HTML setup.

## API configuration

Configuration for `Html5QrcodeScanner` and `Html5Qrcode#start()` controls scanning behaviour and the built-in UI. Most fields have defaults; you can pass `{}` to keep them.

### ZXing WASM loading (`zxingWasm`)

The decoder uses [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) **reader** only (`zxing_reader.wasm`). Three loading modes are supported:

| Mode | Config | When to use |
| ---- | ------ | ----------- |
| **CDN** (default) | omit `zxingWasm` or `loadMode: "cdn"` | Simplest setup; requires internet access to jsDelivr |
| **Same directory** | `loadMode: "sameDirectory"` | Host `zxing_reader.wasm` next to `html5-qrcode.min.js` (file is in `dist/` / `minified/` after build) |
| **Custom URL** | `loadMode: "custom"` + `wasmUrl` | Your own CDN path or absolute URL |

**CDN (default)** — no extra files:

```html
<script src="./html5-qrcode.min.js"></script>
```

**Same directory** — copy both files from `minified/` or `dist/`:

```html
<script src="./html5-qrcode.min.js"></script>
```

```js
const scanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  zxingWasm: { loadMode: "sameDirectory" },
}, false);
scanner.render(onScanSuccess);
```

**Custom URL**:

```js
zxingWasm: {
  loadMode: "custom",
  wasmUrl: "https://cdn.example.com/assets/zxing_reader.wasm",
}
```

**Global default** (before creating any scanner):

```js
import { configureZxingWasm, ZxingWasmLoadMode } from "@taluks/html5-qrcode";

configureZxingWasm({ loadMode: ZxingWasmLoadMode.SAME_DIRECTORY });
// or
configureZxingWasm({
  loadMode: ZxingWasmLoadMode.CUSTOM,
  wasmUrl: "/static/zxing_reader.wasm",
});
```

Per-instance `zxingWasm` on `Html5Qrcode` / `Html5QrcodeScanner` overrides the global setting.

### `fps` — number

Frames per second to scan. Default is `2`. Higher values can improve responsiveness but may cost performance. Values above `1000` are rejected.

### `qrbox` — `QrDimensions` or `QrDimensionFunction`

Limits the active scanning region. The rest of the viewfinder is dimmed.

```js
let config = { qrbox: { width: 250, height: 250 } };
```

Rectangular region example:

```js
let config = { qrbox: { width: 400, height: 150 } };
```

Dynamic size based on video dimensions:

```ts
type QrDimensionFunction =
  (viewfinderWidth: number, viewfinderHeight: number) => QrDimensions;
```

Useful for barcode scanning. If omitted, the full video frame is scanned.

### `aspectRatio` — number

Aspect ratio of the video feed, for example `1.777778` for 16:9.

| Value | Ratio | Typical use |
| ----- | ----- | ----------- |
| 1.333334 | 4:3 | Standard camera |
| 1.777778 | 16:9 | Widescreen |
| 1.0 | 1:1 | Square |

Must be smaller than the width and height of the scanner element. Unusual ratios may prevent the video from appearing.

### `disableFlip` — boolean, default `false`

When `true`, mirrored QR codes are not scanned. Disable only if the feed cannot be mirrored or you need the extra performance.

### `rememberLastUsedCamera` — boolean, default `true`

Remembers the last camera and permission state in `localStorage`. If permission was already granted, scanning starts with that camera without showing the permission prompt again.

### `supportedScanTypes` — `Array<Html5QrcodeScanType>`

Only for `Html5QrcodeScanner`. Default: camera and file.

```js
let config = {
  fps: 10,
  qrbox: { width: 100, height: 100 },
  rememberLastUsedCamera: true,
  supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
};

let html5QrcodeScanner = new Html5QrcodeScanner("reader", config, false);
html5QrcodeScanner.render(onScanSuccess);
```

File only:

```js
supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_FILE]
```

File as default tab:

```js
supportedScanTypes: [
  Html5QrcodeScanType.SCAN_TYPE_FILE,
  Html5QrcodeScanType.SCAN_TYPE_CAMERA,
]
```

### `showTorchButtonIfSupported` — boolean

Only for `Html5QrcodeScanner`. Shows a flash/torch toggle when the device and browser support it. Default `false`.

### Scanning specific formats

By default, camera and file scans try all supported formats. Restrict them with `formatsToSupport`:

```ts
enum Html5QrcodeSupportedFormats {
  QR_CODE = 0,
  AZTEC,
  CODABAR,
  CODE_39,
  CODE_93,
  CODE_128,
  DATA_MATRIX,
  MAXICODE,
  ITF,
  EAN_13,
  EAN_8,
  PDF_417,
  RSS_14,
  RSS_EXPANDED,
  UPC_A,
  UPC_E,
  UPC_EAN_EXTENSION,
}
```

Use this when you only need certain symbologies or want fewer decode attempts per frame.

#### QR code only with `Html5Qrcode`

```js
const html5QrCode = new Html5Qrcode("reader", {
  formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
});
const qrCodeSuccessCallback = (decodedText, decodedResult) => {
  /* handle success */
};
const config = { fps: 10, qrbox: { width: 250, height: 250 } };

html5QrCode.start({ facingMode: "user" }, config, qrCodeSuccessCallback);
```

#### QR and UPC with `Html5QrcodeScanner`

```js
function onScanSuccess(decodedText, decodedResult) {
  console.log(`Code matched = ${decodedText}`, decodedResult);
}

const formatsToSupport = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
];
const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    formatsToSupport: formatsToSupport,
  },
  false
);
html5QrcodeScanner.render(onScanSuccess);
```

## Experimental features

Some features are experimental and not recommended for production. Details: [experimental.md](./experimental.md).

- [BarcodeDetector JavaScript API](./experimental.md)

## Build from source

1. Change code only under [`src/`](./src).
2. `npm install`
3. `npm run build` — on Windows, `npm run build-windows`
4. Output: [`dist/html5-qrcode.min.js`](./dist/html5-qrcode.min.js) and [`dist/zxing_reader.wasm`](./dist/zxing_reader.wasm) (for local / offline hosting)
5. `npm test` before sending a pull request

Do not edit `dist/` or `minified/` by hand in pull requests.

## Contributing

- Report bugs and compatibility problems via [GitHub issues](https://github.com/taluks/html5-qrcode/issues).
- Suggest features or send pull requests for open issues.
- Add tests for new behaviour — see [tests](./tests).

## Credits

Barcode and QR decoding: [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) · [ZXing](https://github.com/zxing/zxing)

UI and camera integration in this library are based on the earlier html5-qrcode project (Apache-2.0).
