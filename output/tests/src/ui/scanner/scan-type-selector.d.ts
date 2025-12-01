import { Html5QrcodeScanType } from "../../core";
export declare class ScanTypeSelector {
    private supportedScanTypes;
    constructor(supportedScanTypes?: Array<Html5QrcodeScanType> | []);
    getDefaultScanType(): Html5QrcodeScanType;
    hasMoreThanOneScanType(): boolean;
    isCameraScanRequired(): boolean;
    static isCameraScanType(scanType: Html5QrcodeScanType): boolean;
    static isFileScanType(scanType: Html5QrcodeScanType): boolean;
    private validateAndReturnScanTypes;
}
