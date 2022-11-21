import { expect } from "chai";

import { Html5QrcodeScanType } from "../../../src/core";
import { ScanTypeSelector } from "../../../src/ui/scanner/scan-type-selector";

describe("ScanTypeSelector#getDefaultScanType()", () => {
    it("Camera + File returns camera", () => {
        let selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            Html5QrcodeScanType.SCAN_TYPE_FILE]);
        expect(selector.getDefaultScanType()).to.equal(
            Html5QrcodeScanType.SCAN_TYPE_CAMERA);
    });

    it("File + Camera returns camera", () => {
        let selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_FILE,
            Html5QrcodeScanType.SCAN_TYPE_CAMERA]);
        expect(selector.getDefaultScanType()).to.equal(
            Html5QrcodeScanType.SCAN_TYPE_FILE);
    });

    it("Camera returns camera", () => {
        let selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_CAMERA]);
        expect(selector.getDefaultScanType()).to.equal(
            Html5QrcodeScanType.SCAN_TYPE_CAMERA);
    });

    it("File returns camera", () => {
        let selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_FILE]);
        expect(selector.getDefaultScanType()).to.equal(
            Html5QrcodeScanType.SCAN_TYPE_FILE);
    });
});

describe("ScanTypeSelector#hasMoreThanOneScanType()", () => {
    it("Both values set - returns true", () => {
        let selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            Html5QrcodeScanType.SCAN_TYPE_FILE]);
        expect(selector.hasMoreThanOneScanType()).to.be.true;

        selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_FILE,
            Html5QrcodeScanType.SCAN_TYPE_CAMERA]);
        expect(selector.hasMoreThanOneScanType()).to.be.true;
    });

    it("Single value set - returns true", () => {
        let selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_CAMERA]);
        expect(selector.hasMoreThanOneScanType()).to.be.false;

        selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_FILE]);
        expect(selector.hasMoreThanOneScanType()).to.be.false;
    });
});

describe("ScanTypeSelector#isCameraScanRequired()", () => {
    it("Both values set - returns true", () => {
        let selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            Html5QrcodeScanType.SCAN_TYPE_FILE]);
        expect(selector.isCameraScanRequired()).to.be.true;

        selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_FILE,
            Html5QrcodeScanType.SCAN_TYPE_CAMERA]);
        expect(selector.isCameraScanRequired()).to.be.true;
    });

    it("Camera only set - returns true", () => {
        let selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_CAMERA]);
        expect(selector.isCameraScanRequired()).to.be.true;
    });

    it("File only set - returns false", () => {
        let selector = new ScanTypeSelector([
            Html5QrcodeScanType.SCAN_TYPE_FILE]);
        expect(selector.isCameraScanRequired()).to.be.false;
    });
});

describe("ScanTypeSelector#isCameraScanType()", () => {
    it("Camera passed - returns true", () => {
        expect(ScanTypeSelector.isCameraScanType(
            Html5QrcodeScanType.SCAN_TYPE_CAMERA)).to.be.true;
    });

    it("File passed - returns false", () => {
        expect(ScanTypeSelector.isCameraScanType(
            Html5QrcodeScanType.SCAN_TYPE_FILE)).to.be.false;
    });
});

describe("ScanTypeSelector#isFileScanType()", () => {
    it("Camera passed - returns false", () => {
        expect(ScanTypeSelector.isFileScanType(
            Html5QrcodeScanType.SCAN_TYPE_CAMERA)).to.be.false;
    });

    it("File passed - returns true", () => {
        expect(ScanTypeSelector.isFileScanType(
            Html5QrcodeScanType.SCAN_TYPE_FILE)).to.be.true;
    });
});
