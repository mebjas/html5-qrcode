/**
 * @fileoverview
 * Util class to help with scan type selection in scanner class.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {
    Html5QrcodeScanType,
    Html5QrcodeConstants
} from "../../core";

/** Util class to help with scan type selection in scanner class. */
export class ScanTypeSelector {
    private supportedScanTypes: Array<Html5QrcodeScanType>;

    constructor(supportedScanTypes?: Array<Html5QrcodeScanType> | []) {
        this.supportedScanTypes = this.validateAndReturnScanTypes(
            supportedScanTypes);
    }

    /**
     * Returns the default {@link Html5QrcodeScanType} scanner UI should be
     * created with.
     */
    public getDefaultScanType(): Html5QrcodeScanType {
        return this.supportedScanTypes[0];
    }

    /**
     * Returns {@code true} if more than one {@link Html5QrcodeScanType} are
     * set.
     */
    public hasMoreThanOneScanType(): boolean {
        return this.supportedScanTypes.length > 1;
    }

    /** Returns {@code true} if camera scan is required at all. */
    public isCameraScanRequired(): boolean {
        for (const scanType of this.supportedScanTypes) {
            if (ScanTypeSelector.isCameraScanType(scanType)) {
                return true;
            }
        }
        return false;
    }

    /** Returns {@code true} is {@code scanType} is camera based. */
    public static isCameraScanType(scanType: Html5QrcodeScanType): boolean {
        return scanType === Html5QrcodeScanType.SCAN_TYPE_CAMERA;
    }

    /** Returns {@code true} is {@code scanType} is file based. */
    public static isFileScanType(scanType: Html5QrcodeScanType): boolean {
        return scanType === Html5QrcodeScanType.SCAN_TYPE_FILE;
    }

    //#region Private methods.
    /**
     * Validates the input {@code supportedScanTypes}.
     * 
     * Fails early if the config values is incorrectly set.
     */
    private validateAndReturnScanTypes(
        supportedScanTypes?:Array<Html5QrcodeScanType>):
        Array<Html5QrcodeScanType> {
        // If not set, use the default values and order.
        if (!supportedScanTypes || supportedScanTypes.length === 0) {
            return Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE;
        }

        // Fail if more than expected number of values exist.
        let maxExpectedValues
            = Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE.length;
        if (supportedScanTypes.length > maxExpectedValues) {
            throw `Max ${maxExpectedValues} values expected for `
                + "supportedScanTypes";
        }

        // Fail if any of the scan types are not supported.
        for (const scanType of supportedScanTypes) {
            if (!Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE
                    .includes(scanType)) {
                throw `Unsupported scan type ${scanType}`;
            }
        }

        return supportedScanTypes;
    }
    //#endregion
}
