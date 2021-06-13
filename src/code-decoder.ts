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
    QrcodeDecoder,
    Logger
} from "./core";

import { ZXingHtml5QrcodeDecoder } from "./zxing-html5-qrcode-decoder"

/**
 * Shim layer for {@interface QrcodeDecoder}.
 * 
 * Currently uses {@class ZXingHtml5QrcodeDecoder}, can be replace with another library.
 */
export class Html5QrcodeShim implements QrcodeDecoder {
    
    private verbose: boolean;
    private zxingDecorderDelegate: QrcodeDecoder;

    private readonly EXECUTIONS_TO_REPORT_PERFORMANCE = 100;
    private executions: number = 0;
    private executionResults: Array<number> = [];

    public constructor(
        requestedFormats: Array<Html5QrcodeSupportedFormats>,
        verbose: boolean,
        logger: Logger) {
        this.verbose = verbose;
        this.zxingDecorderDelegate = new ZXingHtml5QrcodeDecoder(
            requestedFormats, verbose, logger);
    }

    decode(canvas: HTMLCanvasElement): QrcodeResult {
        let start = performance.now();
        try {
            let result: QrcodeResult = this.zxingDecorderDelegate.decode(canvas);
            return result;
        } catch (ex) {
            throw ex;
        } finally {
            if (this.verbose) {
                let executionTime = performance.now() - start;
                this.executionResults.push(executionTime);
                this.executions++;
                this.possiblyFlushPerformanceReport();
            }
        }
    }

    // Dumps mean decoding latency to console for last
    // EXECUTIONS_TO_REPORT_PERFORMANCE runs.
    // TODO(mebjas): Can we automate instrumentation runs?
    possiblyFlushPerformanceReport() {
        if (this.executions < this.EXECUTIONS_TO_REPORT_PERFORMANCE) {
            return;
        }

        let sum:number = 0;
        for (let executionTime of this.executionResults) {
            sum += executionTime;
        }
        let mean = sum / this.executionResults.length;
        // eslint-disable-next-line no-console
        console.log(`${mean} ms for ${this.executionResults.length} last runs.`);
        this.executions = 0;
        this.executionResults = [];
    }
}
