# html5-qrcode with HTML Element

### Include the js library in your project
```html
<script src="https://unpkg.com/html5-qrcode"></script>
```

### Create the component in JavaScript
```js
class CustomComponent extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();

        // Create a shadow root
        const shadow = this.attachShadow({ mode: 'open' });

        // Create elements
        const wrapper = document.createElement('div');
        const title = document.createElement('h2');
        title.innerText = 'HTML5 qr-code Scanner with shadow dom components';
        const idReader = document.createElement('div');
        idReader.className = 'qr-reader';
        idReader.style.width = '500px';
        wrapper.appendChild(title);
        wrapper.appendChild(idReader);
        // Attach the created elements to the shadow dom
        shadow.appendChild(wrapper);
    }
}

// Define the new element
customElements.define('custom-component', CustomComponent);
```

## Query an HTML element from DOM or Shadow DOM and pass it to the library

```js
const myCustomComponent = document.querySelector("custom-component");
const childComponentQrReaderElement = myCustomComponent.shadowRoot.querySelector("div.qr-reader");
const html5QrCodeScanner = new Html5QrcodeScanner(childComponentQrReaderElement, {
  fps: 10,
  qrbox: 250,
});
html5QrCodeScanner.render(onScanSuccess);
```

### Contributors
| Name | Profile|
| ----- | ------ |
| Bilal EL CHAMI | [@bilal-elchami](https://github.com/bilal-elchami) |