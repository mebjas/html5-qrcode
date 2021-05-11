"use strict";
var core;
(function (core) {
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
    })(Html5QrcodeSupportedFormats = core.Html5QrcodeSupportedFormats || (core.Html5QrcodeSupportedFormats = {}));
    var Html5QrcodeScanType;
    (function (Html5QrcodeScanType) {
        Html5QrcodeScanType[Html5QrcodeScanType["SCAN_TYPE_CAMERA"] = 0] = "SCAN_TYPE_CAMERA";
        Html5QrcodeScanType[Html5QrcodeScanType["SCAN_TYPE_FILE"] = 1] = "SCAN_TYPE_FILE";
    })(Html5QrcodeScanType = core.Html5QrcodeScanType || (core.Html5QrcodeScanType = {}));
    var Html5QrcodeConstants = (function () {
        function Html5QrcodeConstants() {
        }
        Html5QrcodeConstants.ASSET_FILE_SCAN = "https://raw.githubusercontent.com/mebjas/html5-qrcode/master/assets"
            + "/file-scan.gif";
        Html5QrcodeConstants.ASSET_CAMERA_SCAN = "https://raw.githubusercontent.com/mebjas/html5-qrcode/master/assets"
            + "/camera-scan.gif";
        Html5QrcodeConstants.GITHUB_PROJECT_URL = "https://github.com/mebjas/html5-qrcode";
        return Html5QrcodeConstants;
    }());
    core.Html5QrcodeConstants = Html5QrcodeConstants;
    var Html5QrcodeResultFactory = (function () {
        function Html5QrcodeResultFactory() {
        }
        Html5QrcodeResultFactory.createFrom = function (decodedText) {
            var qrcodeResult = {
                text: decodedText
            };
            return {
                decodedText: decodedText,
                fullResult: qrcodeResult
            };
        };
        return Html5QrcodeResultFactory;
    }());
    core.Html5QrcodeResultFactory = Html5QrcodeResultFactory;
    var Html5QrcodeErrorTypes;
    (function (Html5QrcodeErrorTypes) {
        Html5QrcodeErrorTypes[Html5QrcodeErrorTypes["UNKWOWN_ERROR"] = 0] = "UNKWOWN_ERROR";
        Html5QrcodeErrorTypes[Html5QrcodeErrorTypes["IMPLEMENTATION_ERROR"] = 1] = "IMPLEMENTATION_ERROR";
        Html5QrcodeErrorTypes[Html5QrcodeErrorTypes["NO_CODE_FOUND_ERROR"] = 2] = "NO_CODE_FOUND_ERROR";
    })(Html5QrcodeErrorTypes = core.Html5QrcodeErrorTypes || (core.Html5QrcodeErrorTypes = {}));
    var Html5QrcodeErrorFactory = (function () {
        function Html5QrcodeErrorFactory() {
        }
        Html5QrcodeErrorFactory.createFrom = function (error) {
            return {
                errorMessage: error,
                type: Html5QrcodeErrorTypes.UNKWOWN_ERROR
            };
        };
        return Html5QrcodeErrorFactory;
    }());
    core.Html5QrcodeErrorFactory = Html5QrcodeErrorFactory;
    var BaseLoggger = (function () {
        function BaseLoggger(verbose) {
            this.verbose = verbose;
        }
        BaseLoggger.prototype.log = function (message) {
            if (this.verbose) {
                console.log(message);
            }
        };
        BaseLoggger.prototype.warn = function (message) {
            if (this.verbose) {
                console.warn(message);
            }
        };
        BaseLoggger.prototype.logError = function (message, isExperimental) {
            if (this.verbose || isExperimental === true) {
                console.error(message);
            }
        };
        BaseLoggger.prototype.logErrors = function (errors) {
            if (errors.length == 0) {
                throw "Logger#logError called without arguments";
            }
            if (this.verbose) {
                console.error(errors);
            }
        };
        return BaseLoggger;
    }());
    core.BaseLoggger = BaseLoggger;
})(core || (core = {}));
//# sourceMappingURL=html5-qrcode.js.map