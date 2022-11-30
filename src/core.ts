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

/** {@code Html5QrcodeSupportedFormats} to friendly name map. */
const html5QrcodeSupportedFormatsTextMap
    : Map<Html5QrcodeSupportedFormats, string> = new Map(
    [
        [ Html5QrcodeSupportedFormats.QR_CODE, "QR_CODE" ],
        [ Html5QrcodeSupportedFormats.AZTEC, "AZTEC" ],
        [ Html5QrcodeSupportedFormats.CODABAR, "CODABAR" ],
        [ Html5QrcodeSupportedFormats.CODE_39, "CODE_39" ],
        [ Html5QrcodeSupportedFormats.CODE_93, "CODE_93" ],
        [ Html5QrcodeSupportedFormats.CODE_128, "CODE_128" ],
        [ Html5QrcodeSupportedFormats.DATA_MATRIX, "DATA_MATRIX" ],
        [ Html5QrcodeSupportedFormats.MAXICODE, "MAXICODE" ],
        [ Html5QrcodeSupportedFormats.ITF, "ITF" ],
        [ Html5QrcodeSupportedFormats.EAN_13, "EAN_13" ],
        [ Html5QrcodeSupportedFormats.EAN_8, "EAN_8" ],
        [ Html5QrcodeSupportedFormats.PDF_417, "PDF_417" ],
        [ Html5QrcodeSupportedFormats.RSS_14, "RSS_14" ],
        [ Html5QrcodeSupportedFormats.RSS_EXPANDED, "RSS_EXPANDED" ],
        [ Html5QrcodeSupportedFormats.UPC_A, "UPC_A" ],
        [ Html5QrcodeSupportedFormats.UPC_E, "UPC_E" ],
        [ Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION, "UPC_EAN_EXTENSION" ]
    ]
);

/**
 * Indicates the type of decoded text.
 *
 * Note: this is very experimental in nature at the moment.
 */
export enum DecodedTextType {
    UNKNOWN = 0,
    URL,
}

/** Returns true if the passed object instance is a valid format. */
export function isValidHtml5QrcodeSupportedFormats(format: any): boolean {
    return Object.values(Html5QrcodeSupportedFormats).includes(format);
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
    static GITHUB_PROJECT_URL: string
        = "https://github.com/mebjas/html5-qrcode";
    static SCAN_DEFAULT_FPS = 2;
    static DEFAULT_DISABLE_FLIP = false;
    static DEFAULT_REMEMBER_LAST_CAMERA_USED = true;
    static DEFAULT_SUPPORTED_SCAN_TYPE = [
        Html5QrcodeScanType.SCAN_TYPE_CAMERA,
        Html5QrcodeScanType.SCAN_TYPE_FILE];
}

/** Defines dimension for QR Code Scanner. */
export interface QrDimensions {
    width: number;
    height: number;
}

/**
 * A function that takes in the width and height of the video stream 
 * and returns QrDimensions.
 * 
 * Viewfinder refers to the video showing camera stream.
 */
export type QrDimensionFunction =
    (viewfinderWidth: number, viewfinderHeight: number) => QrDimensions;

/**
 * Defines bounds of detected QR code w.r.t the scan region.
 */
export interface QrBounds extends QrDimensions {
    x: number;
    y: number;
}

/** Format of detected code. */
export class QrcodeResultFormat {
    public readonly format: Html5QrcodeSupportedFormats;
    public readonly formatName: string;

    private constructor(
        format: Html5QrcodeSupportedFormats,
        formatName: string) {
        this.format = format;
        this.formatName = formatName;
    }

    public toString(): string {
        return this.formatName;
    }

    public static create(format: Html5QrcodeSupportedFormats) {
        if (!html5QrcodeSupportedFormatsTextMap.has(format)) {
            throw `${format} not in html5QrcodeSupportedFormatsTextMap`;
        }
        return new QrcodeResultFormat(
            format, html5QrcodeSupportedFormatsTextMap.get(format)!);
    }
}

/** Data class for QR code result used for debugging. */
export interface QrcodeResultDebugData {

    /** Name of the decoder that was used for decoding. */
    decoderName?: string;
}

/**
 * Detailed scan result.
 */
export interface QrcodeResult {
    /** Decoded text. */
    text: string;

    /** Format that was successfully scanned. */
    format?: QrcodeResultFormat,

    /**
     * The bounds of the decoded QR code or bar code in the whole stream of
     * image.
     * 
     * Note: this is experimental, and not fully supported.
     */
    bounds?: QrBounds;

    /**
     * If the decoded text from the QR code or bar code is of a known type like
     * url or upi id or email id.
     * 
     * Note: this is experimental, and not fully supported.
     */
    decodedTextType?: DecodedTextType;

    /** Data class for QR code result used for debugging. */
    debugData?: QrcodeResultDebugData;
}

/**
 * QrCode result object.
 */
export interface Html5QrcodeResult {
    decodedText: string;
    result: QrcodeResult;
}

/**
 * Static factory for creating {@interface Html5QrcodeResult} instance.
 */
export class Html5QrcodeResultFactory {
    static createFromText(decodedText: string): Html5QrcodeResult {
        let qrcodeResult = {
            text: decodedText
        };

        return {
            decodedText: decodedText,
            result: qrcodeResult
        };
    }

    static createFromQrcodeResult(qrcodeResult: QrcodeResult)
        : Html5QrcodeResult {
        return {
            decodedText: qrcodeResult.text,
            result: qrcodeResult
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
 * Type for a callback for a successful code scan.
 */
export type QrcodeSuccessCallback
    = (decodedText: string, result: Html5QrcodeResult) => void;

/**
 * Type for a callback for failure during code scan.
 */
export type QrcodeErrorCallback
    = (errorMessage: string, error: Html5QrcodeError) => void;

/** Code decoder interface. */
export interface QrcodeDecoderAsync {
    /**
     * Decodes content of the canvas to find a valid QR code or bar code.
     * 
     * @param canvas a valid html5 canvas element.
     */
    decodeAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult>;
}

/**
 * Code robust decoder interface.
 * 
 * <p> A robust decoder may sacrifice latency of scanning for scanning quality.
 * Ideal for file scan kind of operation.
 */
export interface RobustQrcodeDecoderAsync extends QrcodeDecoderAsync {
    /**
     * Decodes content of the canvas to find a valid QR code or bar code.
     * 
     * <p>The method implementation will run the decoder more robustly at the
     * expense of latency.
     * 
     * @param canvas a valid html5 canvas element.
     */
    decodeRobustlyAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult>;
}

/** Interface for logger. */
export interface Logger {
    log(message: string): void;
    warn(message: string): void;
    logError(message: string, isExperimental?: boolean): void;
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
            // eslint-disable-next-line no-console
            console.log(message);
        }
    }

    public warn(message: string): void {
        if (this.verbose) {
            // eslint-disable-next-line no-console
            console.warn(message);
        }
    }

    public logError(message: string, isExperimental?: boolean)
        : void {
        if (this.verbose || isExperimental === true) {
            // eslint-disable-next-line no-console
            console.error(message);
        }
    }

    public logErrors(errors: Array<any>): void {
        if (errors.length === 0) {
            throw "Logger#logError called without arguments";
        }
        if (this.verbose) {
            // eslint-disable-next-line no-console
            console.error(errors);
        }
    }
}

//#region global functions
/** Returns true if the {@param obj} is null or undefined. */
export function isNullOrUndefined(obj?: any) {
    return (typeof obj === "undefined") || obj === null;
}

/** Clips the {@code value} between {@code minValue} and {@code maxValue}. */
export function clip(value: number, minValue: number, maxValue: number) {
    if (value > maxValue) {
        return maxValue;
    }
    if (value < minValue) {
        return minValue;
    }

    return value;
}
//#endregion
