import { expect } from "chai";

import { 
    FileSelectionUi,
    OnFileSelected
} from "../../../src/ui/scanner/file-selection-ui";
import { PublicUiElementIdAndClasses } from "../../../src/ui/scanner/base";

describe("FileSelectionUi#constructor()", () => {

    let parentElement: HTMLDivElement | undefined;
    let noOpFileSelected: OnFileSelected = (_) => {};

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });

    after(() => {
        document.body.removeChild(parentElement!);
        parentElement = undefined;
    });

    it("Have expected public elements", () => {
        let fileSelectionUi = FileSelectionUi.create(
            parentElement!, /* showOnRender= */ false, noOpFileSelected);

        let fileButton = document.getElementById(
            PublicUiElementIdAndClasses.FILE_SELECTION_BUTTON_ID);

        expect(fileButton).to.be.instanceOf(HTMLButtonElement);
    });

    it("Hidden if showOnRender is false", () => {
        let showOnRender = false;
        let fileSelectionUi = FileSelectionUi.create(
            parentElement!, showOnRender, noOpFileSelected);

        expect(fileSelectionUi.isShowing()).to.be.false;
    });

    it("Not Hidden if showOnRender is true", () => {
        let showOnRender = true;
        let fileSelectionUi = FileSelectionUi.create(
            parentElement!, showOnRender, noOpFileSelected);

        expect(fileSelectionUi.isShowing()).to.be.true;
    });
});

describe("FileSelectionUi#hide()", () => {
    let parentElement: HTMLDivElement | undefined;
    let noOpFileSelected: OnFileSelected = (_) => {};

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });

    after(() => {
        document.body.removeChild(parentElement!);
        parentElement = undefined;
    });

    it("Hide the scan region, when showing earlier", () => {
        let showOnRender = true;
        let fileSelectionUi = FileSelectionUi.create(
            parentElement!,showOnRender, noOpFileSelected);
        
        expect(fileSelectionUi.isShowing()).to.be.true;

        // Act.
        fileSelectionUi.hide();

        expect(fileSelectionUi.isShowing()).to.be.false;
    });

    it("Hide the scan region, when hidden earlier", () => {
        let showOnRender = false;
        let fileSelectionUi = FileSelectionUi.create(
            parentElement!,showOnRender, noOpFileSelected);
        
        expect(fileSelectionUi.isShowing()).to.be.false;

        // Act.
        fileSelectionUi.hide();

        expect(fileSelectionUi.isShowing()).to.be.false;
    });
});

describe("FileSelectionUi#show()", () => {
    let parentElement: HTMLDivElement | undefined;
    let noOpFileSelected: OnFileSelected = (_) => {};

    before(() => {
        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    });

    after(() => {
        document.body.removeChild(parentElement!);
        parentElement = undefined;
    });

    it("Show the scan region, when not showing earlier", () => {
        let showOnRender = false;
        let fileSelectionUi = FileSelectionUi.create(
            parentElement!,showOnRender, noOpFileSelected);
        
        expect(fileSelectionUi.isShowing()).to.be.false;

        // Act.
        fileSelectionUi.show();

        expect(fileSelectionUi.isShowing()).to.be.true;
    });

    it("Show the scan region, when showing earlier", () => {
        let showOnRender = true;
        let fileSelectionUi = FileSelectionUi.create(
            parentElement!,showOnRender, noOpFileSelected);
        
        expect(fileSelectionUi.isShowing()).to.be.true;

        // Act.
        fileSelectionUi.show();

        expect(fileSelectionUi.isShowing()).to.be.true;
    });
});
