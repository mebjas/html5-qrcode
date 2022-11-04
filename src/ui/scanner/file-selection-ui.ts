/**
 * @fileoverview
 * File for file selection UI handling.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import {Html5QrcodeScannerStrings} from "../../strings";
import {
    BaseUiElementFactory,
    PublicUiElementIdAndClasses
} from "./base";

/**
 * Interface for callback when a file is selected by user using the button.
 */
export type OnFileSelected = (file: File) => void;

/** UI class for file selection handling. */
export class FileSelectionUi {

    private readonly fileBasedScanRegion: HTMLDivElement;
    private readonly fileScanInput: HTMLInputElement;
    private readonly fileSelectionButton: HTMLButtonElement;

    /** Creates object and renders. */
    constructor(
        parentElement: HTMLDivElement,
        showOnRender: boolean,
        onFileSelected: OnFileSelected) {
        this.fileBasedScanRegion = document.createElement("div");
        this.fileBasedScanRegion.style.textAlign = "center";
        this.fileBasedScanRegion.style.display
            = showOnRender ? "block" : "none";
        parentElement.appendChild(this.fileBasedScanRegion);

        let fileScanLabel = document.createElement("label");
        fileScanLabel.setAttribute("for", this.getFileScanInputId());
        fileScanLabel.style.display = "inline-block";

        this.fileBasedScanRegion.appendChild(fileScanLabel);
        
        this.fileSelectionButton
            = BaseUiElementFactory.createElement<HTMLButtonElement>(
                "button",
                PublicUiElementIdAndClasses.FILE_SELECTION_BUTTON_ID);
        this.setInitialValueToButton();

        // Bind click events with the label element.
        this.fileSelectionButton.addEventListener("click", (_) => {
            fileScanLabel.click();
        });
        fileScanLabel.append(this.fileSelectionButton);

        this.fileScanInput
            = BaseUiElementFactory.createElement<HTMLInputElement>(
                "input", this.getFileScanInputId());
        this.fileScanInput.type = "file";
        this.fileScanInput.accept = "image/*";
        this.fileScanInput.style.display = "none";
        fileScanLabel.appendChild(this.fileScanInput);
        
        let $this = this;
        /*eslint complexity: ["error", 5]*/
        this.fileScanInput.addEventListener("change", (e: Event) => {
            if (e == null || e.target == null) {
                return;
            }
            let target: HTMLInputElement = e.target as HTMLInputElement;
            if (target.files && target.files.length === 0) {
                return;
            }
            let fileList: FileList = target.files!;
            const file: File = fileList[0];
            let fileName = file.name;
            $this.setImageNameToButton(fileName);

            onFileSelected(file);
        });
    }

    /** Hide the file selection UI. */
    public hide() {
        this.fileBasedScanRegion.style.display = "none";
        this.fileScanInput.disabled = true;
    }

    /** Show the file selection UI. */
    public show() {
        this.fileBasedScanRegion.style.display = "block";
        this.fileScanInput.disabled = false;
    }

    /** Returns {@code true} if UI container is displayed. */
    public isShowing(): boolean {
        return this.fileBasedScanRegion.style.display === "block";
    }

    /** Reset the file selection value */
    public resetValue() {
        this.fileScanInput.value = "";
        this.setInitialValueToButton();
    }

    private setImageNameToButton(imageFileName: string) {
        const MAX_CHARS = 20;
        if (imageFileName.length > MAX_CHARS) {
            // Strip first 8
            // Strip last 8
            // Add 4 dots
            let start8Chars = imageFileName.substring(0, 8);
            let length = imageFileName.length;
            let last8Chars = imageFileName.substring(length - 8, length);
            imageFileName = `${start8Chars}....${last8Chars}`;
        }

        let newText = Html5QrcodeScannerStrings.fileSelectionChooseAnother()
            + " - "
            + imageFileName;
        this.fileSelectionButton.innerText = newText;
    }

    private setInitialValueToButton() {
        let initialText = Html5QrcodeScannerStrings.fileSelectionChooseImage()
            + " - "
            + Html5QrcodeScannerStrings.fileSelectionNoImageSelected();
        this.fileSelectionButton.innerText = initialText;
    }

    private getFileScanInputId(): string {
        return "html5-qrcode-private-filescan-input";
    }

    /**
     * Creates a file selection UI and renders.
     * 
     * @param parentElement parent div element to render the UI to.
     * @param showOnRender if {@code true}, the UI will be shown upon render
     *  else hidden.
     * @param onFileSelected callback to be called when file selection changes.
     * 
     * @returns Instance of {@code FileSelectionUi}.
     */
    public static create(
        parentElement: HTMLDivElement,
        showOnRender: boolean,
        onFileSelected: OnFileSelected): FileSelectionUi {
        let button = new FileSelectionUi(
            parentElement, showOnRender, onFileSelected);
        return button;
    }
} 
