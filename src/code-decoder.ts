/**
 * @fileoverview
 * Shim layer for providing the decoding library.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {
    QrcodeResult,
    Html5QrcodeSupportedFormats,
    QrcodeDecoder
} from "./core";

import { ZXingHtml5QrcodeDecoder } from "./zxing-html5-qrcode-decoder"

/**
 * Shim layer for {@interface QrcodeDecoder}.
 * 
 * Currently uses {@class ZXingHtml5QrcodeDecoder}, can be replace with another library.
 */
export class Html5QrcodeShim implements QrcodeDecoder {
    
    private zxingDecorderDelegate: QrcodeDecoder;

    public constructor(
        requestedFormats: Array<Html5QrcodeSupportedFormats>,
        verbose: boolean) {
        this.zxingDecorderDelegate = new ZXingHtml5QrcodeDecoder(requestedFormats, verbose);
    }

    decode(canvas: HTMLCanvasElement): QrcodeResult {
        return this.zxingDecorderDelegate.decode(canvas);
    }
}
