"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const camera_selection_ui_1 = require("../../../src/ui/scanner/camera-selection-ui");
const base_1 = require("../../../src/ui/scanner/base");
function createCameraList(count) {
    let cameras = [];
    for (let i = 0; i < count; ++i) {
        cameras.push({ id: `camera-${i}`, label: `camera-${i}-label` });
    }
    return cameras;
}
describe("CameraSelectionUi#create()", () => {
    let parentElement;
    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });
    after(() => {
        document.body.removeChild(parentElement);
        parentElement.innerHTML = "";
        parentElement = undefined;
    });
    it("Multiple cameras, creates the camera selection", () => {
        let numCameras = 3;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = camera_selection_ui_1.CameraSelectionUi.create(parentElement, cameras);
        let selection = document.getElementById(base_1.PublicUiElementIdAndClasses.CAMERA_SELECTION_SELECT_ID);
        (0, chai_1.expect)(selection).to.be.instanceOf(HTMLSelectElement);
        (0, chai_1.expect)(cameraSelectUi.numCameras()).eq(numCameras);
        (0, chai_1.expect)(cameraSelectUi.hasSingleItem()).to.be.false;
    });
    it("Single cameras, creates the camera selection", () => {
        parentElement.innerHTML = "";
        let numCameras = 1;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = camera_selection_ui_1.CameraSelectionUi.create(parentElement, cameras);
        let selection = document.getElementById(base_1.PublicUiElementIdAndClasses.CAMERA_SELECTION_SELECT_ID);
        (0, chai_1.expect)(selection).to.be.instanceOf(HTMLSelectElement);
        (0, chai_1.expect)(cameraSelectUi.numCameras()).eq(numCameras);
        (0, chai_1.expect)(cameraSelectUi.hasSingleItem()).to.be.true;
    });
    it("No cameras, fails", () => {
        let numCameras = 0;
        let cameras = createCameraList(numCameras);
        (0, chai_1.expect)(() => {
            let _ = camera_selection_ui_1.CameraSelectionUi.create(parentElement, cameras);
        }).to.throw();
    });
});
describe("CameraSelectionUi#enable() & disable()", () => {
    let parentElement;
    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });
    after(() => {
        document.body.removeChild(parentElement);
        parentElement.innerHTML = "";
        parentElement = undefined;
    });
    it("enable(), enables", () => {
        let numCameras = 3;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = camera_selection_ui_1.CameraSelectionUi.create(parentElement, cameras);
        cameraSelectUi.enable();
        (0, chai_1.expect)(cameraSelectUi.isDisabled()).to.be.false;
        cameraSelectUi.disable();
        cameraSelectUi.enable();
        (0, chai_1.expect)(cameraSelectUi.isDisabled()).to.be.false;
    });
    it("disable(), disables", () => {
        let numCameras = 3;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = camera_selection_ui_1.CameraSelectionUi.create(parentElement, cameras);
        cameraSelectUi.disable();
        (0, chai_1.expect)(cameraSelectUi.isDisabled()).to.be.true;
        cameraSelectUi.enable();
        cameraSelectUi.disable();
        (0, chai_1.expect)(cameraSelectUi.isDisabled()).to.be.true;
    });
});
describe("CameraSelectionUi setting and getting values", () => {
    let parentElement;
    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });
    after(() => {
        document.body.removeChild(parentElement);
        parentElement.innerHTML = "";
        parentElement = undefined;
    });
    it("setValue sets value if present else fails", () => {
        let numCameras = 3;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = camera_selection_ui_1.CameraSelectionUi.create(parentElement, cameras);
        (0, chai_1.expect)(cameraSelectUi.getValue()).eq(cameras[0].id);
        cameraSelectUi.setValue(cameras[1].id);
        (0, chai_1.expect)(cameraSelectUi.getValue()).eq(cameras[1].id);
        (0, chai_1.expect)(() => {
            cameraSelectUi.setValue("random string");
        }).to.throw;
    });
    it("hasValue() returns true for valid case else fails", () => {
        let numCameras = 3;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = camera_selection_ui_1.CameraSelectionUi.create(parentElement, cameras);
        (0, chai_1.expect)(cameraSelectUi.hasValue(cameras[1].id)).to.be.true;
        (0, chai_1.expect)(cameraSelectUi.hasValue("random string")).to.be.false;
    });
});
//# sourceMappingURL=camera-selection-ui.test.js.map