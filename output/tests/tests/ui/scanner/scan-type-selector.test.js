"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const core_1 = require("../../../src/core");
const scan_type_selector_1 = require("../../../src/ui/scanner/scan-type-selector");
describe("ScanTypeSelector#getDefaultScanType()", () => {
    it("Camera + File returns camera", () => {
        let selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            core_1.Html5QrcodeScanType.SCAN_TYPE_FILE
        ]);
        (0, chai_1.expect)(selector.getDefaultScanType()).to.equal(core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA);
    });
    it("File + Camera returns camera", () => {
        let selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_FILE,
            core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ]);
        (0, chai_1.expect)(selector.getDefaultScanType()).to.equal(core_1.Html5QrcodeScanType.SCAN_TYPE_FILE);
    });
    it("Camera returns camera", () => {
        let selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ]);
        (0, chai_1.expect)(selector.getDefaultScanType()).to.equal(core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA);
    });
    it("File returns camera", () => {
        let selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_FILE
        ]);
        (0, chai_1.expect)(selector.getDefaultScanType()).to.equal(core_1.Html5QrcodeScanType.SCAN_TYPE_FILE);
    });
});
describe("ScanTypeSelector#hasMoreThanOneScanType()", () => {
    it("Both values set - returns true", () => {
        let selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            core_1.Html5QrcodeScanType.SCAN_TYPE_FILE
        ]);
        (0, chai_1.expect)(selector.hasMoreThanOneScanType()).to.be.true;
        selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_FILE,
            core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ]);
        (0, chai_1.expect)(selector.hasMoreThanOneScanType()).to.be.true;
    });
    it("Single value set - returns true", () => {
        let selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ]);
        (0, chai_1.expect)(selector.hasMoreThanOneScanType()).to.be.false;
        selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_FILE
        ]);
        (0, chai_1.expect)(selector.hasMoreThanOneScanType()).to.be.false;
    });
});
describe("ScanTypeSelector#isCameraScanRequired()", () => {
    it("Both values set - returns true", () => {
        let selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            core_1.Html5QrcodeScanType.SCAN_TYPE_FILE
        ]);
        (0, chai_1.expect)(selector.isCameraScanRequired()).to.be.true;
        selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_FILE,
            core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ]);
        (0, chai_1.expect)(selector.isCameraScanRequired()).to.be.true;
    });
    it("Camera only set - returns true", () => {
        let selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA
        ]);
        (0, chai_1.expect)(selector.isCameraScanRequired()).to.be.true;
    });
    it("File only set - returns false", () => {
        let selector = new scan_type_selector_1.ScanTypeSelector([
            core_1.Html5QrcodeScanType.SCAN_TYPE_FILE
        ]);
        (0, chai_1.expect)(selector.isCameraScanRequired()).to.be.false;
    });
});
describe("ScanTypeSelector#isCameraScanType()", () => {
    it("Camera passed - returns true", () => {
        (0, chai_1.expect)(scan_type_selector_1.ScanTypeSelector.isCameraScanType(core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA)).to.be.true;
    });
    it("File passed - returns false", () => {
        (0, chai_1.expect)(scan_type_selector_1.ScanTypeSelector.isCameraScanType(core_1.Html5QrcodeScanType.SCAN_TYPE_FILE)).to.be.false;
    });
});
describe("ScanTypeSelector#isFileScanType()", () => {
    it("Camera passed - returns false", () => {
        (0, chai_1.expect)(scan_type_selector_1.ScanTypeSelector.isFileScanType(core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA)).to.be.false;
    });
    it("File passed - returns true", () => {
        (0, chai_1.expect)(scan_type_selector_1.ScanTypeSelector.isFileScanType(core_1.Html5QrcodeScanType.SCAN_TYPE_FILE)).to.be.true;
    });
});
//# sourceMappingURL=scan-type-selector.test.js.map