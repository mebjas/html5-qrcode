/**
 * @fileoverview
 * File for camera zooming UI.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

 import {
    BaseUiElementFactory,
    PublicUiElementIdAndClasses
} from "./base";

import { Html5QrcodeScannerStrings } from "../../strings";

/** Callback when zoom value changes with the slider UI. */
export type OnCameraZoomValueChangeCallback = (zoomValue: number) => void;

/** Class for creating and managing zoom slider UI. */
export class CameraZoomUi {

    private zoomElementContainer: HTMLDivElement;
    private rangeInput: HTMLInputElement;
    private rangeText: HTMLSpanElement;

    private onChangeCallback: OnCameraZoomValueChangeCallback | null = null;

    private constructor() {
        this.zoomElementContainer = document.createElement("div");
        this.rangeInput = BaseUiElementFactory.createElement<HTMLInputElement>(
            "input", PublicUiElementIdAndClasses.ZOOM_SLIDER_ID);
        this.rangeInput.type = "range";

        this.rangeText = document.createElement("span");

        // default values.
        this.rangeInput.min = "1";
        this.rangeInput.max = "5";
        this.rangeInput.value = "1";
        this.rangeInput.step = "0.1";
    }

    private render(
        parentElement: HTMLElement,
        renderOnCreate: boolean) {
        // Style for the range slider.
        this.zoomElementContainer.style.display
            = renderOnCreate ? "block" : "none";
        this.zoomElementContainer.style.padding = "5px 10px";
        this.zoomElementContainer.style.textAlign = "center";
        parentElement.appendChild(this.zoomElementContainer);

        this.rangeInput.style.display = "inline-block";
        this.rangeInput.style.width = "50%";
        this.rangeInput.style.height = "5px";
        this.rangeInput.style.background = "#d3d3d3";
        this.rangeInput.style.outline = "none";
        this.rangeInput.style.opacity = "0.7";

        let zoomString = Html5QrcodeScannerStrings.zoom();
        this.rangeText.innerText = `${this.rangeInput.value}x ${zoomString}`;
        this.rangeText.style.marginRight = "10px";

        // Bind values.
        let $this = this;
        this.rangeInput.addEventListener("input", () => $this.onValueChange());
        this.rangeInput.addEventListener("change", () => $this.onValueChange());

        this.zoomElementContainer.appendChild(this.rangeInput);
        this.zoomElementContainer.appendChild(this.rangeText);
    }

    private onValueChange() {
        let zoomString = Html5QrcodeScannerStrings.zoom();
        this.rangeText.innerText = `${this.rangeInput.value}x ${zoomString}`;
        if (this.onChangeCallback) {
            this.onChangeCallback(parseFloat(this.rangeInput.value));
        }
    }

    //#region Public APIs
    public setValues(
        minValue: number,
        maxValue: number,
        defaultValue: number,
        step: number) {
        this.rangeInput.min = minValue.toString();
        this.rangeInput.max = maxValue.toString();
        this.rangeInput.step = step.toString();
        this.rangeInput.value = defaultValue.toString();

        this.onValueChange();
    }

    public show() {
        this.zoomElementContainer.style.display = "block";
    }

    public hide() {
        this.zoomElementContainer.style.display = "none";
    }

    public setOnCameraZoomValueChangeCallback(
        onChangeCallback: OnCameraZoomValueChangeCallback) {
        this.onChangeCallback = onChangeCallback;
    }

    public removeOnCameraZoomValueChangeCallback() {
        this.onChangeCallback = null;
    }
    //#endregion

    /**
     * Creates and renders the zoom slider if {@code renderOnCreate} is 
     * {@code true}.
     */
    public static create(
        parentElement: HTMLElement,
        renderOnCreate: boolean): CameraZoomUi {
        let cameraZoomUi = new CameraZoomUi();
        cameraZoomUi.render(parentElement, renderOnCreate);
        return cameraZoomUi;
    }
}
