"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const core_1 = require("../src/core");
describe("isValidHtml5QrcodeSupportedFormats function", () => {
    it("should return true for supported formats", () => {
        (0, chai_1.expect)((0, core_1.isValidHtml5QrcodeSupportedFormats)("AZTEC")).to.be.true;
        (0, chai_1.expect)((0, core_1.isValidHtml5QrcodeSupportedFormats)("QR_CODE")).to.be.true;
        (0, chai_1.expect)((0, core_1.isValidHtml5QrcodeSupportedFormats)("UPC_A")).to.be.true;
        (0, chai_1.expect)((0, core_1.isValidHtml5QrcodeSupportedFormats)("EAN_8")).to.be.true;
    });
    it("should return false for unsupported formats", () => {
        (0, chai_1.expect)((0, core_1.isValidHtml5QrcodeSupportedFormats)("random")).to.be.false;
        (0, chai_1.expect)((0, core_1.isValidHtml5QrcodeSupportedFormats)("")).to.be.false;
    });
});
describe("QrcodeResultFormat class", () => {
    it("toString() should return correct string value", () => {
        let qrcodeResultFormat = core_1.QrcodeResultFormat.create(core_1.Html5QrcodeSupportedFormats.AZTEC);
        (0, chai_1.expect)(qrcodeResultFormat.toString()).to.equal("AZTEC");
        qrcodeResultFormat = core_1.QrcodeResultFormat.create(core_1.Html5QrcodeSupportedFormats.DATA_MATRIX);
        (0, chai_1.expect)(qrcodeResultFormat.toString()).to.equal("DATA_MATRIX");
    });
});
describe("Html5QrcodeResultFactory class", () => {
    it("createFromText has result and decodedText", () => {
        let decodedText = "hello";
        let qrcodeResult = core_1.Html5QrcodeResultFactory.createFromText(decodedText);
        (0, chai_1.expect)(qrcodeResult.decodedText).to.equal(decodedText);
        (0, chai_1.expect)(qrcodeResult.result.text).to.equal(decodedText);
    });
    it("createFromQrcodeResult has result and decodedText", () => {
        let decodedText = "https://scanapp.org";
        let inputQrcodeResult = {
            text: decodedText,
            format: core_1.QrcodeResultFormat.create(core_1.Html5QrcodeSupportedFormats.DATA_MATRIX),
            decodedTextType: core_1.DecodedTextType.URL
        };
        let qrcodeResult = core_1.Html5QrcodeResultFactory.createFromQrcodeResult(inputQrcodeResult);
        (0, chai_1.expect)(qrcodeResult.decodedText).to.equal(decodedText);
        (0, chai_1.expect)(qrcodeResult.result).to.equal(inputQrcodeResult);
    });
});
describe("Html5QrcodeErrorFactory class", () => {
    it("createFrom() creates corresponding error object", () => {
        let error = "test error message";
        let qrcodeError = core_1.Html5QrcodeErrorFactory.createFrom(error);
        (0, chai_1.expect)(qrcodeError.errorMessage).to.equal(error);
        (0, chai_1.expect)(qrcodeError.type).to.equal(core_1.Html5QrcodeErrorTypes.UNKWOWN_ERROR);
    });
});
describe("isNullOrUndefined function", () => {
    it("obj is null, undefined, returns true", () => {
        (0, chai_1.expect)((0, core_1.isNullOrUndefined)(null)).to.be.true;
        let obj;
        (0, chai_1.expect)((0, core_1.isNullOrUndefined)(obj)).to.be.true;
        obj = undefined;
        (0, chai_1.expect)((0, core_1.isNullOrUndefined)(obj)).to.be.true;
    });
    it("obj is defined, returns true", () => {
        let obj = "something";
        (0, chai_1.expect)((0, core_1.isNullOrUndefined)(obj)).to.be.false;
        (0, chai_1.expect)((0, core_1.isNullOrUndefined)(0)).to.be.false;
        (0, chai_1.expect)((0, core_1.isNullOrUndefined)(-1)).to.be.false;
        (0, chai_1.expect)((0, core_1.isNullOrUndefined)("undefined")).to.be.false;
    });
});
describe("clip function", () => {
    it("in range, returns the value", () => {
        (0, chai_1.expect)((0, core_1.clip)(5, 0, 10)).eq(5);
    });
    it("below min, returns the min value", () => {
        (0, chai_1.expect)((0, core_1.clip)(-5, 0, 10)).eq(0);
    });
    it("above max, return the max value", () => {
        (0, chai_1.expect)((0, core_1.clip)(11, 0, 10)).eq(10);
    });
});
//# sourceMappingURL=core.test.js.map