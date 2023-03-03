import { expect } from "chai";

import { CameraDevice } from "../../../src/camera/core";
import { CameraSelectionUi } from "../../../src/ui/scanner/camera-selection-ui";
import { PublicUiElementIdAndClasses } from "../../../src/ui/scanner/base";

function createCameraList(count: number): Array<CameraDevice> {
    const cameras: Array<CameraDevice> = [];
    for (let i = 0; i < count; ++i) {
        cameras.push({id: `camera-${i}`, label: `camera-${i}-label`});
    }
    return cameras;
}

describe("CameraSelectionUi#create()", () => {
    let parentElement: HTMLDivElement;

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });

    after(() => {
        document.body.removeChild(parentElement);
        parentElement.innerHTML = "";
    });

    it("Multiple cameras, creates the camera selection", () => {
        const numCameras = 3;
        const cameras = createCameraList(numCameras);
        const cameraSelectUi = CameraSelectionUi.create(parentElement, cameras);

        const selection = document.getElementById(
            PublicUiElementIdAndClasses.CAMERA_SELECTION_SELECT_ID);

        expect(selection).to.be.instanceOf(HTMLSelectElement);
        expect(cameraSelectUi.numCameras()).eq(numCameras);
        expect(cameraSelectUi.hasSingleItem()).to.be.false;
    });

    it("Single cameras, creates the camera selection", () => {
        parentElement.innerHTML = "";
        const numCameras = 1;
        const cameras = createCameraList(numCameras);
        const cameraSelectUi = CameraSelectionUi.create(parentElement, cameras);

        const selection = document.getElementById(
            PublicUiElementIdAndClasses.CAMERA_SELECTION_SELECT_ID);

        expect(selection).to.be.instanceOf(HTMLSelectElement);
        expect(cameraSelectUi.numCameras()).eq(numCameras);
        expect(cameraSelectUi.hasSingleItem()).to.be.true;
    });

    it("No cameras, fails", () => {
        const numCameras = 0;
        const cameras = createCameraList(numCameras);
        expect(() => {
            const _ = CameraSelectionUi.create(parentElement, cameras);
        }).to.throw();   
    });
});

describe("CameraSelectionUi#enable() & disable()", () => {
    let parentElement: HTMLDivElement;

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });

    after(() => {
        document.body.removeChild(parentElement);
        parentElement.innerHTML = "";
    });

    it("enable(), enables", () => {
        const numCameras = 3;
        const cameras = createCameraList(numCameras);
        const cameraSelectUi = CameraSelectionUi.create(parentElement, cameras);

        cameraSelectUi.enable();
        expect(cameraSelectUi.isDisabled()).to.be.false;

        cameraSelectUi.disable();
        cameraSelectUi.enable();
        expect(cameraSelectUi.isDisabled()).to.be.false;
    });

    it("disable(), disables", () => {
        const numCameras = 3;
        const cameras = createCameraList(numCameras);
        const cameraSelectUi = CameraSelectionUi.create(parentElement, cameras);

        cameraSelectUi.disable();
        expect(cameraSelectUi.isDisabled()).to.be.true;

        cameraSelectUi.enable();
        cameraSelectUi.disable();
        expect(cameraSelectUi.isDisabled()).to.be.true;
    });
});

describe("CameraSelectionUi setting and getting values", () => {
    let parentElement: HTMLDivElement;

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });

    after(() => {
        document.body.removeChild(parentElement);
        parentElement.innerHTML = "";
    });

    it("setValue sets value if present else fails", () => {
        const numCameras = 3;
        const cameras = createCameraList(numCameras);
        const cameraSelectUi = CameraSelectionUi.create(parentElement, cameras);

        // First camera is default.
        expect(cameraSelectUi.getValue()).eq(cameras[0].id);

        cameraSelectUi.setValue(cameras[1].id);
        expect(cameraSelectUi.getValue()).eq(cameras[1].id);

        expect(() => {
            cameraSelectUi.setValue("random string");
        }).to.throw;
    });

    it("hasValue() returns true for valid case else fails", () => {
        const numCameras = 3;
        const cameras = createCameraList(numCameras);
        const cameraSelectUi = CameraSelectionUi.create(parentElement, cameras);

        expect(cameraSelectUi.hasValue(cameras[1].id)).to.be.true;
        expect(cameraSelectUi.hasValue("random string")).to.be.false;
    });
});
