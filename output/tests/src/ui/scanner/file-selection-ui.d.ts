export type OnFileSelected = (file: File) => void;
export declare class FileSelectionUi {
    private readonly fileBasedScanRegion;
    private readonly fileScanInput;
    private readonly fileSelectionButton;
    private constructor();
    hide(): void;
    show(): void;
    isShowing(): boolean;
    resetValue(): void;
    private createFileBasedScanRegion;
    private fileBasedScanRegionDefaultBorder;
    private fileBasedScanRegionActiveBorder;
    private createDragAndDropMessage;
    private setImageNameToButton;
    private setInitialValueToButton;
    private getFileScanInputId;
    static create(parentElement: HTMLDivElement, showOnRender: boolean, onFileSelected: OnFileSelected): FileSelectionUi;
}
