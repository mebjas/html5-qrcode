/**
 * @fileoverview - Global export file.
 * HTML5 QR code & barcode scanning library.
 * - Decode QR Code.
 * - Decode different kinds of barcodes.
 * - Decode using web cam, smart phone camera or using images on local file
 *   system.
 *
 * @author mebjas <minhazav@gmail.com>
 *
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

export {
    Html5Qrcode,
    Html5QrcodeFullConfig,
    Html5QrcodeCameraScanConfig
} from "./html5-qrcode";
export { Html5QrcodeScanner } from "./html5-qrcode-scanner";
export {
    Html5QrcodeSupportedFormats,
    Html5QrcodeResult,
    QrcodeSuccessCallback,
    QrcodeErrorCallback
} from "./core";
export { Html5QrcodeScannerState } from "./state-manager";
export { Html5QrcodeScanType } from "./core";
export { 
    CameraCapabilities,
    CameraDevice
} from "./camera/core";
