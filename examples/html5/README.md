# html5-qrcode without any external frameworks

## Include the js library in your project
```html
<script src="https://unpkg.com/html5-qrcode"></script>
```

## Add a placeholder in html
```html
<div id="qr-reader" style="width:500px"></div>
<div id="qr-reader-results"></div>
```

## Init in javascript

```js
var resultContainer = document.getElementById('qr-reader-results');
var lastResult, countResults = 0;

function onScanSuccess(decodedText, decodedResult) {
    if (decodedText !== lastResult) {
        ++countResults;
        lastResult = decodedText;
        // Handle on success condition with the decoded message.
        console.log(`Scan result ${decodedText}`, decodedResult);
        resultContainer.innerHTML = `<div>Scan result: ${decodedText}</div>`;
    }
}

function onScanFailure(error) {
    // Handle scan failure, usually better to ignore and keep scanning.
    // console.warn(`Code scan error = ${error}`);
}

var html5QrcodeScanner = new Html5QrcodeScanner(
    "qr-reader", 
    { fps: 10, qrbox: {width: 250, height: 250} },
    /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);
```
