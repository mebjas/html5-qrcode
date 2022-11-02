/**
 * @fileoverview
 * Contains base classes for different UI elements used in the scanner.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

const ALL_ELEMENT_CLASS_NAME = "html5-qrcode-element";
const BUTTON_CLASS_NAME = "html5-qrcode-button";
const SELECT_CLASS_NAME = "html5-qrcode-select";
const OPTION_CLASS_NAME = "html5-qrcode-option";
const INPUT_FILE_CLASS_NAME = "html5-qrcode-input-file";
const ANCHOR_CLASS_NAME = "html5-qrcode-anchor";

export class BaseUiElementFactory {
    /**
     * Creates bare bone {@link HTMLButtonElement} to be used for all buttons.
     */
    public static createButton(): HTMLButtonElement {
        let button = document.createElement("button");
        button.classList.add(ALL_ELEMENT_CLASS_NAME);
        button.classList.add(BUTTON_CLASS_NAME);

        return button;
    }

    /**
     * Creates bare bone {@link HTMLOptionElement} element.
     */
     public static createSelect(): HTMLSelectElement {
        let select = document.createElement("select");
        select.classList.add(ALL_ELEMENT_CLASS_NAME);
        select.classList.add(SELECT_CLASS_NAME);

        return select;
    }

    /**
     * Creates bare bone {@link HTMLOptionElement} element.
     */
    public static createOption(): HTMLOptionElement {
        let option = document.createElement("option");
        option.classList.add(ALL_ELEMENT_CLASS_NAME);
        option.classList.add(OPTION_CLASS_NAME);

        return option;
    }


    /**
     * Creates bare bone {@link HTMLInputElement} element.
     */
    public static createInputFile(): HTMLInputElement {
        let inputFile = document.createElement("input");
        inputFile.type = "file";
        inputFile.classList.add(ALL_ELEMENT_CLASS_NAME);
        inputFile.classList.add(INPUT_FILE_CLASS_NAME);

        return inputFile;
    }

    /**
     * Creates bare bone {@link HTMLAnchorElement} element.
     */
    public static createAnchor(): HTMLAnchorElement {
        let anchor = document.createElement("a");
        anchor.type = "file";
        anchor.classList.add(ALL_ELEMENT_CLASS_NAME);
        anchor.classList.add(ANCHOR_CLASS_NAME);

        return anchor;
    }
}
