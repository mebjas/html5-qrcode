# html5-qrcode without any external frameworks

## Include the js library in your project
```html
<script src="https://unpkg.com/html5-qrcode"></script>
```

## Query an HTML element from DOM or Shadow DOM and pass it to the library

```js
const myCustomComponent = document.querySelector('custom-component');
const childComponentQrReaderElement = myCustomComponent.shadowRoot.querySelector('div.qr-reader')
var html5QrCodeScanner = new Html5QrcodeScanner(childComponentQrReaderElement, { fps: 10, qrbox: 250 });
html5QrCodeScanner.render(onScanSuccess);
```
