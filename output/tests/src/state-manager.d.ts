export declare enum Html5QrcodeScannerState {
    UNKNOWN = 0,
    NOT_STARTED = 1,
    SCANNING = 2,
    PAUSED = 3
}
export interface StateManagerTransaction {
    execute(): void;
    cancel(): void;
}
export interface StateManager {
    startTransition(newState: Html5QrcodeScannerState): StateManagerTransaction;
    directTransition(newState: Html5QrcodeScannerState): void;
    getState(): Html5QrcodeScannerState;
}
export declare class StateManagerProxy {
    private stateManager;
    constructor(stateManager: StateManager);
    startTransition(newState: Html5QrcodeScannerState): StateManagerTransaction;
    directTransition(newState: Html5QrcodeScannerState): void;
    getState(): Html5QrcodeScannerState;
    canScanFile(): boolean;
    isScanning(): boolean;
    isStrictlyScanning(): boolean;
    isPaused(): boolean;
}
export declare class StateManagerFactory {
    static create(): StateManagerProxy;
}
