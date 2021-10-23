/** Append the libary components to globals for backwards compatibility. */
if (window && !Html5QrcodeScanner) {
    var Html5QrcodeScanner = window.__Html5QrcodeLibrary__.Html5QrcodeScanner;
    var Html5Qrcode = window.__Html5QrcodeLibrary__.Html5Qrcode;
    var Html5QrcodeSupportedFormats = window.__Html5QrcodeLibrary__.Html5QrcodeSupportedFormats
    var Html5QrcodeScannerState = window.__Html5QrcodeLibrary__.Html5QrcodeScannerState;
}
