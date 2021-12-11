import {
    Html5QrcodeSupportedFormats,
    isValidHtml5QrcodeSupportedFormats,
    QrcodeResultFormat
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

test('QrcodeResultFormat#toString() returns corrrect format', () => {
    let qrcodeResultFormat = QrcodeResultFormat.create(
        Html5QrcodeSupportedFormats.AZTEC);

    expect(qrcodeResultFormat.toString()).toBe("AZTEC");

    qrcodeResultFormat = QrcodeResultFormat.create(
        Html5QrcodeSupportedFormats.DATA_MATRIX);
    expect(qrcodeResultFormat.toString()).toBe("DATA_MATRIX");
});