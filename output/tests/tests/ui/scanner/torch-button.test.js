"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const torch_button_1 = require("../../../src/ui/scanner/torch-button");
const base_1 = require("../../../src/ui/scanner/base");
class FakeTorchCapability {
    constructor(value) {
        this.capabilityValue = value;
    }
    apply(value) {
        this.capabilityValue = value;
        return Promise.resolve();
    }
    value() {
        return this.capabilityValue;
    }
    isSupported() {
        return true;
    }
}
describe("TorchButton#create()", () => {
    let parentElement;
    let torchCapability;
    let noOpFailureCallback;
    let options = { display: "inline-block", marginLeft: "10px" };
    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
        torchCapability = new FakeTorchCapability(true);
    });
    after(() => {
        document.body.removeChild(parentElement);
        parentElement = undefined;
        torchCapability = undefined;
    });
    it("create() creates instance", () => {
        let button = torch_button_1.TorchButton.create(parentElement, torchCapability, options, noOpFailureCallback);
        let torchButton = document.getElementById(base_1.PublicUiElementIdAndClasses.TORCH_BUTTON_ID);
        (0, chai_1.expect)(torchButton).to.be.instanceOf(HTMLButtonElement);
    });
    it("create() creates instance, getTorchButton() returns button.", () => {
        let button = torch_button_1.TorchButton.create(parentElement, torchCapability, options, noOpFailureCallback);
        let torchButton = button.getTorchButton();
        (0, chai_1.expect)(torchButton).to.be.instanceOf(HTMLButtonElement);
    });
    it("show() & hide() works.", () => {
        let button = torch_button_1.TorchButton.create(parentElement, torchCapability, options, noOpFailureCallback);
        let torchButton = button.getTorchButton();
        (0, chai_1.expect)(torchButton.style.display).eq("inline-block");
        button.hide();
        (0, chai_1.expect)(torchButton.style.display).eq("none");
        button.show();
        (0, chai_1.expect)(torchButton.style.display).eq("inline-block");
    });
    it("created with hidden torchButtonOptions, button is hidden.", () => {
        let options = { display: "none", marginLeft: "10px" };
        let button = torch_button_1.TorchButton.create(parentElement, torchCapability, options, noOpFailureCallback);
        let torchButton = button.getTorchButton();
        (0, chai_1.expect)(torchButton.style.display).eq("none");
    });
    it("disable() & enable() works.", () => {
        let button = torch_button_1.TorchButton.create(parentElement, torchCapability, options, noOpFailureCallback);
        let torchButton = button.getTorchButton();
        button.disable();
        (0, chai_1.expect)(torchButton.disabled).to.be.true;
        button.enable();
        (0, chai_1.expect)(torchButton.disabled).to.be.false;
    });
    it("setText() sets the text.", () => {
        let text = "custom text";
        let button = torch_button_1.TorchButton.create(parentElement, torchCapability, options, noOpFailureCallback);
        button.setText(text);
        let torchButton = button.getTorchButton();
        (0, chai_1.expect)(torchButton.innerText).eq(text);
    });
    it("reset() resets the text.", () => {
        let text = "custom text";
        let button = torch_button_1.TorchButton.create(parentElement, torchCapability, options, noOpFailureCallback);
        button.setText(text);
        button.reset();
        let torchButton = button.getTorchButton();
        (0, chai_1.expect)(torchButton.innerText).not.eq(text);
    });
});
//# sourceMappingURL=torch-button.test.js.map