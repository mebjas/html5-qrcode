"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanTypeSelector = void 0;
const core_1 = require("../../core");
class ScanTypeSelector {
    constructor(supportedScanTypes) {
        this.supportedScanTypes = this.validateAndReturnScanTypes(supportedScanTypes);
    }
    getDefaultScanType() {
        return this.supportedScanTypes[0];
    }
    hasMoreThanOneScanType() {
        return this.supportedScanTypes.length > 1;
    }
    isCameraScanRequired() {
        for (const scanType of this.supportedScanTypes) {
            if (ScanTypeSelector.isCameraScanType(scanType)) {
                return true;
            }
        }
        return false;
    }
    static isCameraScanType(scanType) {
        return scanType === core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA;
    }
    static isFileScanType(scanType) {
        return scanType === core_1.Html5QrcodeScanType.SCAN_TYPE_FILE;
    }
    validateAndReturnScanTypes(supportedScanTypes) {
        if (!supportedScanTypes || supportedScanTypes.length === 0) {
            return core_1.Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE;
        }
        let maxExpectedValues = core_1.Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE.length;
        if (supportedScanTypes.length > maxExpectedValues) {
            throw `Max ${maxExpectedValues} values expected for `
                + "supportedScanTypes";
        }
        for (const scanType of supportedScanTypes) {
            if (!core_1.Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE
                .includes(scanType)) {
                throw `Unsupported scan type ${scanType}`;
            }
        }
        return supportedScanTypes;
    }
}
exports.ScanTypeSelector = ScanTypeSelector;
//# sourceMappingURL=scan-type-selector.js.map