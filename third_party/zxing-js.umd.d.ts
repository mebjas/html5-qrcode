import * as ZXing from "./zxing-js.umd";

declare class HTMLCanvasElementLuminanceSource {
    constructor(canvas: HTMLCanvasElement);
}

declare class HybridBinarizer {
    constructor(luminanceSource: HTMLCanvasElementLuminanceSource);
}

declare class BinaryBitmap {
    constructor(binarizer: HybridBinarizer);
}

declare class MultiFormatReader {
    constructor(verbosity: boolean, b: any);
    decode(binaryBitmap: BinaryBitmap): any;
}

export declare enum DecodeHintType {
    POSSIBLE_FORMATS = 2,
    TRY_HARDER = 3
}

export declare enum BarcodeFormat {
    AZTEC = 0,
    CODABAR = 1,
    CODE_39 = 2,
    CODE_93 = 3,
    CODE_128 = 4,
    DATA_MATRIX = 5,
    EAN_8 = 6,
    EAN_13 = 7,
    ITF = 8,
    MAXICODE = 9,
    PDF_417 = 10,
    QR_CODE = 11,
    RSS_14 = 12,
    RSS_EXPANDED = 13,
    UPC_A = 14,
    UPC_E = 15,
    UPC_EAN_EXTENSION = 16
}
