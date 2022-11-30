/**
 * @fileoverview
 * File for torch related UI components and handling.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import { BooleanCameraCapability } from "../../camera/core";
import { Html5QrcodeScannerStrings } from "../../strings";
import {
    BaseUiElementFactory,
    PublicUiElementIdAndClasses
} from "./base";

/**
 * Interface for callback that will be called in case of torch action failures.
 */
export type OnTorchActionFailureCallback = (failureMessage: string) => void;

/** Interface for controlling torch button. */
interface TorchButtonController {
    disable(): void;
    enable(): void;
    setText(text: string): void;
}

/** Controller class for handling torch / flash. */
class TorchController {
    private readonly torchCapability: BooleanCameraCapability;
    private readonly buttonController: TorchButtonController;
    private readonly onTorchActionFailureCallback: OnTorchActionFailureCallback;
    
    // Mutable states.
    private isTorchOn: boolean = false;

    constructor(
        torchCapability: BooleanCameraCapability,
        buttonController: TorchButtonController,
        onTorchActionFailureCallback: OnTorchActionFailureCallback) {
        this.torchCapability = torchCapability;
        this.buttonController = buttonController;
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
        this.buttonController.disable();
        let isTorchOnExpected = !this.isTorchOn;
        try {
            await this.torchCapability.apply(isTorchOnExpected);
            this.updateUiBasedOnLatestSettings(
                this.torchCapability.value()!, isTorchOnExpected);
        } catch (error) {
            this.propagateFailure(isTorchOnExpected, error);
            this.buttonController.enable();
        }
    }

    private updateUiBasedOnLatestSettings(
        isTorchOn: boolean,
        isTorchOnExpected: boolean) {
        if (isTorchOn === isTorchOnExpected) {
            // Action succeeded, flip the state.
            this.buttonController.setText(isTorchOnExpected
                    ? Html5QrcodeScannerStrings.torchOffButton()
                    : Html5QrcodeScannerStrings.torchOnButton());
            this.isTorchOn = isTorchOnExpected;
        } else {
            // Torch didn't get set as expected.
            // Show warning.
            this.propagateFailure(isTorchOnExpected);
        }
        this.buttonController.enable();
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

/** Helper class for creating Torch UI component. */
export class TorchButton implements TorchButtonController {
    private readonly torchButton: HTMLButtonElement;
    private readonly onTorchActionFailureCallback: OnTorchActionFailureCallback;

    private torchController: TorchController;
    
    private constructor(
        torchCapability: BooleanCameraCapability,
        onTorchActionFailureCallback: OnTorchActionFailureCallback) {
        this.onTorchActionFailureCallback = onTorchActionFailureCallback;
        this.torchButton
            = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button", PublicUiElementIdAndClasses.TORCH_BUTTON_ID);

        this.torchController = new TorchController(
            torchCapability,
            /* buttonController= */ this,
            onTorchActionFailureCallback);
    }

    private render(
        parentElement: HTMLElement, torchButtonOptions: TorchButtonOptions) {
        this.torchButton.innerText
            = Html5QrcodeScannerStrings.torchOnButton();
        this.torchButton.style.display = torchButtonOptions.display;
        this.torchButton.style.marginLeft = torchButtonOptions.marginLeft;

        let $this = this;
        this.torchButton.addEventListener("click", async (_) => {
            await $this.torchController.flipState();
            if ($this.torchController.isTorchEnabled()) {
                $this.torchButton.classList.remove(
                    PublicUiElementIdAndClasses.TORCH_BUTTON_CLASS_TORCH_OFF);
                $this.torchButton.classList.add(
                    PublicUiElementIdAndClasses.TORCH_BUTTON_CLASS_TORCH_ON);  
            } else {
                $this.torchButton.classList.remove(
                    PublicUiElementIdAndClasses.TORCH_BUTTON_CLASS_TORCH_ON);
                $this.torchButton.classList.add(
                    PublicUiElementIdAndClasses.TORCH_BUTTON_CLASS_TORCH_OFF);
            }
        });

        parentElement.appendChild(this.torchButton);
    }

    public updateTorchCapability(torchCapability: BooleanCameraCapability) {
        this.torchController = new TorchController(
            torchCapability,
            /* buttonController= */ this,
            this.onTorchActionFailureCallback);
    }

    /** Returns the torch button. */
    public getTorchButton(): HTMLButtonElement {
        return this.torchButton;
    }

    public hide() {
        this.torchButton.style.display = "none";
    }

    public show() {
        this.torchButton.style.display = "inline-block";
    }

    disable(): void {
        this.torchButton.disabled = true;
    }

    enable(): void {
        this.torchButton.disabled = false;
    }

    setText(text: string): void {
        this.torchButton.innerText = text;
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

    /**
     * Factory method for creating torch button.
     * 
     * @param parentElement parent HTML element to render torch button into
     * @param torchCapability torch capability of the camera
     * @param torchButtonOptions options for creating torch
     * @param onTorchActionFailureCallback callback to be called in case of
     *  torch action failure.
     */
     public static create(
        parentElement: HTMLElement,
        torchCapability: BooleanCameraCapability,
        torchButtonOptions: TorchButtonOptions,
        onTorchActionFailureCallback: OnTorchActionFailureCallback)
        : TorchButton {
        let button = new TorchButton(
            torchCapability, onTorchActionFailureCallback);
        button.render(parentElement, torchButtonOptions);
        return button;
    }
}
