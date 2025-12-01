"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const base_1 = require("../../../src/ui/scanner/base");
describe("BaseUiElementFactory#createElement()", () => {
    it("Creates requested element - Button", () => {
        let button = base_1.BaseUiElementFactory.createElement("button", "testId");
        (0, chai_1.expect)(button).to.be.an.instanceOf(HTMLButtonElement);
    });
    it("Creates requested element - Select", () => {
        let select = base_1.BaseUiElementFactory.createElement("select", "testId");
        (0, chai_1.expect)(select).to.be.an.instanceOf(HTMLSelectElement);
    });
    it("Creates element with expected ID", () => {
        const expectedId = "test-id";
        let button = base_1.BaseUiElementFactory.createElement("button", expectedId);
        (0, chai_1.expect)(button.id).eq(expectedId);
    });
    it("Creates element with common class", () => {
        let button = base_1.BaseUiElementFactory.createElement("button", "test-id");
        let hasClass = button.classList.contains(base_1.PublicUiElementIdAndClasses.ALL_ELEMENT_CLASS);
        (0, chai_1.expect)(hasClass).to.be.true;
    });
    it("Creates button element with button type attribute", () => {
        let button = base_1.BaseUiElementFactory.createElement("button", "test-id");
        let typeAttributeValue = button.getAttribute("type");
        (0, chai_1.expect)(typeAttributeValue).eq("button");
    });
    it("Creates select element without type attribute", () => {
        let select = base_1.BaseUiElementFactory.createElement("select", "test-id");
        let typeAttributeValue = select.getAttribute("type");
        (0, chai_1.expect)(typeAttributeValue).to.be.null;
    });
});
//# sourceMappingURL=base.test.js.map