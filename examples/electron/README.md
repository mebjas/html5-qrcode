# html5-qrcode with electron
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Electron_Software_Framework_Logo.svg/1024px-Electron_Software_Framework_Logo.svg.png" width="200px"><br>
[www.electronjs.org](https://https://www.electronjs.org/) | `Support Level` = `Strong`

## How to build a `electronjs` app using `html5-qrcode`

### Download the latest library
You can download this from [Github release page](https://github.com/mebjas/html5-qrcode/releases) or [npm](https://www.npmjs.com/package/html5-qrcode). And include this in `index.html`.

```html
<script src="html5-qrcode.min.js"></script>
```

### And include the `html` placeholder
```html
<div style="width: 600px" id="reader"></div>
```

### And `javascript` initialization
```js
function onScanSuccess(decodedText, decodedResult) {
    // Handle on success condition with the decoded message.
    console.log(`Scan result ${decodedText}`, decodedResult);
}
var html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);
```

## Run the app
```cmd
npm start
```