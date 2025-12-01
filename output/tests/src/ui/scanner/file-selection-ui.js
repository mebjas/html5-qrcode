"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSelectionUi = void 0;
const strings_1 = require("../../strings");
const base_1 = require("./base");
class FileSelectionUi {
    constructor(parentElement, showOnRender, onFileSelected) {
        this.fileBasedScanRegion = this.createFileBasedScanRegion();
        this.fileBasedScanRegion.style.display
            = showOnRender ? "block" : "none";
        parentElement.appendChild(this.fileBasedScanRegion);
        let fileScanLabel = document.createElement("label");
        fileScanLabel.setAttribute("for", this.getFileScanInputId());
        fileScanLabel.style.display = "inline-block";
        this.fileBasedScanRegion.appendChild(fileScanLabel);
        this.fileSelectionButton
            = base_1.BaseUiElementFactory.createElement("button", base_1.PublicUiElementIdAndClasses.FILE_SELECTION_BUTTON_ID);
        this.setInitialValueToButton();
        this.fileSelectionButton.addEventListener("click", (_) => {
            fileScanLabel.click();
        });
        fileScanLabel.append(this.fileSelectionButton);
        this.fileScanInput
            = base_1.BaseUiElementFactory.createElement("input", this.getFileScanInputId());
        this.fileScanInput.type = "file";
        this.fileScanInput.accept = "image/*";
        this.fileScanInput.style.display = "none";
        fileScanLabel.appendChild(this.fileScanInput);
        let $this = this;
        this.fileScanInput.addEventListener("change", (e) => {
            if (e == null || e.target == null) {
                return;
            }
            let target = e.target;
            if (target.files && target.files.length === 0) {
                return;
            }
            let fileList = target.files;
            const file = fileList[0];
            let fileName = file.name;
            $this.setImageNameToButton(fileName);
            onFileSelected(file);
        });
        let dragAndDropMessage = this.createDragAndDropMessage();
        this.fileBasedScanRegion.appendChild(dragAndDropMessage);
        this.fileBasedScanRegion.addEventListener("dragenter", function (event) {
            $this.fileBasedScanRegion.style.border
                = $this.fileBasedScanRegionActiveBorder();
            event.stopPropagation();
            event.preventDefault();
        });
        this.fileBasedScanRegion.addEventListener("dragleave", function (event) {
            $this.fileBasedScanRegion.style.border
                = $this.fileBasedScanRegionDefaultBorder();
            event.stopPropagation();
            event.preventDefault();
        });
        this.fileBasedScanRegion.addEventListener("dragover", function (event) {
            $this.fileBasedScanRegion.style.border
                = $this.fileBasedScanRegionActiveBorder();
            event.stopPropagation();
            event.preventDefault();
        });
        this.fileBasedScanRegion.addEventListener("drop", function (event) {
            event.stopPropagation();
            event.preventDefault();
            $this.fileBasedScanRegion.style.border
                = $this.fileBasedScanRegionDefaultBorder();
            var dataTransfer = event.dataTransfer;
            if (dataTransfer) {
                let files = dataTransfer.files;
                if (!files || files.length === 0) {
                    return;
                }
                let isAnyFileImage = false;
                for (let i = 0; i < files.length; ++i) {
                    let file = files.item(i);
                    if (!file) {
                        continue;
                    }
                    let imageType = /image.*/;
                    if (!file.type.match(imageType)) {
                        continue;
                    }
                    isAnyFileImage = true;
                    let fileName = file.name;
                    $this.setImageNameToButton(fileName);
                    onFileSelected(file);
                    dragAndDropMessage.innerText
                        = strings_1.Html5QrcodeScannerStrings.dragAndDropMessage();
                    break;
                }
                if (!isAnyFileImage) {
                    dragAndDropMessage.innerText
                        = strings_1.Html5QrcodeScannerStrings
                            .dragAndDropMessageOnlyImages();
                }
            }
        });
    }
    hide() {
        this.fileBasedScanRegion.style.display = "none";
        this.fileScanInput.disabled = true;
    }
    show() {
        this.fileBasedScanRegion.style.display = "block";
        this.fileScanInput.disabled = false;
    }
    isShowing() {
        return this.fileBasedScanRegion.style.display === "block";
    }
    resetValue() {
        this.fileScanInput.value = "";
        this.setInitialValueToButton();
    }
    createFileBasedScanRegion() {
        let fileBasedScanRegion = document.createElement("div");
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
    fileBasedScanRegionDefaultBorder() {
        return "6px dashed #ebebeb";
    }
    fileBasedScanRegionActiveBorder() {
        return "6px dashed rgb(153 151 151)";
    }
    createDragAndDropMessage() {
        let dragAndDropMessage = document.createElement("div");
        dragAndDropMessage.innerText
            = strings_1.Html5QrcodeScannerStrings.dragAndDropMessage();
        dragAndDropMessage.style.fontWeight = "400";
        return dragAndDropMessage;
    }
    setImageNameToButton(imageFileName) {
        const MAX_CHARS = 20;
        if (imageFileName.length > MAX_CHARS) {
            let start8Chars = imageFileName.substring(0, 8);
            let length = imageFileName.length;
            let last8Chars = imageFileName.substring(length - 8, length);
            imageFileName = `${start8Chars}....${last8Chars}`;
        }
        let newText = strings_1.Html5QrcodeScannerStrings.fileSelectionChooseAnother()
            + " - "
            + imageFileName;
        this.fileSelectionButton.innerText = newText;
    }
    setInitialValueToButton() {
        let initialText = strings_1.Html5QrcodeScannerStrings.fileSelectionChooseImage()
            + " - "
            + strings_1.Html5QrcodeScannerStrings.fileSelectionNoImageSelected();
        this.fileSelectionButton.innerText = initialText;
    }
    getFileScanInputId() {
        return "html5-qrcode-private-filescan-input";
    }
    static create(parentElement, showOnRender, onFileSelected) {
        let button = new FileSelectionUi(parentElement, showOnRender, onFileSelected);
        return button;
    }
}
exports.FileSelectionUi = FileSelectionUi;
//# sourceMappingURL=file-selection-ui.js.map