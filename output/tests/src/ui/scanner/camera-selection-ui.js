"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraSelectionUi = void 0;
const base_1 = require("./base");
const strings_1 = require("../../strings");
class CameraSelectionUi {
    constructor(cameras) {
        this.selectElement = base_1.BaseUiElementFactory
            .createElement("select", base_1.PublicUiElementIdAndClasses.CAMERA_SELECTION_SELECT_ID);
        this.cameras = cameras;
        this.options = [];
    }
    render(parentElement) {
        const cameraSelectionContainer = document.createElement("span");
        cameraSelectionContainer.style.marginRight = "10px";
        const numCameras = this.cameras.length;
        if (numCameras === 0) {
            throw new Error("No cameras found");
        }
        if (numCameras === 1) {
            cameraSelectionContainer.style.display = "none";
        }
        else {
            const selectCameraString = strings_1.Html5QrcodeScannerStrings.selectCamera();
            cameraSelectionContainer.innerText
                = `${selectCameraString} (${this.cameras.length})  `;
        }
        let anonymousCameraId = 1;
        for (const camera of this.cameras) {
            const value = camera.id;
            let name = camera.label == null ? value : camera.label;
            if (!name || name === "") {
                name = [
                    strings_1.Html5QrcodeScannerStrings.anonymousCameraPrefix(),
                    anonymousCameraId++
                ].join(" ");
            }
            const option = document.createElement("option");
            option.value = value;
            option.innerText = name;
            this.options.push(option);
            this.selectElement.appendChild(option);
        }
        cameraSelectionContainer.appendChild(this.selectElement);
        parentElement.appendChild(cameraSelectionContainer);
    }
    disable() {
        this.selectElement.disabled = true;
    }
    isDisabled() {
        return this.selectElement.disabled === true;
    }
    enable() {
        this.selectElement.disabled = false;
    }
    getValue() {
        return this.selectElement.value;
    }
    hasValue(value) {
        for (const option of this.options) {
            if (option.value === value) {
                return true;
            }
        }
        return false;
    }
    setValue(value) {
        if (!this.hasValue(value)) {
            throw new Error(`${value} is not present in the camera list.`);
        }
        this.selectElement.value = value;
    }
    hasSingleItem() {
        return this.cameras.length === 1;
    }
    numCameras() {
        return this.cameras.length;
    }
    static create(parentElement, cameras) {
        let cameraSelectUi = new CameraSelectionUi(cameras);
        cameraSelectUi.render(parentElement);
        return cameraSelectUi;
    }
}
exports.CameraSelectionUi = CameraSelectionUi;
//# sourceMappingURL=camera-selection-ui.js.map