# html5-qrcode with lit

<img src="https://lit.dev/images/logo.svg" height="80px"><br>
[lit.dev](https://lit.dev/)

## How to create a `lit` component for `html5-qrcode`

### Create the component in JavaScript

```js
import { html, css, LitElement } from "https://unpkg.com/lit?module";
import { Html5QrcodeScanner } from "https://unpkg.com/html5-qrcode?module";

export class QRCodeScanner extends LitElement {
  render() {
    return html`
      <div id="reader"></div>
      <div>${this.decodedText}</div>
      <div>${this.errorMessage}</div>
    `;
  }

  firstUpdated() {
    const onScanSuccess = (decodedText, decodedResult) => {
      // handle the scanned code as you like
      this.decodedText = decodedText;
    };

    const onScanFailure = (errorMessage, error) => {
      // handle scan failure, usually better to ignore and keep scanning
      this.errorMessage = errorMessage;
    };

    const config = {
      fps: 10,
      qrbox: {
        width: 350,
        height: 250,
      },
    };

    const reader = this.shadowRoot.querySelector("#reader");
    const scanner = new Html5QrcodeScanner(reader, config);

    scanner.render(onScanSuccess, onScanFailure);
  }
}

customElements.define("qrcode-scanner", QRCodeScanner);
```

### Create the component in TypeScript

```ts
import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { query } from 'lit-element';
import { Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode/esm/core';
import { Html5QrcodeScanner } from 'html5-qrcode';

@customElement('qrcode-scanner')
export class QRCodeScanner extends LitElement {
  @query('#reader')
  reader: HTMLElement;

  protected render(): TemplateResult {
    return html` <div id="reader"></div> `;
  }

  protected firstUpdated(): void {
    const onScanSuccess = (
      decodedText: string,
      decodedResult: Html5QrcodeResult
    ) => {
      // handle the scanned code as you like
      console.log(`Code matched = ${decodedText}`, decodedResult);
    };

    const onScanFailure = (errorMessage: string, error: Html5QrcodeError) => {
      // handle scan failure, usually better to ignore and keep scanning
      console.warn(`Code scan error = ${errorMessage}`, error);
    };

    const config = {
      fps: 10,
      qrbox: {
        width: 350,
        height: 250,
      },
    };

    const scanner = new Html5QrcodeScanner(
      this.reader,
      config,
      false
    );

    scanner.render(onScanSuccess, onScanFailure);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qrcode-scanner': QRCodeScanner;
  }
}

```

### Include the component in your HTML page

```html
<!DOCTYPE html>
<head>
  <script type="module" src="./qrcode-scanner.js"></script>
</head>
<body>
  <qrcode-scanner></qrcode-scanner>
</body>
```

### Contributors
| Name | Profile|
| ----- | ------ |
| Markus Fürer | [@kusigit](https://github.com/kusigit) |
