"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraZoomUi = void 0;
const base_1 = require("./base");
const strings_1 = require("../../strings");
class CameraZoomUi {
    constructor() {
        this.onChangeCallback = null;
        this.zoomElementContainer = document.createElement("div");
        this.rangeInput = base_1.BaseUiElementFactory.createElement("input", base_1.PublicUiElementIdAndClasses.ZOOM_SLIDER_ID);
        this.rangeInput.type = "range";
        this.rangeText = document.createElement("span");
        this.rangeInput.min = "1";
        this.rangeInput.max = "5";
        this.rangeInput.value = "1";
        this.rangeInput.step = "0.1";
    }
    render(parentElement, renderOnCreate) {
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
        let zoomString = strings_1.Html5QrcodeScannerStrings.zoom();
        this.rangeText.innerText = `${this.rangeInput.value}x ${zoomString}`;
        this.rangeText.style.marginRight = "10px";
        let $this = this;
        this.rangeInput.addEventListener("input", () => $this.onValueChange());
        this.rangeInput.addEventListener("change", () => $this.onValueChange());
        this.zoomElementContainer.appendChild(this.rangeInput);
        this.zoomElementContainer.appendChild(this.rangeText);
    }
    onValueChange() {
        let zoomString = strings_1.Html5QrcodeScannerStrings.zoom();
        this.rangeText.innerText = `${this.rangeInput.value}x ${zoomString}`;
        if (this.onChangeCallback) {
            this.onChangeCallback(parseFloat(this.rangeInput.value));
        }
    }
    setValues(minValue, maxValue, defaultValue, step) {
        this.rangeInput.min = minValue.toString();
        this.rangeInput.max = maxValue.toString();
        this.rangeInput.step = step.toString();
        this.rangeInput.value = defaultValue.toString();
        this.onValueChange();
    }
    show() {
        this.zoomElementContainer.style.display = "block";
    }
    hide() {
        this.zoomElementContainer.style.display = "none";
    }
    setOnCameraZoomValueChangeCallback(onChangeCallback) {
        this.onChangeCallback = onChangeCallback;
    }
    removeOnCameraZoomValueChangeCallback() {
        this.onChangeCallback = null;
    }
    static create(parentElement, renderOnCreate) {
        let cameraZoomUi = new CameraZoomUi();
        cameraZoomUi.render(parentElement, renderOnCreate);
        return cameraZoomUi;
    }
}
exports.CameraZoomUi = CameraZoomUi;
//# sourceMappingURL=camera-zoom-ui.js.map