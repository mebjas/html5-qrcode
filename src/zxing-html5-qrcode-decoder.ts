/**
 * @fileoverview
 * {@interface QrcodeDecoder} wrapper around ZXing library.
 * 
 * @author mebjas <minhazav@gmail.com>
 *
 * ZXing library consumed as the @zxing/library npm dependency
 * (https://github.com/zxing-js/library).
 *
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

// Named imports (rather than `import * as ZXing`) so webpack's used-exports
// analysis can tree-shake the unused parts of @zxing/library (writers,
// browser capture readers). Referencing the namespace object itself would
// mark every export as used.
import {
    BarcodeFormat,
    BinaryBitmap,
    DecodeHintType,
    HTMLCanvasElementLuminanceSource,
    HybridBinarizer,
    MultiFormatReader
} from "@zxing/library";

import {
    QrcodeResult,
    QrcodeResultDebugData,
    QrcodeResultFormat,
    Html5QrcodeSupportedFormats,
    Logger,
    QrcodeDecoderAsync
} from "./core";

/**
 * ZXing based Code decoder.
 */
export class ZXingHtml5QrcodeDecoder implements QrcodeDecoderAsync {

    private readonly formatMap: Map<Html5QrcodeSupportedFormats, any>
        = new Map([
            [Html5QrcodeSupportedFormats.QR_CODE, BarcodeFormat.QR_CODE ],
            [Html5QrcodeSupportedFormats.AZTEC, BarcodeFormat.AZTEC ],
            [Html5QrcodeSupportedFormats.CODABAR, BarcodeFormat.CODABAR ],
            [Html5QrcodeSupportedFormats.CODE_39, BarcodeFormat.CODE_39 ],
            [Html5QrcodeSupportedFormats.CODE_93, BarcodeFormat.CODE_93 ],
            [
                Html5QrcodeSupportedFormats.CODE_128,
                BarcodeFormat.CODE_128 ],
            [
                Html5QrcodeSupportedFormats.DATA_MATRIX,
                BarcodeFormat.DATA_MATRIX ],
            [
                Html5QrcodeSupportedFormats.MAXICODE,
                BarcodeFormat.MAXICODE ],
            [Html5QrcodeSupportedFormats.ITF, BarcodeFormat.ITF ],
            [Html5QrcodeSupportedFormats.EAN_13, BarcodeFormat.EAN_13 ],
            [Html5QrcodeSupportedFormats.EAN_8, BarcodeFormat.EAN_8 ],
            [Html5QrcodeSupportedFormats.PDF_417, BarcodeFormat.PDF_417 ],
            [Html5QrcodeSupportedFormats.RSS_14, BarcodeFormat.RSS_14 ],
            [
                Html5QrcodeSupportedFormats.RSS_EXPANDED,
                BarcodeFormat.RSS_EXPANDED ],
            [Html5QrcodeSupportedFormats.UPC_A, BarcodeFormat.UPC_A ],
            [Html5QrcodeSupportedFormats.UPC_E, BarcodeFormat.UPC_E ],
            [
                Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
                BarcodeFormat.UPC_EAN_EXTENSION ]
        ]);
    private readonly reverseFormatMap: Map<any, Html5QrcodeSupportedFormats>
        = this.createReverseFormatMap();

    private hints: Map<any, any>;
    private verbose: boolean;
    private logger: Logger;

    public constructor(
        requestedFormats: Array<Html5QrcodeSupportedFormats>,
        verbose: boolean,
        logger: Logger,
        explicitFormatsRequested: boolean = true) {
        this.verbose = verbose;
        this.logger = logger;

        // @zxing/library's MultiFormatOneDReader emits an ungated
        // console.warn ("RSS Expanded reader IS NOT ready for production
        // yet") every time its reader list is constructed. A fresh
        // MultiFormatReader is created per scan (see decode()), so default
        // configurations (all formats) would spam the console every frame.
        // Unless the developer explicitly requested formats, keep
        // RSS_EXPANDED out of the ZXing hints.
        if (!explicitFormatsRequested) {
            requestedFormats = requestedFormats.filter(
                (format) =>
                    format !== Html5QrcodeSupportedFormats.RSS_EXPANDED);
            this.logger.warn(
                "RSS_EXPANDED was not requested explicitly; it will not be"
                + " scanned. Pass formatsToSupport with RSS_EXPANDED to"
                + " enable it.");
        }

        const formats = this.createZXingFormats(requestedFormats);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        // TODO(minhazav): Make this configurable by developers.
        hints.set(DecodeHintType.TRY_HARDER, false);
        this.hints = hints;
    }


    decodeAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult> {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.decode(canvas));
            } catch (error) {
                reject(error);
            }
        });
    }

    private decode(canvas: HTMLCanvasElement): QrcodeResult {
        // Note: Earlier we used to instantiate the zxingDecoder once as state
        // of this class and use it for each scans. There seems to be some
        // stateful bug in ZXing library around RSS_14 likely due to
        // https://github.com/zxing-js/library/issues/211.
        // Recreating a new instance per scan doesn't lead to performance issues
        // and temporarily mitigates this issue.
        // TODO(mebjas): Properly fix this issue in ZXing library.
        const zxingDecoder = new MultiFormatReader();
        const luminanceSource
            = new HTMLCanvasElementLuminanceSource(canvas);
        const binaryBitmap
            = new BinaryBitmap(
                new HybridBinarizer(luminanceSource));
        let result = zxingDecoder.decode(binaryBitmap, this.hints);
        return {
            text: result.getText(),
            format: QrcodeResultFormat.create(
                this.toHtml5QrcodeSupportedFormats(result.getBarcodeFormat())),
                debugData: this.createDebugData()
        };
    }

    private createReverseFormatMap(): Map<any, Html5QrcodeSupportedFormats> {
        let result = new Map();
        this.formatMap.forEach(
            (value: any, key: Html5QrcodeSupportedFormats, _) => {
            result.set(value, key);
        });
        return result;
    }

    private toHtml5QrcodeSupportedFormats(zxingFormat: any)
        : Html5QrcodeSupportedFormats {
        if (!this.reverseFormatMap.has(zxingFormat)) {
            throw `reverseFormatMap doesn't have ${zxingFormat}`;
        }
        return this.reverseFormatMap.get(zxingFormat)!;
    }

    private createZXingFormats(
        requestedFormats: Array<Html5QrcodeSupportedFormats>):
        Array<any> {
            let zxingFormats = [];
            for (const requestedFormat of requestedFormats) {
                if (this.formatMap.has(requestedFormat)) {
                    zxingFormats.push(
                        this.formatMap.get(requestedFormat));
                } else {
                    this.logger.logError(`${requestedFormat} is not supported by`
                        + "ZXingHtml5QrcodeShim");
                }
            }
            return zxingFormats;
    }

    private createDebugData(): QrcodeResultDebugData {
        return { decoderName: "zxing-js" };
    }
}
