export type OnCameraZoomValueChangeCallback = (zoomValue: number) => void;
export declare class CameraZoomUi {
    private zoomElementContainer;
    private rangeInput;
    private rangeText;
    private onChangeCallback;
    private constructor();
    private render;
    private onValueChange;
    setValues(minValue: number, maxValue: number, defaultValue: number, step: number): void;
    show(): void;
    hide(): void;
    setOnCameraZoomValueChangeCallback(onChangeCallback: OnCameraZoomValueChangeCallback): void;
    removeOnCameraZoomValueChangeCallback(): void;
    static create(parentElement: HTMLElement, renderOnCreate: boolean): CameraZoomUi;
}
