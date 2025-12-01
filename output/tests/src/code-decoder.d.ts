import { QrcodeResult, Html5QrcodeSupportedFormats, Logger, RobustQrcodeDecoderAsync } from "./core";
export declare class Html5QrcodeShim implements RobustQrcodeDecoderAsync {
    private verbose;
    private primaryDecoder;
    private secondaryDecoder;
    private readonly EXECUTIONS_TO_REPORT_PERFORMANCE;
    private executions;
    private executionResults;
    private wasPrimaryDecoderUsedInLastDecode;
    constructor(requestedFormats: Array<Html5QrcodeSupportedFormats>, useBarCodeDetectorIfSupported: boolean, verbose: boolean, logger: Logger);
    decodeAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult>;
    decodeRobustlyAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult>;
    private getDecoder;
    private possiblyLogPerformance;
    possiblyFlushPerformanceReport(): void;
}
