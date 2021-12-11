import {
    isValidHtml5QrcodeSupportedFormats
} from "../src/core";

test('isValidHtml5QrcodeSupportedFormats supported format', () => {
    expect(isValidHtml5QrcodeSupportedFormats("AZTEC")).toBe(true);
    expect(isValidHtml5QrcodeSupportedFormats("QR_CODE")).toBe(true);
    expect(isValidHtml5QrcodeSupportedFormats("UPC_A")).toBe(true);
    expect(isValidHtml5QrcodeSupportedFormats("EAN_8")).toBe(true);
});

test('isValidHtml5QrcodeSupportedFormats unsupported format', () => {
    expect(isValidHtml5QrcodeSupportedFormats("random")).toBe(false);
});
