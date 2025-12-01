"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const file_selection_ui_1 = require("../../../src/ui/scanner/file-selection-ui");
const base_1 = require("../../../src/ui/scanner/base");
describe("FileSelectionUi#constructor()", () => {
    let parentElement;
    let noOpFileSelected = (_) => { };
    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });
    after(() => {
        document.body.removeChild(parentElement);
        parentElement = undefined;
    });
    it("Have expected public elements", () => {
        let fileSelectionUi = file_selection_ui_1.FileSelectionUi.create(parentElement, false, noOpFileSelected);
        let fileButton = document.getElementById(base_1.PublicUiElementIdAndClasses.FILE_SELECTION_BUTTON_ID);
        (0, chai_1.expect)(fileButton).to.be.instanceOf(HTMLButtonElement);
    });
    it("Hidden if showOnRender is false", () => {
        let showOnRender = false;
        let fileSelectionUi = file_selection_ui_1.FileSelectionUi.create(parentElement, showOnRender, noOpFileSelected);
        (0, chai_1.expect)(fileSelectionUi.isShowing()).to.be.false;
    });
    it("Not Hidden if showOnRender is true", () => {
        let showOnRender = true;
        let fileSelectionUi = file_selection_ui_1.FileSelectionUi.create(parentElement, showOnRender, noOpFileSelected);
        (0, chai_1.expect)(fileSelectionUi.isShowing()).to.be.true;
    });
});
describe("FileSelectionUi#hide()", () => {
    let parentElement;
    let noOpFileSelected = (_) => { };
    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });
    after(() => {
        document.body.removeChild(parentElement);
        parentElement = undefined;
    });
    it("Hide the scan region, when showing earlier", () => {
        let showOnRender = true;
        let fileSelectionUi = file_selection_ui_1.FileSelectionUi.create(parentElement, showOnRender, noOpFileSelected);
        (0, chai_1.expect)(fileSelectionUi.isShowing()).to.be.true;
        fileSelectionUi.hide();
        (0, chai_1.expect)(fileSelectionUi.isShowing()).to.be.false;
    });
    it("Hide the scan region, when hidden earlier", () => {
        let showOnRender = false;
        let fileSelectionUi = file_selection_ui_1.FileSelectionUi.create(parentElement, showOnRender, noOpFileSelected);
        (0, chai_1.expect)(fileSelectionUi.isShowing()).to.be.false;
        fileSelectionUi.hide();
        (0, chai_1.expect)(fileSelectionUi.isShowing()).to.be.false;
    });
});
describe("FileSelectionUi#show()", () => {
    let parentElement;
    let noOpFileSelected = (_) => { };
    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });
    after(() => {
        document.body.removeChild(parentElement);
        parentElement = undefined;
    });
    it("Show the scan region, when not showing earlier", () => {
        let showOnRender = false;
        let fileSelectionUi = file_selection_ui_1.FileSelectionUi.create(parentElement, showOnRender, noOpFileSelected);
        (0, chai_1.expect)(fileSelectionUi.isShowing()).to.be.false;
        fileSelectionUi.show();
        (0, chai_1.expect)(fileSelectionUi.isShowing()).to.be.true;
    });
    it("Show the scan region, when showing earlier", () => {
        let showOnRender = true;
        let fileSelectionUi = file_selection_ui_1.FileSelectionUi.create(parentElement, showOnRender, noOpFileSelected);
        (0, chai_1.expect)(fileSelectionUi.isShowing()).to.be.true;
        fileSelectionUi.show();
        (0, chai_1.expect)(fileSelectionUi.isShowing()).to.be.true;
    });
});
//# sourceMappingURL=file-selection-ui.test.js.map