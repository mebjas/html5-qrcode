/**
 * @fileoverview
 * {@interface QrcodeDecoder} wrapper around experimental BarcodeDetector API.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * Read more about the experimental feature here:
 * https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {
    QrcodeResult,
    QrcodeResultDebugData,
    QrcodeResultFormat,
    Html5QrcodeSupportedFormats,
    QrcodeDecoderAsync,
    Logger
} from "./core";

declare const BarcodeDetector: any;

/** Config for BarcodeDetector API. */
interface BarcodeDetectorConfig {
    formats: Array<string>;
}

/**
 * Interface for BarcodeDetector result.
 * 
 * Forked from
 * https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector#methods
 */
interface BarcodeDetectorResult {
    /**
     * A DOMRectReadOnly, which returns the dimensions of a rectangle
     * representing the extent of a detected barcode, aligned with the image.
     */
    boundingBox: DOMRectReadOnly;

    /**
     * The x and y co-ordinates of the four corner points of the detected
     * barcode relative to the image, starting with the top left and working
     * clockwise. This may not be square due to perspective distortions within
     * the image.
     */
    cornerPoints: any;

    /**
     * The detected barcode format. 
     */
    format: string;

    /**
     * A String decoded from the barcode data.
     */
    rawValue: string;
}

/**
 * ZXing based Code decoder.
 */
 export class BarcodeDetectorDelegate implements QrcodeDecoderAsync {

    // All formats defined here
    // https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API#supported_barcode_formats
    private readonly formatMap: Map<Html5QrcodeSupportedFormats, string>
        = new Map([
            [ Html5QrcodeSupportedFormats.QR_CODE, "qr_code" ],
            [ Html5QrcodeSupportedFormats.AZTEC, "aztec" ],
            [ Html5QrcodeSupportedFormats.CODABAR, "codabar" ],
            [ Html5QrcodeSupportedFormats.CODE_39, "code_39" ],
            [ Html5QrcodeSupportedFormats.CODE_93, "code_93" ],
            [ Html5QrcodeSupportedFormats.CODE_128, "code_128" ],
            [ Html5QrcodeSupportedFormats.DATA_MATRIX,  "data_matrix" ],
            [ Html5QrcodeSupportedFormats.ITF, "itf" ],
            [ Html5QrcodeSupportedFormats.EAN_13, "ean_13" ],
            [ Html5QrcodeSupportedFormats.EAN_8, "ean_8" ],
            [ Html5QrcodeSupportedFormats.PDF_417, "pdf417" ],
            [ Html5QrcodeSupportedFormats.UPC_A, "upc_a" ],
            [ Html5QrcodeSupportedFormats.UPC_E, "upc_e" ]
        ]);
    private readonly reverseFormatMap: Map<string, Html5QrcodeSupportedFormats>
        = this.createReverseFormatMap();

    private verbose: boolean;
    private logger: Logger;
    private detector: any;

    /**
     * Returns true if this API is supported by the browser.
     * 
     * TODO(mebjas): Add checks like this 
     * https://web.dev/shape-detection/#featuredetection
     * TODO(mebjas): Check for format supported by the BarcodeDetector using
     * getSupportedFormats() API.
     * @returns 
     */
    public static isSupported(): boolean {
        if (!("BarcodeDetector" in window)) {
            return false;
        }
        const dummyDetector = new BarcodeDetector({formats: [ "qr_code" ]});
        return typeof dummyDetector !== "undefined";
    }

    public constructor(
        requestedFormats: Array<Html5QrcodeSupportedFormats>,
        verbose: boolean,
        logger: Logger) {
        if (!BarcodeDetectorDelegate.isSupported()) {
            throw "Use html5qrcode.min.js without edit, Use "
                + "BarcodeDetectorDelegate only if it isSupported();";
        }
        this.verbose = verbose;
        this.logger = logger;

        // create new detector
        const formats = this.createBarcodeDetectorFormats(requestedFormats);
        this.detector = new BarcodeDetector(formats);

        // check compatibility
        if (!this.detector) {
            throw "BarcodeDetector detector not supported";
        }
    }

    async decodeAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult> {
        const barcodes: Array<BarcodeDetectorResult>
            = await this.detector.detect(canvas);
        if (!barcodes || barcodes.length === 0) {
            throw "No barcode or QR code detected.";
        }

        // TODO(mebjas): Today BarcodeDetector library seems to be returning
        // mutliple barcodes if supported. But the documentation around it is
        // not the best. As of now, we are returning just the largest code
        // found. In future it'd be desriable to return mutli codes if supported
        // and found.
        let largestBarcode = this.selectLargestBarcode(barcodes);
        return {
            text: largestBarcode.rawValue,
            format: QrcodeResultFormat.create(
                this.toHtml5QrcodeSupportedFormats(largestBarcode.format)),
            debugData: this.createDebugData()
        };
    }

    private selectLargestBarcode(barcodes: Array<BarcodeDetectorResult>)
        : BarcodeDetectorResult {
        let largestBarcode: BarcodeDetectorResult | null = null;
        let maxArea = 0;
        for (let barcode of barcodes) {
            let area = barcode.boundingBox.width * barcode.boundingBox.height;
            if (area > maxArea) {
                maxArea = area;
                largestBarcode = barcode;
            }
        }
        if (!largestBarcode) {
            throw "No largest barcode found";
        }
        return largestBarcode!;
    }

    private createBarcodeDetectorFormats(
        requestedFormats: Array<Html5QrcodeSupportedFormats>):
        BarcodeDetectorConfig {
            let formats: Array<string> = [];
            for (const requestedFormat of requestedFormats) {
                if (this.formatMap.has(requestedFormat)) {
                    formats.push(
                        this.formatMap.get(requestedFormat)!);
                } else {
                    this.logger.warn(`${requestedFormat} is not supported by`
                        + "BarcodeDetectorDelegate");
                }
            }
            return { formats: formats };
    }

    private toHtml5QrcodeSupportedFormats(barcodeDetectorFormat: string)
        : Html5QrcodeSupportedFormats {
        if (!this.reverseFormatMap.has(barcodeDetectorFormat)) {
            throw `reverseFormatMap doesn't have ${barcodeDetectorFormat}`;
        }
        return this.reverseFormatMap.get(barcodeDetectorFormat)!;
    }

    private createReverseFormatMap(): Map<string, Html5QrcodeSupportedFormats> {
        let result = new Map();
        this.formatMap.forEach(
            (value: string, key: Html5QrcodeSupportedFormats, _) => {
            result.set(value, key);
        });
        return result;
    }

    private createDebugData(): QrcodeResultDebugData {
        return { decoderName: "BarcodeDetector" };
    }
}
