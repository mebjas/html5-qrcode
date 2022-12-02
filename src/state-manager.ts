/**
 * @fileoverview
 * State handler.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

/** Different states of scanner */
export enum Html5QrcodeScannerState {
    // Invalid internal state, do not set to this state.
    UNKNOWN = 0,
    // Indicates the scanning is not running or user is using file based
    // scanning.
    NOT_STARTED = 1,
    // Camera scan is running.
    SCANNING,
    // Camera scan is paused but camera is running.
    PAUSED,
}

/** Transaction for state transition. */
export interface StateManagerTransaction {
    /**
     * Executes the current transaction.
     */
    execute(): void;

    /**
     * Cancels the current transaction.
     */
    cancel(): void;
}

/** Manager class for states. */
export interface StateManager {
    /**
     * Start a transition to a new state. No other transitions will be allowed
     * till this one is executed.
     * 
     * @param newState new state to transition to.
     * 
     * @returns transaction of type {@interface StateManagerTransaction}.
     * 
     * @throws error if the new state is not a valid transition from current
     * state.
     */
    startTransition(newState: Html5QrcodeScannerState): StateManagerTransaction;

    /**
     * Directly execute a transition.
     * 
     * @param newState new state to transition to.
     * 
     * @throws error if the new state is not a valid transition from current
     * state.
     */
    directTransition(newState: Html5QrcodeScannerState): void;

    /**
     * Get current state.
     */
    getState(): Html5QrcodeScannerState;
}

/** 
 * Implementation of {@interface StateManager} and 
 * {@interface StateManagerTransaction}.
 */
class StateManagerImpl implements StateManager, StateManagerTransaction {

    private state: Html5QrcodeScannerState = Html5QrcodeScannerState.NOT_STARTED;

    private onGoingTransactionNewState: Html5QrcodeScannerState
        = Html5QrcodeScannerState.UNKNOWN;

    public directTransition(newState: Html5QrcodeScannerState) {
        this.failIfTransitionOngoing();
        this.validateTransition(newState);
        this.state = newState;
    }

    public startTransition(newState: Html5QrcodeScannerState): StateManagerTransaction {
        this.failIfTransitionOngoing();
        this.validateTransition(newState);

        this.onGoingTransactionNewState = newState;
        return this;
    }

    public execute() {
        if (this.onGoingTransactionNewState 
                === Html5QrcodeScannerState.UNKNOWN) {
            throw "Transaction is already cancelled, cannot execute().";
        }

        const tempNewState = this.onGoingTransactionNewState;
        this.onGoingTransactionNewState = Html5QrcodeScannerState.UNKNOWN;
        this.directTransition(tempNewState);        
    }

    public cancel() {
        if (this.onGoingTransactionNewState 
                === Html5QrcodeScannerState.UNKNOWN) {
            throw "Transaction is already cancelled, cannot cancel().";
        }

        this.onGoingTransactionNewState = Html5QrcodeScannerState.UNKNOWN;
    }

    public getState(): Html5QrcodeScannerState {
        return this.state;
    }

    //#region private methods
    private failIfTransitionOngoing() {
        if (this.onGoingTransactionNewState 
            !== Html5QrcodeScannerState.UNKNOWN) {
            throw "Cannot transition to a new state, already under transition"; 
         }
    }

    private validateTransition(newState: Html5QrcodeScannerState) {
        switch(this.state) {
            case Html5QrcodeScannerState.UNKNOWN:
                throw "Transition from unknown is not allowed";
            case Html5QrcodeScannerState.NOT_STARTED:
                this.failIfNewStateIs(newState, [Html5QrcodeScannerState.PAUSED]);
                break;
            case Html5QrcodeScannerState.SCANNING:
                // Both state transitions legal from here.
                break;
            case Html5QrcodeScannerState.PAUSED:
                // Both state transitions legal from here.
                break;
        }
    }

    private failIfNewStateIs(
        newState: Html5QrcodeScannerState,
        disallowedStatesToTransition: Array<Html5QrcodeScannerState>) {
        for (const disallowedState of disallowedStatesToTransition) {
            if (newState === disallowedState) {
                throw `Cannot transition from ${this.state} to ${newState}`;
            }
        }
    }
    //#endregion
}

export class StateManagerProxy {
    private stateManager: StateManager;

    constructor(stateManager: StateManager) {
        this.stateManager = stateManager;
    }

    startTransition(newState: Html5QrcodeScannerState): StateManagerTransaction {
        return this.stateManager.startTransition(newState);
    }

    directTransition(newState: Html5QrcodeScannerState) {
        this.stateManager.directTransition(newState);
    }

    getState(): Html5QrcodeScannerState {
        return this.stateManager.getState();
    }

    canScanFile(): boolean {
        return this.stateManager.getState() === Html5QrcodeScannerState.NOT_STARTED;
    }

    isScanning(): boolean {
        return this.stateManager.getState() !== Html5QrcodeScannerState.NOT_STARTED;
    }

    isStrictlyScanning(): boolean {
        return this.stateManager.getState() === Html5QrcodeScannerState.SCANNING;
    }

    isPaused(): boolean {
        return this.stateManager.getState() === Html5QrcodeScannerState.PAUSED;
    }
}

/**
 * Factory for creating instance of {@class StateManagerProxy}.
 */
 export class StateManagerFactory {
    public static create(): StateManagerProxy {
        return new StateManagerProxy(new StateManagerImpl());
    }
}
