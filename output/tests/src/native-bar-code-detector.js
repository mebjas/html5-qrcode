"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodeDetectorDelegate = void 0;
const core_1 = require("./core");
class BarcodeDetectorDelegate {
    static isSupported() {
        if (!("BarcodeDetector" in window)) {
            return false;
        }
        const dummyDetector = new BarcodeDetector({ formats: ["qr_code"] });
        return typeof dummyDetector !== "undefined";
    }
    constructor(requestedFormats, verbose, logger) {
        this.formatMap = new Map([
            [core_1.Html5QrcodeSupportedFormats.QR_CODE, "qr_code"],
            [core_1.Html5QrcodeSupportedFormats.AZTEC, "aztec"],
            [core_1.Html5QrcodeSupportedFormats.CODABAR, "codabar"],
            [core_1.Html5QrcodeSupportedFormats.CODE_39, "code_39"],
            [core_1.Html5QrcodeSupportedFormats.CODE_93, "code_93"],
            [core_1.Html5QrcodeSupportedFormats.CODE_128, "code_128"],
            [core_1.Html5QrcodeSupportedFormats.DATA_MATRIX, "data_matrix"],
            [core_1.Html5QrcodeSupportedFormats.ITF, "itf"],
            [core_1.Html5QrcodeSupportedFormats.EAN_13, "ean_13"],
            [core_1.Html5QrcodeSupportedFormats.EAN_8, "ean_8"],
            [core_1.Html5QrcodeSupportedFormats.PDF_417, "pdf417"],
            [core_1.Html5QrcodeSupportedFormats.UPC_A, "upc_a"],
            [core_1.Html5QrcodeSupportedFormats.UPC_E, "upc_e"]
        ]);
        this.reverseFormatMap = this.createReverseFormatMap();
        if (!BarcodeDetectorDelegate.isSupported()) {
            throw "Use html5qrcode.min.js without edit, Use "
                + "BarcodeDetectorDelegate only if it isSupported();";
        }
        this.verbose = verbose;
        this.logger = logger;
        const formats = this.createBarcodeDetectorFormats(requestedFormats);
        this.detector = new BarcodeDetector(formats);
        if (!this.detector) {
            throw "BarcodeDetector detector not supported";
        }
    }
    decodeAsync(canvas) {
        return __awaiter(this, void 0, void 0, function* () {
            const barcodes = yield this.detector.detect(canvas);
            if (!barcodes || barcodes.length === 0) {
                throw "No barcode or QR code detected.";
            }
            let largestBarcode = this.selectLargestBarcode(barcodes);
            return {
                text: largestBarcode.rawValue,
                format: core_1.QrcodeResultFormat.create(this.toHtml5QrcodeSupportedFormats(largestBarcode.format)),
                debugData: this.createDebugData()
            };
        });
    }
    selectLargestBarcode(barcodes) {
        let largestBarcode = null;
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
        return largestBarcode;
    }
    createBarcodeDetectorFormats(requestedFormats) {
        let formats = [];
        for (const requestedFormat of requestedFormats) {
            if (this.formatMap.has(requestedFormat)) {
                formats.push(this.formatMap.get(requestedFormat));
            }
            else {
                this.logger.warn(`${requestedFormat} is not supported by`
                    + "BarcodeDetectorDelegate");
            }
        }
        return { formats: formats };
    }
    toHtml5QrcodeSupportedFormats(barcodeDetectorFormat) {
        if (!this.reverseFormatMap.has(barcodeDetectorFormat)) {
            throw `reverseFormatMap doesn't have ${barcodeDetectorFormat}`;
        }
        return this.reverseFormatMap.get(barcodeDetectorFormat);
    }
    createReverseFormatMap() {
        let result = new Map();
        this.formatMap.forEach((value, key, _) => {
            result.set(value, key);
        });
        return result;
    }
    createDebugData() {
        return { decoderName: "BarcodeDetector" };
    }
}
exports.BarcodeDetectorDelegate = BarcodeDetectorDelegate;
//# sourceMappingURL=native-bar-code-detector.js.map