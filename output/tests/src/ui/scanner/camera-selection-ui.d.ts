import { CameraDevice } from "../../camera/core";
export declare class CameraSelectionUi {
    private readonly selectElement;
    private readonly options;
    private readonly cameras;
    private constructor();
    private render;
    disable(): void;
    isDisabled(): boolean;
    enable(): void;
    getValue(): string;
    hasValue(value: string): boolean;
    setValue(value: string): void;
    hasSingleItem(): boolean;
    numCameras(): number;
    static create(parentElement: HTMLElement, cameras: Array<CameraDevice>): CameraSelectionUi;
}
