"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLoggger = exports.Html5QrcodeErrorFactory = exports.Html5QrcodeErrorTypes = exports.Html5QrcodeResultFactory = exports.QrcodeResultFormat = exports.Html5QrcodeConstants = exports.Html5QrcodeScanType = exports.DecodedTextType = exports.Html5QrcodeSupportedFormats = void 0;
exports.isValidHtml5QrcodeSupportedFormats = isValidHtml5QrcodeSupportedFormats;
exports.isNullOrUndefined = isNullOrUndefined;
exports.clip = clip;
var Html5QrcodeSupportedFormats;
(function (Html5QrcodeSupportedFormats) {
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["QR_CODE"] = 0] = "QR_CODE";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["AZTEC"] = 1] = "AZTEC";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["CODABAR"] = 2] = "CODABAR";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["CODE_39"] = 3] = "CODE_39";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["CODE_93"] = 4] = "CODE_93";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["CODE_128"] = 5] = "CODE_128";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["DATA_MATRIX"] = 6] = "DATA_MATRIX";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["MAXICODE"] = 7] = "MAXICODE";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["ITF"] = 8] = "ITF";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["EAN_13"] = 9] = "EAN_13";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["EAN_8"] = 10] = "EAN_8";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["PDF_417"] = 11] = "PDF_417";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["RSS_14"] = 12] = "RSS_14";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["RSS_EXPANDED"] = 13] = "RSS_EXPANDED";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["UPC_A"] = 14] = "UPC_A";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["UPC_E"] = 15] = "UPC_E";
    Html5QrcodeSupportedFormats[Html5QrcodeSupportedFormats["UPC_EAN_EXTENSION"] = 16] = "UPC_EAN_EXTENSION";
})(Html5QrcodeSupportedFormats || (exports.Html5QrcodeSupportedFormats = Html5QrcodeSupportedFormats = {}));
const html5QrcodeSupportedFormatsTextMap = new Map([
    [Html5QrcodeSupportedFormats.QR_CODE, "QR_CODE"],
    [Html5QrcodeSupportedFormats.AZTEC, "AZTEC"],
    [Html5QrcodeSupportedFormats.CODABAR, "CODABAR"],
    [Html5QrcodeSupportedFormats.CODE_39, "CODE_39"],
    [Html5QrcodeSupportedFormats.CODE_93, "CODE_93"],
    [Html5QrcodeSupportedFormats.CODE_128, "CODE_128"],
    [Html5QrcodeSupportedFormats.DATA_MATRIX, "DATA_MATRIX"],
    [Html5QrcodeSupportedFormats.MAXICODE, "MAXICODE"],
    [Html5QrcodeSupportedFormats.ITF, "ITF"],
    [Html5QrcodeSupportedFormats.EAN_13, "EAN_13"],
    [Html5QrcodeSupportedFormats.EAN_8, "EAN_8"],
    [Html5QrcodeSupportedFormats.PDF_417, "PDF_417"],
    [Html5QrcodeSupportedFormats.RSS_14, "RSS_14"],
    [Html5QrcodeSupportedFormats.RSS_EXPANDED, "RSS_EXPANDED"],
    [Html5QrcodeSupportedFormats.UPC_A, "UPC_A"],
    [Html5QrcodeSupportedFormats.UPC_E, "UPC_E"],
    [Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION, "UPC_EAN_EXTENSION"]
]);
var DecodedTextType;
(function (DecodedTextType) {
    DecodedTextType[DecodedTextType["UNKNOWN"] = 0] = "UNKNOWN";
    DecodedTextType[DecodedTextType["URL"] = 1] = "URL";
})(DecodedTextType || (exports.DecodedTextType = DecodedTextType = {}));
function isValidHtml5QrcodeSupportedFormats(format) {
    return Object.values(Html5QrcodeSupportedFormats).includes(format);
}
var Html5QrcodeScanType;
(function (Html5QrcodeScanType) {
    Html5QrcodeScanType[Html5QrcodeScanType["SCAN_TYPE_CAMERA"] = 0] = "SCAN_TYPE_CAMERA";
    Html5QrcodeScanType[Html5QrcodeScanType["SCAN_TYPE_FILE"] = 1] = "SCAN_TYPE_FILE";
})(Html5QrcodeScanType || (exports.Html5QrcodeScanType = Html5QrcodeScanType = {}));
class Html5QrcodeConstants {
}
exports.Html5QrcodeConstants = Html5QrcodeConstants;
Html5QrcodeConstants.GITHUB_PROJECT_URL = "https://github.com/mebjas/html5-qrcode";
Html5QrcodeConstants.SCAN_DEFAULT_FPS = 2;
Html5QrcodeConstants.DEFAULT_DISABLE_FLIP = false;
Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED = true;
Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE = [
    Html5QrcodeScanType.SCAN_TYPE_CAMERA,
    Html5QrcodeScanType.SCAN_TYPE_FILE
];
class QrcodeResultFormat {
    constructor(format, formatName) {
        this.format = format;
        this.formatName = formatName;
    }
    toString() {
        return this.formatName;
    }
    static create(format) {
        if (!html5QrcodeSupportedFormatsTextMap.has(format)) {
            throw `${format} not in html5QrcodeSupportedFormatsTextMap`;
        }
        return new QrcodeResultFormat(format, html5QrcodeSupportedFormatsTextMap.get(format));
    }
}
exports.QrcodeResultFormat = QrcodeResultFormat;
class Html5QrcodeResultFactory {
    static createFromText(decodedText) {
        let qrcodeResult = {
            text: decodedText
        };
        return {
            decodedText: decodedText,
            result: qrcodeResult
        };
    }
    static createFromQrcodeResult(qrcodeResult) {
        return {
            decodedText: qrcodeResult.text,
            result: qrcodeResult
        };
    }
}
exports.Html5QrcodeResultFactory = Html5QrcodeResultFactory;
var Html5QrcodeErrorTypes;
(function (Html5QrcodeErrorTypes) {
    Html5QrcodeErrorTypes[Html5QrcodeErrorTypes["UNKWOWN_ERROR"] = 0] = "UNKWOWN_ERROR";
    Html5QrcodeErrorTypes[Html5QrcodeErrorTypes["IMPLEMENTATION_ERROR"] = 1] = "IMPLEMENTATION_ERROR";
    Html5QrcodeErrorTypes[Html5QrcodeErrorTypes["NO_CODE_FOUND_ERROR"] = 2] = "NO_CODE_FOUND_ERROR";
})(Html5QrcodeErrorTypes || (exports.Html5QrcodeErrorTypes = Html5QrcodeErrorTypes = {}));
class Html5QrcodeErrorFactory {
    static createFrom(error) {
        return {
            errorMessage: error,
            type: Html5QrcodeErrorTypes.UNKWOWN_ERROR
        };
    }
}
exports.Html5QrcodeErrorFactory = Html5QrcodeErrorFactory;
class BaseLoggger {
    constructor(verbose) {
        this.verbose = verbose;
    }
    log(message) {
        if (this.verbose) {
            console.log(message);
        }
    }
    warn(message) {
        if (this.verbose) {
            console.warn(message);
        }
    }
    logError(message, isExperimental) {
        if (this.verbose || isExperimental === true) {
            console.error(message);
        }
    }
    logErrors(errors) {
        if (errors.length === 0) {
            throw "Logger#logError called without arguments";
        }
        if (this.verbose) {
            console.error(errors);
        }
    }
}
exports.BaseLoggger = BaseLoggger;
function isNullOrUndefined(obj) {
    return (typeof obj === "undefined") || obj === null;
}
function clip(value, minValue, maxValue) {
    if (value > maxValue) {
        return maxValue;
    }
    if (value < minValue) {
        return minValue;
    }
    return value;
}
//# sourceMappingURL=core.js.map