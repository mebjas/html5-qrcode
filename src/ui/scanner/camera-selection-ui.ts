/**
 * @fileoverview
 * File for camera selection UI.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import { CameraDevice } from "../../camera/core";
import {
    BaseUiElementFactory,
    PublicUiElementIdAndClasses
} from "./base";
import {
    Html5QrcodeScannerStrings
} from "../../strings";

/** Class for rendering and handling camera selection UI. */
export class CameraSelectionUi {

    private readonly selectElement: HTMLSelectElement;
    private readonly options: Array<HTMLOptionElement>;

    private constructor(
        parentElement: HTMLElement,
        cameras: Array<CameraDevice>) {

        this.selectElement = BaseUiElementFactory
            .createElement<HTMLSelectElement>(
            "select", this.getCameraSelectionId());
        this.options = [];
        
        this.render(parentElement, cameras);
    }

    private render(
        parentElement: HTMLElement,
        cameras: Array<CameraDevice>) {
        const cameraSelectionContainer = document.createElement("span");
        cameraSelectionContainer.style.marginRight = "10px";
        const numCameras = cameras.length;
        if (numCameras === 1) {
            // If only one camera is found, don't show camera selection.
            cameraSelectionContainer.style.display = "none";
        } else {
            // Otherwise, show the number of cameras found as well.
            const selectCameraString = Html5QrcodeScannerStrings.selectCamera();
            cameraSelectionContainer.innerText
                = `${selectCameraString} (${cameras.length})  `;
        }

        let anonymousCameraId = 1;

        for (const camera of cameras) {
            const value = camera.id;
            let name = camera.label == null ? value : camera.label;
            // If no name is returned by the browser, replace it with custom
            // camera label with a count.
            if (!name || name === "") {
                name = [
                    Html5QrcodeScannerStrings.anonymousCameraPrefix(),
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

    private getCameraSelectionId(): string {
        return PublicUiElementIdAndClasses.CAMERA_SELECTION_SELECT_ID;
    }

    //#region Public APIs
    public disable() {
        this.selectElement.disabled = true;
    }

    public enable() {
        this.selectElement.disabled = false;
    }

    public getValue(): string {
        return this.selectElement.value;
    }

    public hasValue(value: string): boolean {
        for (const option of this.options) {
            if (option.value === value) {
                return true;
            }
        }
        return false;
    }

    public setValue(value: string) {
        this.selectElement.value = value;
    }

    public hasSingleItem() {
        return this.options.length === 1;
    }
    //#endregion

    /** Creates instance of {@link CameraSelectionUi} and renders it. */
    public static create(
        parentElement: HTMLElement,
        cameras: Array<CameraDevice>): CameraSelectionUi {
        return new CameraSelectionUi(parentElement, cameras);
    }
}
