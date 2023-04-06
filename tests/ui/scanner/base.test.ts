import { expect } from "chai";

import { 
    PublicUiElementIdAndClasses,
    BaseUiElementFactory
} from "../../../src/ui/scanner/base";

describe("BaseUiElementFactory#createElement()", () => {

    it("Creates requested element - Button", () => {
        const button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button", "testId");
        expect(button).to.be.an.instanceOf(HTMLButtonElement);
    });

    it("Creates requested element - Select", () => {
        const select = BaseUiElementFactory.createElement<HTMLSelectElement>(
            "select", "testId");
        expect(select).to.be.an.instanceOf(HTMLSelectElement);
    });

    it("Creates element with expected ID", () => {
        const expectedId = "test-id";
        const button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button", expectedId);
        expect(button.id).eq(expectedId);
    });

    it("Creates element with common class", () => {
        const button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button", "test-id");
        const hasClass = button.classList.contains(
            PublicUiElementIdAndClasses.ALL_ELEMENT_CLASS);

        expect(hasClass).to.be.true;
    });

    it("Creates button element with button type attribute", () => {
        const button = BaseUiElementFactory.createElement<HTMLButtonElement>(
            "button", "test-id");
        const typeAttributeValue = button.getAttribute("type");

        expect(typeAttributeValue).eq("button");
    });

    it("Creates select element without type attribute", () => {
        const select = BaseUiElementFactory.createElement<HTMLSelectElement>(
            "select", "test-id");
        const typeAttributeValue = select.getAttribute("type");

        expect(typeAttributeValue).to.be.null;
    });
});
