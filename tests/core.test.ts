import { expect } from "chai";

import {
    Html5QrcodeSupportedFormats,
    isValidHtml5QrcodeSupportedFormats,
    QrcodeResultFormat,
    Html5QrcodeResultFactory,
    QrcodeResult,
    DecodedTextType,
    Html5QrcodeErrorFactory,
    Html5QrcodeErrorTypes,
    isNullOrUndefined,
    clip
} from "../src/core";

describe("isValidHtml5QrcodeSupportedFormats function", () => {
    it("should return true for supported formats", () => {
        expect(isValidHtml5QrcodeSupportedFormats("AZTEC")).to.be.true;
        expect(isValidHtml5QrcodeSupportedFormats("QR_CODE")).to.be.true;
        expect(isValidHtml5QrcodeSupportedFormats("UPC_A")).to.be.true;
        expect(isValidHtml5QrcodeSupportedFormats("EAN_8")).to.be.true;
    });

    it("should return false for unsupported formats", () => {
        expect(isValidHtml5QrcodeSupportedFormats("random")).to.be.false;
        expect(isValidHtml5QrcodeSupportedFormats("")).to.be.false;

    });
});

describe("QrcodeResultFormat class", () => {
    it("toString() should return correct string value", () => {
        let qrcodeResultFormat = QrcodeResultFormat.create(
            Html5QrcodeSupportedFormats.AZTEC);
    
        expect(qrcodeResultFormat.toString()).to.equal("AZTEC");
    
        qrcodeResultFormat = QrcodeResultFormat.create(
            Html5QrcodeSupportedFormats.DATA_MATRIX);
        expect(qrcodeResultFormat.toString()).to.equal("DATA_MATRIX");
    });
});

describe("Html5QrcodeResultFactory class", () => {
    it("createFromText has result and decodedText", () => {
        let decodedText = "hello";
        let qrcodeResult = Html5QrcodeResultFactory.createFromText(decodedText);
        expect(qrcodeResult.decodedText).to.equal(decodedText);
        expect(qrcodeResult.result.text).to.equal(decodedText);
    });

    it("createFromQrcodeResult has result and decodedText", () => {
        let decodedText = "https://scanapp.org";
        let inputQrcodeResult: QrcodeResult = {
            text: decodedText,
            format: QrcodeResultFormat.create(Html5QrcodeSupportedFormats.DATA_MATRIX),
            decodedTextType: DecodedTextType.URL
        }
        let qrcodeResult = Html5QrcodeResultFactory.createFromQrcodeResult(inputQrcodeResult);
        expect(qrcodeResult.decodedText).to.equal(decodedText);
        expect(qrcodeResult.result).to.equal(inputQrcodeResult);
    });
});

describe("Html5QrcodeErrorFactory class", () => {
    it("createFrom() creates corresponding error object", () => {
        let error = "test error message";
        let qrcodeError = Html5QrcodeErrorFactory.createFrom(error);

        expect(qrcodeError.errorMessage).to.equal(error);
        expect(qrcodeError.type).to.equal(Html5QrcodeErrorTypes.UNKWOWN_ERROR);
    });
});

// TODO(mebjas): Add support for proxy/spy for testing BaseLogger class.

describe("isNullOrUndefined function", () => {
    it("obj is null, undefined, returns true", () => {
        expect(isNullOrUndefined(null)).to.be.true;
        let obj;
        expect(isNullOrUndefined(obj)).to.be.true;
        obj = undefined;
        expect(isNullOrUndefined(obj)).to.be.true;
    });

    it("obj is defined, returns true", () => {
        let obj = "something";
        expect(isNullOrUndefined(obj)).to.be.false;
        expect(isNullOrUndefined(0)).to.be.false;
        expect(isNullOrUndefined(-1)).to.be.false;
        expect(isNullOrUndefined("undefined")).to.be.false;
    });
});

describe("clip function", () => {
    it("in range, returns the value", () => {
        expect(clip(5, 0, 10)).eq(5);
    });

    it("below min, returns the min value", () => {
        expect(clip(-5, 0, 10)).eq(0);
    });

    it("above max, return the max value", () => {
        expect(clip(11, 0, 10)).eq(10);
    });
});
