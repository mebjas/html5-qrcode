import { expect } from "chai";

import { BooleanCameraCapability } from "../../../src/camera/core";
import { TorchButton } from "../../../src/ui/scanner/torch-button";
import { PublicUiElementIdAndClasses } from "../../../src/ui/scanner/base";

/** Fake implementation of {@link BooleanCameraCapability}. */
class FakeTorchCapability implements BooleanCameraCapability {
    private capabilityValue: boolean;

    constructor(value: boolean) {
        this.capabilityValue = value;
    }
    
    apply(value: boolean): Promise<void> {
        this.capabilityValue = value;
        return Promise.resolve();
    }

    value(): boolean | null {
        return this.capabilityValue;
    }

    isSupported(): boolean {
        return true;
    }
}

describe("TorchButton#create()", () => {
    let parentElement: HTMLDivElement | undefined;
    let torchCapability: FakeTorchCapability | undefined;
    let noOpFailureCallback: (_: string) => { /* no op. */ };
    let options = { display: "inline-block", marginLeft: "10px" };

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
        torchCapability = new FakeTorchCapability(true);
    });

    after(() => {
        document.body.removeChild(parentElement!);
        parentElement = undefined;
        torchCapability = undefined;
    });

    it("create() creates instance", () => {
        let button = TorchButton.create(
            parentElement!, torchCapability!, options, noOpFailureCallback);

        let torchButton = document.getElementById(
            PublicUiElementIdAndClasses.TORCH_BUTTON_ID);

        expect(torchButton).to.be.instanceOf(HTMLButtonElement);
    });

    it("create() creates instance, getTorchButton() returns button.", () => {
        let button = TorchButton.create(
            parentElement!, torchCapability!, options, noOpFailureCallback);
        let torchButton = button.getTorchButton();

        expect(torchButton).to.be.instanceOf(HTMLButtonElement);
    });

    it("show() & hide() works.", () => {
        let button = TorchButton.create(
            parentElement!, torchCapability!, options, noOpFailureCallback);
        let torchButton = button.getTorchButton();
        expect(torchButton.style.display).eq("inline-block");

        button.hide();
        expect(torchButton.style.display).eq("none");

        button.show();
        expect(torchButton.style.display).eq("inline-block");
    });

    it("created with hidden torchButtonOptions, button is hidden.", () => {
        let options = { display: "none", marginLeft: "10px" };
        let button = TorchButton.create(
            parentElement!, torchCapability!, options, noOpFailureCallback);
        let torchButton = button.getTorchButton();

        expect(torchButton.style.display).eq("none");
    });

    it("disable() & enable() works.", () => {
        let button = TorchButton.create(
            parentElement!, torchCapability!, options, noOpFailureCallback);
        let torchButton = button.getTorchButton();

        button.disable();
        expect(torchButton.disabled).to.be.true;

        button.enable();
        expect(torchButton.disabled).to.be.false;
    });

    it("setText() sets the text.", () => {
        let text = "custom text";
        let button = TorchButton.create(
            parentElement!, torchCapability!, options, noOpFailureCallback);

        button.setText(text);
        
        let torchButton = button.getTorchButton();
        expect(torchButton.innerText).eq(text);
    });

    it("reset() resets the text.", () => {
        let text = "custom text";
        let button = TorchButton.create(
            parentElement!, torchCapability!, options, noOpFailureCallback);
        button.setText(text);

        button.reset();
        
        let torchButton = button.getTorchButton();
        expect(torchButton.innerText).not.eq(text);
    });
});
