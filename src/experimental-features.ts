/**
 * @fileoverview
 * Core library for experimental features.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * Experimental features are those which have limited browser compatibility and
 * hidden from official documentations. These features are not recommended by
 * the author to be used in production unless explictly tested.
 * 
 * Subset of the features are expected to upgrade to official feature list from
 * time to time.
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */


/**
 * Configuration for enabling or disabling experimental features in the library.
 * 
 * These features will eventually upgrade as fully supported features in the
 * library.
 */
export interface ExperimentalFeaturesConfig {
    /**
     * {@class BarcodeDetector} is being implemented by browsers at the moment.
     * It has very limited browser support but as it gets available it could
     * enable faster native code scanning experience.
     * 
     * Set this flag to true, to enable using {@class BarcodeDetector} if
     * supported. This is false by default.
     * 
     * @deprecated This configuration has graduated to
     * {@code Html5QrcodeCameraScanConfig} you can set it there directly. All
     * documentation and future improvements shall be added to that one. This
     * config will still work for backwards compatibility.
     * 
     * Documentations:
     *  - https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector
     *  - https://web.dev/shape-detection/#barcodedetector
     */
    useBarCodeDetectorIfSupported?: boolean | undefined;
}
