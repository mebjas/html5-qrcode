import { expect } from "chai";

import { 
    PublicUiElementIdAndClasses,
    BaseUiElementFactory
} from "../../../src/ui/scanner/base";

describe("BaseUiElementFactory#createElement()", () => {

    it("Creates requested element - Button", () => {
        let button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button", "testId");
        expect(button).to.be.an.instanceOf(HTMLButtonElement);
    });

    it("Creates requested element - Select", () => {
        let select = BaseUiElementFactory.createElement<HTMLSelectElement>(
            "select", "testId");
        expect(select).to.be.an.instanceOf(HTMLSelectElement);
    });

    it("Creates element with expected ID", () => {
        const expectedId = "test-id";
        let button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "select", expectedId);
        expect(button.id).eq(expectedId);
    });

    it("Creates element with common class", () => {
        let button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "select", "test-id");
        let hasClass = button.classList.contains(
            PublicUiElementIdAndClasses.ALL_ELEMENT_CLASS);

        expect(hasClass).to.be.true;
    });
});
