export declare class PublicUiElementIdAndClasses {
    static ALL_ELEMENT_CLASS: string;
    static CAMERA_PERMISSION_BUTTON_ID: string;
    static CAMERA_START_BUTTON_ID: string;
    static CAMERA_STOP_BUTTON_ID: string;
    static TORCH_BUTTON_ID: string;
    static CAMERA_SELECTION_SELECT_ID: string;
    static FILE_SELECTION_BUTTON_ID: string;
    static ZOOM_SLIDER_ID: string;
    static SCAN_TYPE_CHANGE_ANCHOR_ID: string;
    static TORCH_BUTTON_CLASS_TORCH_ON: string;
    static TORCH_BUTTON_CLASS_TORCH_OFF: string;
}
export declare class BaseUiElementFactory {
    static createElement<Type extends HTMLElement>(elementType: string, elementId: string): Type;
}
