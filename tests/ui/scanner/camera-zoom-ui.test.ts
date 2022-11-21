import { expect } from "chai";

import { CameraZoomUi } from "../../../src/ui/scanner/camera-zoom-ui";
import { PublicUiElementIdAndClasses } from "../../../src/ui/scanner/base";

describe("CameraZoomUi#create()", () => {
    let parentElement: HTMLDivElement | undefined;

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });

    after(() => {
        document.body.removeChild(parentElement!);
        parentElement = undefined;
    });

    it("creates the button element", () => {
        let renderOnCreate = true;
        let unusedUi = CameraZoomUi.create(parentElement!, renderOnCreate);

        let slider = document.getElementById(
            PublicUiElementIdAndClasses.ZOOM_SLIDER_ID);

        expect(slider).to.be.instanceOf(HTMLInputElement);
    });
});

describe("CameraZoomUi#setValues()", () => {
    let parentElement: HTMLDivElement | undefined;
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
        document.body.removeChild(parentElement!);
        parentElement = undefined;
    });

    it("setValues sets the val", () => {
        let cameraZoomUi = CameraZoomUi.create(parentElement!, renderOnCreate);
        let slider = document.getElementById(
            PublicUiElementIdAndClasses.ZOOM_SLIDER_ID)! as HTMLInputElement;

        expect(slider.min).eq("1");
        expect(slider.max).eq("5");
        expect(slider.value).eq("1");
        expect(slider.step).eq("0.1");

        let defaultValue = 5;
        cameraZoomUi.setValues(minValue, maxValue, defaultValue, step);

        expect(slider.min).eq(minValue.toString());
        expect(slider.max).eq(maxValue.toString());
        expect(slider.value).eq(defaultValue.toString());
        expect(slider.step).eq(step.toString());
    });

    // TODO(minhazav): Test other public methods like show(), hide(),
    // setOnCameraZoomValueChangeCallback() and
    // removeOnCameraZoomValueChangeCallback().
});
