import { QrcodeResult, Html5QrcodeSupportedFormats, Logger, QrcodeDecoderAsync } from "./core";
export declare class ZXingHtml5QrcodeDecoder implements QrcodeDecoderAsync {
    private readonly formatMap;
    private readonly reverseFormatMap;
    private hints;
    private verbose;
    private logger;
    constructor(requestedFormats: Array<Html5QrcodeSupportedFormats>, verbose: boolean, logger: Logger);
    decodeAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult>;
    private decode;
    private createReverseFormatMap;
    private toHtml5QrcodeSupportedFormats;
    private createZXingFormats;
    private createDebugData;
}
