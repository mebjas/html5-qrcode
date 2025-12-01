export declare enum Html5QrcodeSupportedFormats {
    QR_CODE = 0,
    AZTEC = 1,
    CODABAR = 2,
    CODE_39 = 3,
    CODE_93 = 4,
    CODE_128 = 5,
    DATA_MATRIX = 6,
    MAXICODE = 7,
    ITF = 8,
    EAN_13 = 9,
    EAN_8 = 10,
    PDF_417 = 11,
    RSS_14 = 12,
    RSS_EXPANDED = 13,
    UPC_A = 14,
    UPC_E = 15,
    UPC_EAN_EXTENSION = 16
}
export declare enum DecodedTextType {
    UNKNOWN = 0,
    URL = 1
}
export declare function isValidHtml5QrcodeSupportedFormats(format: any): boolean;
export declare enum Html5QrcodeScanType {
    SCAN_TYPE_CAMERA = 0,
    SCAN_TYPE_FILE = 1
}
export declare class Html5QrcodeConstants {
    static GITHUB_PROJECT_URL: string;
    static SCAN_DEFAULT_FPS: number;
    static DEFAULT_DISABLE_FLIP: boolean;
    static DEFAULT_REMEMBER_LAST_CAMERA_USED: boolean;
    static DEFAULT_SUPPORTED_SCAN_TYPE: Html5QrcodeScanType[];
}
export interface QrDimensions {
    width: number;
    height: number;
}
export type QrDimensionFunction = (viewfinderWidth: number, viewfinderHeight: number) => QrDimensions;
export interface QrBounds extends QrDimensions {
    x: number;
    y: number;
}
export declare class QrcodeResultFormat {
    readonly format: Html5QrcodeSupportedFormats;
    readonly formatName: string;
    private constructor();
    toString(): string;
    static create(format: Html5QrcodeSupportedFormats): QrcodeResultFormat;
}
export interface QrcodeResultDebugData {
    decoderName?: string;
}
export interface QrcodeResult {
    text: string;
    format?: QrcodeResultFormat;
    bounds?: QrBounds;
    decodedTextType?: DecodedTextType;
    debugData?: QrcodeResultDebugData;
}
export interface Html5QrcodeResult {
    decodedText: string;
    result: QrcodeResult;
}
export declare class Html5QrcodeResultFactory {
    static createFromText(decodedText: string): Html5QrcodeResult;
    static createFromQrcodeResult(qrcodeResult: QrcodeResult): Html5QrcodeResult;
}
export declare enum Html5QrcodeErrorTypes {
    UNKWOWN_ERROR = 0,
    IMPLEMENTATION_ERROR = 1,
    NO_CODE_FOUND_ERROR = 2
}
export interface Html5QrcodeError {
    errorMessage: string;
    type: Html5QrcodeErrorTypes;
}
export declare class Html5QrcodeErrorFactory {
    static createFrom(error: any): Html5QrcodeError;
}
export type QrcodeSuccessCallback = (decodedText: string, result: Html5QrcodeResult) => void;
export type QrcodeErrorCallback = (errorMessage: string, error: Html5QrcodeError) => void;
export interface QrcodeDecoderAsync {
    decodeAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult>;
}
export interface RobustQrcodeDecoderAsync extends QrcodeDecoderAsync {
    decodeRobustlyAsync(canvas: HTMLCanvasElement): Promise<QrcodeResult>;
}
export interface Logger {
    log(message: string): void;
    warn(message: string): void;
    logError(message: string, isExperimental?: boolean): void;
    logErrors(errors: Array<any>): void;
}
export declare class BaseLoggger implements Logger {
    private verbose;
    constructor(verbose: boolean);
    log(message: string): void;
    warn(message: string): void;
    logError(message: string, isExperimental?: boolean): void;
    logErrors(errors: Array<any>): void;
}
export declare function isNullOrUndefined(obj?: any): boolean;
export declare function clip(value: number, minValue: number, maxValue: number): number;
