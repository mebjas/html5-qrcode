"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManagerFactory = exports.StateManagerProxy = exports.Html5QrcodeScannerState = void 0;
var Html5QrcodeScannerState;
(function (Html5QrcodeScannerState) {
    Html5QrcodeScannerState[Html5QrcodeScannerState["UNKNOWN"] = 0] = "UNKNOWN";
    Html5QrcodeScannerState[Html5QrcodeScannerState["NOT_STARTED"] = 1] = "NOT_STARTED";
    Html5QrcodeScannerState[Html5QrcodeScannerState["SCANNING"] = 2] = "SCANNING";
    Html5QrcodeScannerState[Html5QrcodeScannerState["PAUSED"] = 3] = "PAUSED";
})(Html5QrcodeScannerState || (exports.Html5QrcodeScannerState = Html5QrcodeScannerState = {}));
class StateManagerImpl {
    constructor() {
        this.state = Html5QrcodeScannerState.NOT_STARTED;
        this.onGoingTransactionNewState = Html5QrcodeScannerState.UNKNOWN;
    }
    directTransition(newState) {
        this.failIfTransitionOngoing();
        this.validateTransition(newState);
        this.state = newState;
    }
    startTransition(newState) {
        this.failIfTransitionOngoing();
        this.validateTransition(newState);
        this.onGoingTransactionNewState = newState;
        return this;
    }
    execute() {
        if (this.onGoingTransactionNewState
            === Html5QrcodeScannerState.UNKNOWN) {
            throw "Transaction is already cancelled, cannot execute().";
        }
        const tempNewState = this.onGoingTransactionNewState;
        this.onGoingTransactionNewState = Html5QrcodeScannerState.UNKNOWN;
        this.directTransition(tempNewState);
    }
    cancel() {
        if (this.onGoingTransactionNewState
            === Html5QrcodeScannerState.UNKNOWN) {
            throw "Transaction is already cancelled, cannot cancel().";
        }
        this.onGoingTransactionNewState = Html5QrcodeScannerState.UNKNOWN;
    }
    getState() {
        return this.state;
    }
    failIfTransitionOngoing() {
        if (this.onGoingTransactionNewState
            !== Html5QrcodeScannerState.UNKNOWN) {
            throw "Cannot transition to a new state, already under transition";
        }
    }
    validateTransition(newState) {
        switch (this.state) {
            case Html5QrcodeScannerState.UNKNOWN:
                throw "Transition from unknown is not allowed";
            case Html5QrcodeScannerState.NOT_STARTED:
                this.failIfNewStateIs(newState, [Html5QrcodeScannerState.PAUSED]);
                break;
            case Html5QrcodeScannerState.SCANNING:
                break;
            case Html5QrcodeScannerState.PAUSED:
                break;
        }
    }
    failIfNewStateIs(newState, disallowedStatesToTransition) {
        for (const disallowedState of disallowedStatesToTransition) {
            if (newState === disallowedState) {
                throw `Cannot transition from ${this.state} to ${newState}`;
            }
        }
    }
}
class StateManagerProxy {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }
    startTransition(newState) {
        return this.stateManager.startTransition(newState);
    }
    directTransition(newState) {
        this.stateManager.directTransition(newState);
    }
    getState() {
        return this.stateManager.getState();
    }
    canScanFile() {
        return this.stateManager.getState() === Html5QrcodeScannerState.NOT_STARTED;
    }
    isScanning() {
        return this.stateManager.getState() !== Html5QrcodeScannerState.NOT_STARTED;
    }
    isStrictlyScanning() {
        return this.stateManager.getState() === Html5QrcodeScannerState.SCANNING;
    }
    isPaused() {
        return this.stateManager.getState() === Html5QrcodeScannerState.PAUSED;
    }
}
exports.StateManagerProxy = StateManagerProxy;
class StateManagerFactory {
    static create() {
        return new StateManagerProxy(new StateManagerImpl());
    }
}
exports.StateManagerFactory = StateManagerFactory;
//# sourceMappingURL=state-manager.js.map