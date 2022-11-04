/**
 * @fileoverview
 * File for torch related UI components and handling.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {Html5QrcodeScannerStrings} from "../../strings";
import {Html5Qrcode} from "../../html5-qrcode";
import {
    BaseUiElementFactory,
    PublicUiElementIdAndClasses
} from "./base";

/**
 * Interface for callback that will be called in case of torch action failures.
 */
export type OnTorchActionFailureCallback = (failureMessage: string) => void;

/** Controller class for handling torch / flash. */
class TorchController {
    private readonly html5Qrcode: Html5Qrcode;
    private readonly buttonElement: HTMLButtonElement;
    private readonly onTorchActionFailureCallback: OnTorchActionFailureCallback;
    
    // Mutable states.
    private isTorchOn: boolean = false;

    constructor(
        html5Qrcode: Html5Qrcode,
        buttonElement: HTMLButtonElement,
        onTorchActionFailureCallback: OnTorchActionFailureCallback) {
        this.html5Qrcode = html5Qrcode;
        this.buttonElement = buttonElement;
        this.onTorchActionFailureCallback = onTorchActionFailureCallback;
    }

    /** Returns {@code true} if torch is enabled. */
    public isTorchEnabled(): boolean {
        return this.isTorchOn;
    }

    /**
     * Flips the state of the torch.
     * 
     * <p> Turns torch On if current state is Off and vice-versa.
     * <p> Modifies the UI state accordingly.
     * 
     * @returns Promise that finishes when the async action is done.
     */
    public async flipState(): Promise<void> {
        this.buttonElement.disabled = true;
        let isTorchOnExpected = !this.isTorchOn;
        // Following constraint is used to set torch when camera feed is active
        // on supported devices. Likely only supported on Chrome on Android.

        // @ts-ignore : 'torch' doesn't seem to be supported as a first
        // class citizen in 'MediaTrackConstraints' implicitly.
        let constraints: MediaTrackConstraints = {
            "torch": isTorchOnExpected,
            "advanced": [{
                // @ts-ignore
                "torch": isTorchOnExpected
                }]};

        try {
            await this.html5Qrcode.applyVideoConstraints(constraints);
            let settings = this.html5Qrcode.getRunningTrackSettings();
            this.updateUiBasedOnLatestSettings(settings, isTorchOnExpected);
        } catch (error) {
            this.propagateFailure(isTorchOnExpected, error);
            this.buttonElement.disabled = false;
        }
    }

    private updateUiBasedOnLatestSettings(
        settings: MediaTrackSettings,
        isTorchOnExpected: boolean) {
        // @ts-ignore
        if (settings.torch === isTorchOnExpected) {
            // Action succeeded, flip the state.
            this.buttonElement.innerText
                = isTorchOnExpected
                    ? Html5QrcodeScannerStrings.torchOffButton()
                    : Html5QrcodeScannerStrings.torchOnButton();
            this.isTorchOn = isTorchOnExpected;
        } else {
            // Torch didn't get set as expected.
            // Show warning.
            this.propagateFailure(isTorchOnExpected);
        }
        this.buttonElement.disabled = false;
    }

    private propagateFailure(
        isTorchOnExpected: boolean, error?: any) {
        let errorMessage = isTorchOnExpected
            ? Html5QrcodeScannerStrings.torchOnFailedMessage()
            : Html5QrcodeScannerStrings.torchOffFailedMessage();
        if (error) {
            errorMessage += "; Error = " + error;
        }
        this.onTorchActionFailureCallback(errorMessage);
    }

    /**
     * Resets the state.
     * 
     * <p>Note: Doesn't turn off the torch implicitly.
     */
    public reset() {
        this.isTorchOn = false;
    }
}

/** Options for creating torch button. */
export interface TorchButtonOptions {
    display: string;
    marginLeft: string;
}

/**
 * Helper class for creating Torch UI component.
 */
export class TorchButton {
    /**
     * Factory method for creating torch button.
     * 
     * @param html5Qrcode instace of {@code Html5Qrcode}.
     * @param onTorchActionFailureCallback callback to be called in case of
     *  torch action failure.
     * @returns Button for controlling torch.
     */
    public static create(
        html5Qrcode: Html5Qrcode,
        torchButtonOptions: TorchButtonOptions,
        onTorchActionFailureCallback: OnTorchActionFailureCallback)
        : TorchButton {
        let torchButton = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button", PublicUiElementIdAndClasses.TORCH_BUTTON_ID);

        let torchController = new TorchController(
            html5Qrcode,
            torchButton,
            onTorchActionFailureCallback);
        torchButton.innerText
            = Html5QrcodeScannerStrings.torchOnButton();
        torchButton.style.display = torchButtonOptions.display;
        torchButton.style.marginLeft = torchButtonOptions.marginLeft;

        torchButton.addEventListener("click", async (_) => {
            await torchController.flipState();
            if (torchController.isTorchEnabled()) {
                torchButton.classList.remove(
                    PublicUiElementIdAndClasses.TORCH_BUTTON_CLASS_TORCH_OFF);
                torchButton.classList.add(
                    PublicUiElementIdAndClasses.TORCH_BUTTON_CLASS_TORCH_ON);  
            } else {
                torchButton.classList.remove(
                    PublicUiElementIdAndClasses.TORCH_BUTTON_CLASS_TORCH_ON);
                torchButton.classList.add(
                    PublicUiElementIdAndClasses.TORCH_BUTTON_CLASS_TORCH_OFF);
            }
        });
        return new TorchButton(torchButton, torchController);
    }

    private readonly torchButton: HTMLButtonElement;
    private readonly torchController: TorchController;
    
    private constructor(
        torchButton: HTMLButtonElement, torchController: TorchController) {
        this.torchButton = torchButton;
        this.torchController = torchController;
    }

    /** Returns the torch button. */
    public getTorchButton(): HTMLButtonElement {
        return this.torchButton;
    }

    /**
     * Resets the state.
     * 
     * <p>Note: Doesn't turn off the torch implicitly.
     */
    public reset() {
        this.torchButton.innerText = Html5QrcodeScannerStrings.torchOnButton();
        this.torchController.reset();
    }
}

/** Util classes for torch related features. */
export class TorchUtils {
    /**
     * Returns {@code true} if torch is supported on the given device + browser
     * for the running camera (based on the input media track settings).
     * 
     * @param mediaTrackSettings settings for running video track.
     */
    public static isTorchSupported(mediaTrackSettings: MediaTrackSettings)
        : boolean {
        return "torch" in mediaTrackSettings;
    }
}
