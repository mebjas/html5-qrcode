import { html, css, LitElement } from 'https://unpkg.com/lit?module';
import { Html5QrcodeScanner } from 'https://unpkg.com/html5-qrcode?module';

export class QRCodeScanner extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`<div id="reader"></div>`;
  }

  firstUpdated() {
    const onScanSuccess = (decodedText, decodedResult) => {
      // handle the scanned code as you like
      console.log(`Code matched = ${decodedText}`, decodedResult);
    };

    const onScanFailure = (errorMessage, error) => {
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

    const reader = this.shadowRoot.querySelector('#reader');
    const html5QrcodeScanner = new Html5QrcodeScanner(reader, config);

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  }
}

customElements.define('qrcode-scanner', QRCodeScanner);
