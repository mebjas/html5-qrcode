import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { query } from 'lit-element';
import { Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode/esm/core';
import { Html5QrcodeScanner } from 'html5-qrcode';

@customElement('qrcode-scanner')
export class QRCodeScanner extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

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

    const html5QrcodeScanner = new Html5QrcodeScanner(
      this.reader,
      config,
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qrcode-scanner': QRCodeScanner;
  }
}
