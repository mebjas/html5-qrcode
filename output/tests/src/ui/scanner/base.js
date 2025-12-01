"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseUiElementFactory = exports.PublicUiElementIdAndClasses = void 0;
class PublicUiElementIdAndClasses {
}
exports.PublicUiElementIdAndClasses = PublicUiElementIdAndClasses;
PublicUiElementIdAndClasses.ALL_ELEMENT_CLASS = "html5-qrcode-element";
PublicUiElementIdAndClasses.CAMERA_PERMISSION_BUTTON_ID = "html5-qrcode-button-camera-permission";
PublicUiElementIdAndClasses.CAMERA_START_BUTTON_ID = "html5-qrcode-button-camera-start";
PublicUiElementIdAndClasses.CAMERA_STOP_BUTTON_ID = "html5-qrcode-button-camera-stop";
PublicUiElementIdAndClasses.TORCH_BUTTON_ID = "html5-qrcode-button-torch";
PublicUiElementIdAndClasses.CAMERA_SELECTION_SELECT_ID = "html5-qrcode-select-camera";
PublicUiElementIdAndClasses.FILE_SELECTION_BUTTON_ID = "html5-qrcode-button-file-selection";
PublicUiElementIdAndClasses.ZOOM_SLIDER_ID = "html5-qrcode-input-range-zoom";
PublicUiElementIdAndClasses.SCAN_TYPE_CHANGE_ANCHOR_ID = "html5-qrcode-anchor-scan-type-change";
PublicUiElementIdAndClasses.TORCH_BUTTON_CLASS_TORCH_ON = "html5-qrcode-button-torch-on";
PublicUiElementIdAndClasses.TORCH_BUTTON_CLASS_TORCH_OFF = "html5-qrcode-button-torch-off";
class BaseUiElementFactory {
    static createElement(elementType, elementId) {
        let element = (document.createElement(elementType));
        element.id = elementId;
        element.classList.add(PublicUiElementIdAndClasses.ALL_ELEMENT_CLASS);
        if (elementType === "button") {
            element.setAttribute("type", "button");
        }
        return element;
    }
}
exports.BaseUiElementFactory = BaseUiElementFactory;
//# sourceMappingURL=base.js.map