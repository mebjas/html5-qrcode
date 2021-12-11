import {
    Html5QrcodeSupportedFormats,
    isValidHtml5QrcodeSupportedFormats,
    QrcodeResultFormat
} from "../src/core";
import { expect } from 'chai';

describe("isValidHtml5QrcodeSupportedFormats function", () => {
    it("should return true for supported formats", () => {
        expect(isValidHtml5QrcodeSupportedFormats("AZTEC")).to.equal(true);
        expect(isValidHtml5QrcodeSupportedFormats("QR_CODE")).to.equal(true);
        expect(isValidHtml5QrcodeSupportedFormats("UPC_A")).to.equal(true);
        expect(isValidHtml5QrcodeSupportedFormats("EAN_8")).to.equal(true);
    });

    it("should return false for unsupported formats", () => {
        expect(isValidHtml5QrcodeSupportedFormats("random")).to.equal(false);
        expect(isValidHtml5QrcodeSupportedFormats("")).to.equal(false);

    });
});
