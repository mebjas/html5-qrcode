"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistedDataManager = void 0;
class PersistedDataFactory {
    static createDefault() {
        return {
            hasPermission: false,
            lastUsedCameraId: null
        };
    }
}
class PersistedDataManager {
    constructor() {
        this.data = PersistedDataFactory.createDefault();
        let data = localStorage.getItem(PersistedDataManager.LOCAL_STORAGE_KEY);
        if (!data) {
            this.reset();
        }
        else {
            this.data = JSON.parse(data);
        }
    }
    hasCameraPermissions() {
        return this.data.hasPermission;
    }
    getLastUsedCameraId() {
        return this.data.lastUsedCameraId;
    }
    setHasPermission(hasPermission) {
        this.data.hasPermission = hasPermission;
        this.flush();
    }
    setLastUsedCameraId(lastUsedCameraId) {
        this.data.lastUsedCameraId = lastUsedCameraId;
        this.flush();
    }
    resetLastUsedCameraId() {
        this.data.lastUsedCameraId = null;
        this.flush();
    }
    reset() {
        this.data = PersistedDataFactory.createDefault();
        this.flush();
    }
    flush() {
        localStorage.setItem(PersistedDataManager.LOCAL_STORAGE_KEY, JSON.stringify(this.data));
    }
}
exports.PersistedDataManager = PersistedDataManager;
PersistedDataManager.LOCAL_STORAGE_KEY = "HTML5_QRCODE_DATA";
//# sourceMappingURL=storage.js.map