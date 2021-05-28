/**
 * @fileoverview
 * Core libraries, interfaces, enums shared across {@class Html5Qrcode} & {@class Html5QrcodeScanner}
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

/**
 * Code formats supported by this library.
 */
export enum Html5QrcodeSupportedFormats {
    QR_CODE = 0,
    AZTEC,
    CODABAR,
    CODE_39,
    CODE_93,
    CODE_128,
    DATA_MATRIX,
    MAXICODE,
    ITF,
    EAN_13,
    EAN_8,
    PDF_417,
    RSS_14,
    RSS_EXPANDED,
    UPC_A,
    UPC_E,
    UPC_EAN_EXTENSION,
}

/**
 * Types of scans supported by the library
 */
export enum Html5QrcodeScanType {
    SCAN_TYPE_CAMERA = 0,   // Camera based scanner.
    SCAN_TYPE_FILE = 1      // File based scanner.
}

/**
 * Constants used in QR code library.
 */
export class Html5QrcodeConstants {
    static ASSET_FILE_SCAN: string
        = "https://raw.githubusercontent.com/mebjas/html5-qrcode/master/assets"
        + "/file-scan.gif";
    static ASSET_CAMERA_SCAN: string
        = "https://raw.githubusercontent.com/mebjas/html5-qrcode/master/assets"
        + "/camera-scan.gif";

    static GITHUB_PROJECT_URL: string
        = "https://github.com/mebjas/html5-qrcode";
}

/**
 * Defines bounds of detected QR code w.r.t the scan region.
 */
export interface QrBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Detailed scan result.
 */
export interface QrcodeResult {
    text: string;
    bounds?: QrBounds;
    isUrl?: boolean;
}

/**
 * QrCode result object.
 */
export interface Html5QrcodeResult {
    decodedText: string;
    fullResult: QrcodeResult;
}

/**
 * Static factory for creating {@interface Html5QrcodeResult} instance.
 */
export class Html5QrcodeResultFactory {
    static createFrom(decodedText: string): Html5QrcodeResult {
        let qrcodeResult = {
            text: decodedText
        };

        return {
            decodedText: decodedText,
            fullResult: qrcodeResult
        };
    }
}

/**
 * Different kind of errors that can lead to scanning error.
 */
export enum Html5QrcodeErrorTypes {
    UNKWOWN_ERROR = 0,
    IMPLEMENTATION_ERROR = 1,
    NO_CODE_FOUND_ERROR = 2
}

/**
 * Interface for scan error response.
 */
export interface Html5QrcodeError {
    errorMessage: string;
    type: Html5QrcodeErrorTypes;
}

/**
 * Static factory for creating {@interface Html5QrcodeError} instance.
 */
export class Html5QrcodeErrorFactory {
    static createFrom(error: any): Html5QrcodeError {
        return {
            errorMessage: error,
            type: Html5QrcodeErrorTypes.UNKWOWN_ERROR
        };
    }
}

/**
 * Type for callback for successfull code scan.
 */
export type QrcodeSuccessCallback
    = (decodedText: string, result: Html5QrcodeResult) => void;

/**
 * Type for callback for failure during code scan.
 */
export type QrcodeErrorCallback
    = (errorMessage: string, error: Html5QrcodeError) => void;

/** Camera Device interface. */
export interface CameraDevice {
    id: string;
    label: string;
}

/** Code decoder interface. */
export interface QrcodeDecoder {

    /**
     * Decodes content of the canvas to find a valid QR code or bar code.
     * 
     * @param canvas a valid html5 canvas element.
     */
    decode(canvas: HTMLCanvasElement): QrcodeResult;
}

/** Interface for logger. */
export interface Logger {
    log(message: string): void;
    warn(message: string): void;
    logError(message: string, isExperimental: boolean): void;
    logErrors(errors: Array<any>): void;
}

/**
 * Base logger implementation based on browser console.
 * 
 * This can be replaced by a custom implementation of logger.
 *
 */
export class BaseLoggger implements Logger {

    private verbose: boolean;

    public constructor(verbose: boolean) {
        this.verbose = verbose;
    }

    public log(message: string): void {
        if (this.verbose) {
            console.log(message);
        }
    }

    public warn(message: string): void {
        if (this.verbose) {
            console.warn(message);
        }
    }

    public logError(message: string, isExperimental: boolean): void {
        if (this.verbose || isExperimental === true) {
            console.error(message);
        }
    }

    public logErrors(errors: Array<any>): void {
        if (errors.length == 0) {
            throw "Logger#logError called without arguments";
        }
        if (this.verbose) {
            console.error(errors);
        }
    }
}
