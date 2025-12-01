import { BooleanCameraCapability } from "../../camera/core";
export type OnTorchActionFailureCallback = (failureMessage: string) => void;
interface TorchButtonController {
    disable(): void;
    enable(): void;
    setText(text: string): void;
}
export interface TorchButtonOptions {
    display: string;
    marginLeft: string;
}
export declare class TorchButton implements TorchButtonController {
    private readonly torchButton;
    private readonly onTorchActionFailureCallback;
    private torchController;
    private constructor();
    private render;
    updateTorchCapability(torchCapability: BooleanCameraCapability): void;
    getTorchButton(): HTMLButtonElement;
    hide(): void;
    show(): void;
    disable(): void;
    enable(): void;
    setText(text: string): void;
    reset(): void;
    static create(parentElement: HTMLElement, torchCapability: BooleanCameraCapability, torchButtonOptions: TorchButtonOptions, onTorchActionFailureCallback: OnTorchActionFailureCallback): TorchButton;
}
export {};
