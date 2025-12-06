/**
 * @fileoverview
 * Strings used by {@class Html5Qrcode} & {@class Html5QrcodeScanner}
 *
 * @author mebjas <minhazav@gmail.com>
 *
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

let locale = 'en';

export function setLocale(newLocale: 'en' | 'es') {
  locale = newLocale;
}

/**
 * Strings used in {@class Html5Qrcode}.
 *
 * TODO(mebjas): Support internalization.
 */
export class Html5QrcodeStrings {

    public static codeParseError(exception: any): string {
        switch (locale) {
            case 'es':
                return `Error de análisis de código QR, error = ${exception}`;
            default:
                return `QR code parse error, error = ${exception}`;
        }
    }

    public static errorGettingUserMedia(error: any): string {
        switch (locale) {
            case 'es':
                return `Error obteniendo userMedia, error = ${error}`;
            default:
                return `Error getting userMedia, error = ${error}`;
        }
    }

    public static onlyDeviceSupportedError(): string {
        switch (locale) {
            case 'es':
                "El dispositivo no es compatible con navigator.mediaDevices, "
                + "cameraIdOrConfig solo soporta el parámetro deviceId en este caso "
                + "(string).";
            default:
                return "The device doesn't support navigator.mediaDevices , only "
                + "supported cameraIdOrConfig in this case is deviceId parameter "
                + "(string).";
        }

    }

    public static cameraStreamingNotSupported(): string {
        switch (locale) {
            case 'es':
                return "La transmisión de la cámara no es compatible con el navegador.";
            default:
                return "Camera streaming not supported by the browser.";
        }
    }

    public static unableToQuerySupportedDevices(): string {
        switch (locale) {
            case 'es':
                return "No se pueden consultar los dispositivos compatibles, error desconocido.";
            default:
                return "Unable to query supported devices, unknown error.";
        }
    }

    public static insecureContextCameraQueryError(): string {
        switch (locale) {
            case 'es':
                return "El acceso a la cámara solo se admite en un contexto seguro como https"
                + "o localhost.";
            default:
                return "Camera access is only supported in secure context like https "
                + "or localhost.";
        }
    }

    public static scannerPaused(): string {
        switch (locale) {
            case 'es':
                return "Escáner en pausa";
            default:
                return "Scanner paused";
        }
    }
}

/**
 * Strings used in {@class Html5QrcodeScanner}.
 *
 * TODO(mebjas): Support internalization.
 */
export class Html5QrcodeScannerStrings {

    public static scanningStatus(): string {
        switch (locale) {
            case 'es':
                return "Escaneando";
            default:
                return "Scanning";
        }
    }

    public static idleStatus(): string {
        switch (locale) {
            case 'es':
                return "Inactiva";
            default:
                return "Idle";
        }
    }

    public static errorStatus(): string {
        switch (locale) {
            case 'es':
                return "Error";
            default:
                return "Error";
        }
    }

    public static permissionStatus(): string {
        switch (locale) {
            case 'es':
                return "Permiso";
            default:
                return "Permission";
        }
    }

    public static noCameraFoundErrorStatus(): string {
        switch (locale) {
            case 'es':
                return "Sin cámaras";
            default:
                return "No Cameras";
        }
    }

    public static lastMatch(decodedText: string): string {
        switch (locale) {
            case 'es':
                return `Última coincidencia: ${decodedText}`;
            default:
                return `Last Match: ${decodedText}`;
        }
    }

    public static codeScannerTitle(): string {
        switch (locale) {
            case 'es':
                return "Escáner de Código";
            default:
                return "Code Scanner";
        }
    }

    public static cameraPermissionTitle(): string {
        switch (locale) {
            case 'es':
                return "Solicitar permisos de cámara";
            default:
                return "Request Camera Permissions";
        }
    }

    public static cameraPermissionRequesting(): string {
        switch (locale) {
            case 'es':
                return "Solicitando permisos de cámara...";
            default:
                return "Requesting camera permissions...";
        }
    }

    public static noCameraFound(): string {
        switch (locale) {
            case 'es':
                return "No se encontró ninguna cámara";
            default:
                return "No camera found";
        }
    }

    public static scanButtonStopScanningText(): string {
        switch (locale) {
            case 'es':
                return "Dejar de escanear";
            default:
                return "Stop Scanning";
        }
    }

    public static scanButtonStartScanningText(): string {
        switch (locale) {
            case 'es':
                return "Comenzar a escanear";
            default:
                return "Start Scanning";
        }
    }

    public static torchOnButton(): string {
        switch (locale) {
            case 'es':
                return "Encender Torch";
            default:
                return "Switch On Torch";
        }
    }

    public static torchOffButton(): string {
        switch (locale) {
            case 'es':
                return "Apagar Torch";
            default:
                return "Switch Off Torch";
        }
    }

    public static torchOnFailedMessage(): string {
        switch (locale) {
            case 'es':
                return "Error al encender torch";
            default:
                return "Failed to turn on torch";
        }
    }

    public static torchOffFailedMessage(): string {
        switch (locale) {
            case 'es':
                return "Error al apagar torch";
            default:
                return "Failed to turn off torch";
        }
    }

    public static scanButtonScanningStarting(): string {
        switch (locale) {
            case 'es':
                return "Iniciando la Cámara...";
            default:
                return "Launching Camera...";
        }
    }

    /**
     * Text to show when camera scan is selected.
     *
     * This will be used to switch to file based scanning.
     */
    public static textIfCameraScanSelected(): string {
        switch (locale) {
            case 'es':
                return "Escanear un Archivo de Imagen";
            default:
                return "Scan an Image File";
        }
    }

    /**
     * Text to show when file based scan is selected.
     *
     * This will be used to switch to camera based scanning.
     */
    public static textIfFileScanSelected(): string {
        switch (locale) {
            case 'es':
                return "Escanear usando la cámara directamente";
            default:
                return "Scan using camera directly";
        }
    }

    public static selectCamera(): string {
        switch (locale) {
            case 'es':
                return "Seleccionar Cámara";
            default:
                return "Select Camera";
        }
    }

    public static fileSelectionChooseImage(): string {
        switch (locale) {
            case 'es':
                return "Elegir Imagen";
            default:
                return "Choose Image";
        }
    }

    public static fileSelectionChooseAnother(): string {
        switch (locale) {
            case 'es':
                return "Elegir Otra";
            default:
                return "Choose Another";
        }
    }

    public static fileSelectionNoImageSelected(): string {
        switch (locale) {
            case 'es':
                return "Ninguna imagen elegida";
            default:
                return "No image choosen";
        }
    }

    /** Prefix to be given to anonymous cameras. */
    public static anonymousCameraPrefix(): string {
        switch (locale) {
            case 'es':
                return "Cámara Anónima";
            default:
                return "Anonymous Camera";
        }
    }

    public static dragAndDropMessage(): string {
        switch (locale) {
            case 'es':
                return "O elige una imagen para escanear";
            default:
                return "Or drop an image to scan";
        }
    }

    public static dragAndDropMessageOnlyImages(): string {
        switch (locale) {
            case 'es':
                return "O elige una imagen para escanear (no se admiten otros archivos)";
            default:
                return "Or drop an image to scan (other files not supported)";
        }
    }

    /** Value for zoom. */
    public static zoom(): string {
        switch (locale) {
            case 'es':
                return "zoom";
            default:
                return "zoom";
        }
    }

    public static loadingImage(): string {
        switch (locale) {
            case 'es':
                return "Cargando imagen...";
            default:
                return "Loading image...";
        }
    }

    public static cameraScanAltText(): string {
        switch (locale) {
            case 'es':
                return "Escaneo basado en cámara";
            default:
                return "Camera based scan";
        }
    }

    public static fileScanAltText(): string {
        switch (locale) {
            case 'es':
                return "Escaneo basado en Fule";
            default:
                return "Fule based scan";
        }
    }
}

/** Strings used in {@class LibraryInfoDiv} */
export class LibraryInfoStrings {

    public static poweredBy(): string {
        switch (locale) {
            case 'es':
                return "Desarrollado por ";
            default:
                return "Powered by ";
        }
    }

    public static reportIssues(): string {
        switch (locale) {
            case 'es':
                return "Informar problemas";
            default:
                return "Report issues";
        }
    }
}
