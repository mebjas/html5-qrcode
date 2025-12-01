"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const camera_zoom_ui_1 = require("../../../src/ui/scanner/camera-zoom-ui");
const base_1 = require("../../../src/ui/scanner/base");
describe("CameraZoomUi#create()", () => {
    let parentElement;
    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });
    after(() => {
        document.body.removeChild(parentElement);
        parentElement = undefined;
    });
    it("creates the button element", () => {
        let renderOnCreate = true;
        let unusedUi = camera_zoom_ui_1.CameraZoomUi.create(parentElement, renderOnCreate);
        let slider = document.getElementById(base_1.PublicUiElementIdAndClasses.ZOOM_SLIDER_ID);
        (0, chai_1.expect)(slider).to.be.instanceOf(HTMLInputElement);
    });
});
describe("CameraZoomUi#setValues()", () => {
    let parentElement;
    let renderOnCreate = true;
    let minValue = 1;
    let maxValue = 10;
    let defaultValue = 5;
    let step = 0.5;
    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });
    after(() => {
        document.body.removeChild(parentElement);
        parentElement = undefined;
    });
    it("setValues sets the val", () => {
        let cameraZoomUi = camera_zoom_ui_1.CameraZoomUi.create(parentElement, renderOnCreate);
        let slider = document.getElementById(base_1.PublicUiElementIdAndClasses.ZOOM_SLIDER_ID);
        (0, chai_1.expect)(slider.min).eq("1");
        (0, chai_1.expect)(slider.max).eq("5");
        (0, chai_1.expect)(slider.value).eq("1");
        (0, chai_1.expect)(slider.step).eq("0.1");
        let defaultValue = 5;
        cameraZoomUi.setValues(minValue, maxValue, defaultValue, step);
        (0, chai_1.expect)(slider.min).eq(minValue.toString());
        (0, chai_1.expect)(slider.max).eq(maxValue.toString());
        (0, chai_1.expect)(slider.value).eq(defaultValue.toString());
        (0, chai_1.expect)(slider.step).eq(step.toString());
    });
});
//# sourceMappingURL=camera-zoom-ui.test.js.map