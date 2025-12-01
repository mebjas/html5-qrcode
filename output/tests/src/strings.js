"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibraryInfoStrings = exports.Html5QrcodeScannerStrings = exports.Html5QrcodeStrings = void 0;
class Html5QrcodeStrings {
    static codeParseError(exception) {
        return `QR code parse error, error = ${exception}`;
    }
    static errorGettingUserMedia(error) {
        return `Error getting userMedia, error = ${error}`;
    }
    static onlyDeviceSupportedError() {
        return "The device doesn't support navigator.mediaDevices , only "
            + "supported cameraIdOrConfig in this case is deviceId parameter "
            + "(string).";
    }
    static cameraStreamingNotSupported() {
        return "Camera streaming not supported by the browser.";
    }
    static unableToQuerySupportedDevices() {
        return "Unable to query supported devices, unknown error.";
    }
    static insecureContextCameraQueryError() {
        return "Camera access is only supported in secure context like https "
            + "or localhost.";
    }
    static scannerPaused() {
        return "Scanner paused";
    }
}
exports.Html5QrcodeStrings = Html5QrcodeStrings;
class Html5QrcodeScannerStrings {
    static scanningStatus() {
        return "Scanning";
    }
    static idleStatus() {
        return "Idle";
    }
    static errorStatus() {
        return "Error";
    }
    static permissionStatus() {
        return "Permission";
    }
    static noCameraFoundErrorStatus() {
        return "No Cameras";
    }
    static lastMatch(decodedText) {
        return `Last Match: ${decodedText}`;
    }
    static codeScannerTitle() {
        return "Code Scanner";
    }
    static cameraPermissionTitle() {
        return "Request Camera Permissions";
    }
    static cameraPermissionRequesting() {
        return "Requesting camera permissions...";
    }
    static noCameraFound() {
        return "No camera found";
    }
    static scanButtonStopScanningText() {
        return "Stop Scanning";
    }
    static scanButtonStartScanningText() {
        return "Start Scanning";
    }
    static torchOnButton() {
        return "Switch On Torch";
    }
    static torchOffButton() {
        return "Switch Off Torch";
    }
    static torchOnFailedMessage() {
        return "Failed to turn on torch";
    }
    static torchOffFailedMessage() {
        return "Failed to turn off torch";
    }
    static scanButtonScanningStarting() {
        return "Launching Camera...";
    }
    static textIfCameraScanSelected() {
        return "Scan an Image File";
    }
    static textIfFileScanSelected() {
        return "Scan using camera directly";
    }
    static selectCamera() {
        return "Select Camera";
    }
    static fileSelectionChooseImage() {
        return "Choose Image";
    }
    static fileSelectionChooseAnother() {
        return "Choose Another";
    }
    static fileSelectionNoImageSelected() {
        return "No image choosen";
    }
    static anonymousCameraPrefix() {
        return "Anonymous Camera";
    }
    static dragAndDropMessage() {
        return "Or drop an image to scan";
    }
    static dragAndDropMessageOnlyImages() {
        return "Or drop an image to scan (other files not supported)";
    }
    static zoom() {
        return "zoom";
    }
    static loadingImage() {
        return "Loading image...";
    }
    static cameraScanAltText() {
        return "Camera based scan";
    }
    static fileScanAltText() {
        return "Fule based scan";
    }
}
exports.Html5QrcodeScannerStrings = Html5QrcodeScannerStrings;
class LibraryInfoStrings {
    static poweredBy() {
        return "Powered by ";
    }
    static reportIssues() {
        return "Report issues";
    }
}
exports.LibraryInfoStrings = LibraryInfoStrings;
//# sourceMappingURL=strings.js.map