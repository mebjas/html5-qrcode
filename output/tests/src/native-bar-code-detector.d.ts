import { QrcodeResult, Html5QrcodeSupportedFormats, QrcodeDecoderAsync, Logger } from "./core";
export declare class BarcodeDetectorDelegate implements QrcodeDecoderAsync {
    private readonly formatMap;
    private readonly reverseFormatMap;
    private verbose;
    private logger;
    private detector;
    static isSupported(): boolean;
    constructor(requestedFormats: Array<Html5QrcodeSupportedFormats>, verbose: boolean, logger: Logger);
    decodeAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult>;
    private selectLargestBarcode;
    private createBarcodeDetectorFormats;
    private toHtml5QrcodeSupportedFormats;
    private createReverseFormatMap;
    private createDebugData;
}
