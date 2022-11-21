import { expect } from "chai";

import { CameraDevice } from "../../../src/camera/core";
import { CameraSelectionUi } from "../../../src/ui/scanner/camera-selection-ui";
import { PublicUiElementIdAndClasses } from "../../../src/ui/scanner/base";

function createCameraList(count: number): Array<CameraDevice> {
    let cameras: Array<CameraDevice> = [];
    for (let i = 0; i < count; ++i) {
        cameras.push({id: `camera-${i}`, label: `camera-${i}-label`});
    }
    return cameras;
}

describe("CameraSelectionUi#create()", () => {
    let parentElement: HTMLDivElement | undefined;

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });

    after(() => {
        document.body.removeChild(parentElement!);
        parentElement!.innerHTML = "";
        parentElement = undefined;
    });

    it("Multiple cameras, creates the camera selection", () => {
        let numCameras = 3;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = CameraSelectionUi.create(parentElement!, cameras);

        let selection = document.getElementById(
            PublicUiElementIdAndClasses.CAMERA_SELECTION_SELECT_ID);

        expect(selection).to.be.instanceOf(HTMLSelectElement);
        expect(cameraSelectUi.numCameras()).eq(numCameras);
        expect(cameraSelectUi.hasSingleItem()).to.be.false;
    });

    it("Single cameras, creates the camera selection", () => {
        parentElement!.innerHTML = "";
        let numCameras = 1;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = CameraSelectionUi.create(parentElement!, cameras);

        let selection = document.getElementById(
            PublicUiElementIdAndClasses.CAMERA_SELECTION_SELECT_ID);

        expect(selection).to.be.instanceOf(HTMLSelectElement);
        expect(cameraSelectUi.numCameras()).eq(numCameras);
        expect(cameraSelectUi.hasSingleItem()).to.be.true;
    });

    it("No cameras, fails", () => {
        let numCameras = 0;
        let cameras = createCameraList(numCameras);
        expect(() => {
            let _ = CameraSelectionUi.create(parentElement!, cameras);
        }).to.throw();   
    });
});

describe("CameraSelectionUi#enable() & disable()", () => {
    let parentElement: HTMLDivElement | undefined;

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });

    after(() => {
        document.body.removeChild(parentElement!);
        parentElement!.innerHTML = "";
        parentElement = undefined;
    });

    it("enable(), enables", () => {
        let numCameras = 3;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = CameraSelectionUi.create(parentElement!, cameras);

        cameraSelectUi.enable();
        expect(cameraSelectUi.isDisabled()).to.be.false;

        cameraSelectUi.disable();
        cameraSelectUi.enable();
        expect(cameraSelectUi.isDisabled()).to.be.false;
    });

    it("disable(), disables", () => {
        let numCameras = 3;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = CameraSelectionUi.create(parentElement!, cameras);

        cameraSelectUi.disable();
        expect(cameraSelectUi.isDisabled()).to.be.true;

        cameraSelectUi.enable();
        cameraSelectUi.disable();
        expect(cameraSelectUi.isDisabled()).to.be.true;
    });
});

describe("CameraSelectionUi setting and getting values", () => {
    let parentElement: HTMLDivElement | undefined;

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });

    after(() => {
        document.body.removeChild(parentElement!);
        parentElement!.innerHTML = "";
        parentElement = undefined;
    });

    it("setValue sets value if present else fails", () => {
        let numCameras = 3;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = CameraSelectionUi.create(parentElement!, cameras);

        // First camera is default.
        expect(cameraSelectUi.getValue()).eq(cameras[0].id);

        cameraSelectUi.setValue(cameras[1].id);
        expect(cameraSelectUi.getValue()).eq(cameras[1].id);

        expect(() => {
            cameraSelectUi.setValue("random string");
        }).to.throw;
    });

    it("hasValue() returns true for valid case else fails", () => {
        let numCameras = 3;
        let cameras = createCameraList(numCameras);
        let cameraSelectUi = CameraSelectionUi.create(parentElement!, cameras);

        expect(cameraSelectUi.hasValue(cameras[1].id)).to.be.true;
        expect(cameraSelectUi.hasValue("random string")).to.be.false;
    });
});
