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
    private constructor(
        parentElement: HTMLDivElement,
        showOnRender: boolean,
        onFileSelected: OnFileSelected) {
        this.fileBasedScanRegion = this.createFileBasedScanRegion();
        this.fileBasedScanRegion.style.display
            = showOnRender ? "block" : "none";
        parentElement.appendChild(this.fileBasedScanRegion);

        const fileScanLabel = document.createElement("label");
        fileScanLabel.setAttribute("for", this.getFileScanInputId());
        fileScanLabel.style.display = "inline-block";

        this.fileBasedScanRegion.appendChild(fileScanLabel);
        
        this.fileSelectionButton
            = BaseUiElementFactory.createElement<HTMLButtonElement>(
                "button",
                PublicUiElementIdAndClasses.FILE_SELECTION_BUTTON_ID);
        this.setInitialValueToButton();

        // Bind click events with the label element.
        this.fileSelectionButton.addEventListener("click", () => {
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
        
        /*eslint complexity: ["error", 5]*/
        this.fileScanInput.addEventListener("change", (e: Event) => {
            if (e == null || e.target == null) {
                return;
            }
            const target: HTMLInputElement = e.target as HTMLInputElement;
            if (!target.files || target.files.length === 0) {
                return;
            }
            const fileList = target.files;
            const file = fileList[0];
            const fileName = file.name;
            this.setImageNameToButton(fileName);

            onFileSelected(file);
        });

        // Render drag and drop label
        const dragAndDropMessage = this.createDragAndDropMessage();
        this.fileBasedScanRegion.appendChild(dragAndDropMessage);

        this.fileBasedScanRegion.addEventListener("dragenter", (event) => {
            this.fileBasedScanRegion.style.border
                = this.fileBasedScanRegionActiveBorder();

            event.stopPropagation();
            event.preventDefault();
        });

        this.fileBasedScanRegion.addEventListener("dragleave", (event) => {
            this.fileBasedScanRegion.style.border
                = this.fileBasedScanRegionDefaultBorder();

            event.stopPropagation();
            event.preventDefault();
        });

        this.fileBasedScanRegion.addEventListener("dragover", (event) => {
            this.fileBasedScanRegion.style.border
                = this.fileBasedScanRegionActiveBorder();

            event.stopPropagation();
            event.preventDefault();
        });

        /*eslint complexity: ["error", 10]*/
        this.fileBasedScanRegion.addEventListener("drop", (event) => {
            event.stopPropagation();
            event.preventDefault();

            this.fileBasedScanRegion.style.border
                = this.fileBasedScanRegionDefaultBorder();

            const dataTransfer = event.dataTransfer;
            if (dataTransfer) {
                const files = dataTransfer.files;
                if (!files || files.length === 0) {
                    return;
                }
                let isAnyFileImage = false;
                for (let i = 0; i < files.length; ++i) {
                    const file = files.item(i);
                    if (!file) {
                        continue;
                    }
                    const imageType = /image.*/;

                    // Only process images.
                    if (!file.type.match(imageType)) {
                        continue;
                    }

                    isAnyFileImage = true;
                    const fileName = file.name;
                    this.setImageNameToButton(fileName);

                    onFileSelected(file);
                    dragAndDropMessage.innerText
                        = Html5QrcodeScannerStrings.dragAndDropMessage();
                    break;
                }
                
                // None of the files were images.
                if (!isAnyFileImage) {
                    dragAndDropMessage.innerText
                        = Html5QrcodeScannerStrings
                            .dragAndDropMessageOnlyImages();
                }
            }

        });
    }

    //#region Public APIs.
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
    //#endregion

    //#region private APIs
    private createFileBasedScanRegion(): HTMLDivElement {
        const fileBasedScanRegion = document.createElement("div");
        fileBasedScanRegion.style.textAlign = "center";
        fileBasedScanRegion.style.margin = "auto";
        fileBasedScanRegion.style.width = "80%";
        fileBasedScanRegion.style.maxWidth = "600px";
        fileBasedScanRegion.style.border
            = this.fileBasedScanRegionDefaultBorder();
        fileBasedScanRegion.style.padding = "10px";
        fileBasedScanRegion.style.marginBottom = "10px";
        return fileBasedScanRegion;
    }

    private fileBasedScanRegionDefaultBorder() {
        return "6px dashed #ebebeb";
    }

    /** Border when a file is being dragged over the file scan region. */
    private fileBasedScanRegionActiveBorder() {
        return "6px dashed rgb(153 151 151)";
    }

    private createDragAndDropMessage(): HTMLDivElement {
        const dragAndDropMessage = document.createElement("div");
        dragAndDropMessage.innerText
            = Html5QrcodeScannerStrings.dragAndDropMessage();
        dragAndDropMessage.style.fontWeight = "400";
        return dragAndDropMessage;
    }

    private setImageNameToButton(imageFileName: string) {
        const MAX_CHARS = 20;
        if (imageFileName.length > MAX_CHARS) {
            // Strip first 8
            // Strip last 8
            // Add 4 dots
            const start8Chars = imageFileName.substring(0, 8);
            const length = imageFileName.length;
            const last8Chars = imageFileName.substring(length - 8, length);
            imageFileName = `${start8Chars}....${last8Chars}`;
        }

        const newText = Html5QrcodeScannerStrings.fileSelectionChooseAnother()
            + " - "
            + imageFileName;
        this.fileSelectionButton.innerText = newText;
    }

    private setInitialValueToButton() {
        const initialText = Html5QrcodeScannerStrings.fileSelectionChooseImage()
            + " - "
            + Html5QrcodeScannerStrings.fileSelectionNoImageSelected();
        this.fileSelectionButton.innerText = initialText;
    }

    private getFileScanInputId(): string {
        return "html5-qrcode-private-filescan-input";
    }
    //#endregion

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
        const button = new FileSelectionUi(
            parentElement, showOnRender, onFileSelected);
        return button;
    }
} 
