/**
 * @fileoverview
 * {@interface QrcodeDecoder} wrapper around zxing-wasm (ZXing-C++ WebAssembly).
 *
 * @author mebjas <minhazav@gmail.com>
 *
 * Decoder: https://github.com/Sec-ant/zxing-wasm
 *
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {
    readBarcodes,
    type ReadInputBarcodeFormat,
    type ReaderOptions,
} from "zxing-wasm/reader";

import { ensureZxingWasmReady } from "./zxing-wasm-init";
import { ZxingWasmConfig } from "./zxing-wasm-config";

import {
    QrcodeResult,
    QrcodeResultDebugData,
    QrcodeResultFormat,
    Html5QrcodeSupportedFormats,
    Logger,
    QrcodeDecoderAsync,
} from "./core";

/**
 * ZXing-WASM based barcode decoder.
 */
export class ZXingHtml5QrcodeDecoder implements QrcodeDecoderAsync {

    private readonly forwardFormatMap:
        Map<Html5QrcodeSupportedFormats, ReadInputBarcodeFormat | ReadInputBarcodeFormat[]>
        = new Map<
            Html5QrcodeSupportedFormats,
            ReadInputBarcodeFormat | ReadInputBarcodeFormat[]
        >([
            [Html5QrcodeSupportedFormats.QR_CODE, "QRCode"],
            [Html5QrcodeSupportedFormats.AZTEC, "Aztec"],
            [Html5QrcodeSupportedFormats.CODABAR, "Codabar"],
            [Html5QrcodeSupportedFormats.CODE_39, "Code39"],
            [Html5QrcodeSupportedFormats.CODE_93, "Code93"],
            [Html5QrcodeSupportedFormats.CODE_128, "Code128"],
            [Html5QrcodeSupportedFormats.DATA_MATRIX, "DataMatrix"],
            [Html5QrcodeSupportedFormats.MAXICODE, "MaxiCode"],
            [Html5QrcodeSupportedFormats.ITF, "ITF"],
            [Html5QrcodeSupportedFormats.EAN_13, "EAN13"],
            [Html5QrcodeSupportedFormats.EAN_8, "EAN8"],
            [Html5QrcodeSupportedFormats.PDF_417, "PDF417"],
            [Html5QrcodeSupportedFormats.RSS_14, "DataBar"],
            [Html5QrcodeSupportedFormats.RSS_EXPANDED, "DataBarExp"],
            [Html5QrcodeSupportedFormats.UPC_A, "UPCA"],
            [Html5QrcodeSupportedFormats.UPC_E, "UPCE"],
            [Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
                ["EAN2", "EAN5"] as unknown as ReadInputBarcodeFormat[]],
        ]);

    private readonly readerOptionsBase: ReaderOptions;
    private readonly logger: Logger;
    private readonly zxingWasmConfig?: ZxingWasmConfig;

    public constructor(
        requestedFormats: Array<Html5QrcodeSupportedFormats>,
        verbose: boolean,
        logger: Logger,
        zxingWasmConfig?: ZxingWasmConfig) {
        this.logger = logger;
        this.zxingWasmConfig = zxingWasmConfig;
        const formats = this.buildWasmFormats(requestedFormats);
        this.readerOptionsBase = {
            formats,
            tryHarder: false,
            maxNumberOfSymbols: 1,
        };
        if (verbose) {
            this.readerOptionsBase.tryRotate = true;
            this.readerOptionsBase.tryInvert = true;
            this.readerOptionsBase.tryDownscale = true;
        }
    }

    decodeAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult> {
        return this.decodeWithWasm(canvas);
    }

    private async decodeWithWasm(canvas: HTMLCanvasElement): Promise<QrcodeResult> {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Canvas 2D context is not available.");
        }
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        await ensureZxingWasmReady(this.zxingWasmConfig);
        const results = await readBarcodes(imageData, this.readerOptionsBase);
        const hit = results.find((r) => r.isValid && r.format !== "None" && r.text);
        if (!hit) {
            throw new Error("No MultiFormat Readers were able to detect the code.");
        }
        const html5Format = this.wasmFormatToHtml5(hit.format as string);
        return {
            text: hit.text,
            format: QrcodeResultFormat.create(html5Format),
            debugData: this.createDebugData(),
        };
    }

    private buildWasmFormats(
        requestedFormats: Array<Html5QrcodeSupportedFormats>,
    ): ReadInputBarcodeFormat[] {
        if (requestedFormats.length === 0) {
            return [];
        }
        const out: ReadInputBarcodeFormat[] = [];
        const seen = new Set<string>();
        for (const requestedFormat of requestedFormats) {
            const mapped = this.forwardFormatMap.get(requestedFormat);
            if (!mapped) {
                this.logger.logError(`${requestedFormat} is not supported by`
                    + " ZXingHtml5QrcodeShim");
                continue;
            }
            const pushOne = (f: ReadInputBarcodeFormat) => {
                const key = String(f);
                if (!seen.has(key)) {
                    seen.add(key);
                    out.push(f);
                }
            };
            if (Array.isArray(mapped)) {
                for (const f of mapped) {
                    pushOne(f);
                }
            } else {
                pushOne(mapped);
            }
        }
        return out;
    }

    private wasmFormatToHtml5(wasmFormat: string): Html5QrcodeSupportedFormats {
        switch (wasmFormat) {
        case "QRCode":
        case "QRCodeModel1":
        case "QRCodeModel2":
        case "MicroQRCode":
        case "RMQRCode":
            return Html5QrcodeSupportedFormats.QR_CODE;
        case "Aztec":
        case "AztecCode":
        case "AztecRune":
            return Html5QrcodeSupportedFormats.AZTEC;
        case "Codabar":
            return Html5QrcodeSupportedFormats.CODABAR;
        case "Code39":
        case "Code39Std":
        case "Code39Ext":
        case "Code32":
        case "PZN":
            return Html5QrcodeSupportedFormats.CODE_39;
        case "Code93":
            return Html5QrcodeSupportedFormats.CODE_93;
        case "Code128":
            return Html5QrcodeSupportedFormats.CODE_128;
        case "DataMatrix":
            return Html5QrcodeSupportedFormats.DATA_MATRIX;
        case "MaxiCode":
            return Html5QrcodeSupportedFormats.MAXICODE;
        case "ITF":
        case "ITF14":
            return Html5QrcodeSupportedFormats.ITF;
        case "EAN13":
        case "ISBN":
            return Html5QrcodeSupportedFormats.EAN_13;
        case "EAN8":
            return Html5QrcodeSupportedFormats.EAN_8;
        case "PDF417":
        case "CompactPDF417":
        case "MicroPDF417":
            return Html5QrcodeSupportedFormats.PDF_417;
        case "DataBar":
        case "DataBarOmni":
        case "DataBarStk":
        case "DataBarStkOmni":
        case "DataBarLtd":
            return Html5QrcodeSupportedFormats.RSS_14;
        case "DataBarExp":
        case "DataBarExpStk":
            return Html5QrcodeSupportedFormats.RSS_EXPANDED;
        case "UPCA":
            return Html5QrcodeSupportedFormats.UPC_A;
        case "UPCE":
            return Html5QrcodeSupportedFormats.UPC_E;
        case "EAN2":
        case "EAN5":
            return Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION;
        default:
            throw new Error(`Unsupported wasm barcode format: ${wasmFormat}`);
        }
    }

    private createDebugData(): QrcodeResultDebugData {
        return { decoderName: "zxing-wasm" };
    }
}
