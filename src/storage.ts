/**
 * @fileoverview
 * Core storage related APIs.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

interface PersistedData {
    hasPermission: boolean;
    lastUsedCameraId: string | null;
}

class PersistedDataFactory {
    static createDefault(): PersistedData {
        return {
            hasPermission: false,
            lastUsedCameraId: null
        };
    }
}

export class PersistedDataManager {

    private data: PersistedData = PersistedDataFactory.createDefault();
    private static LOCAL_STORAGE_KEY: string = "HTML5_QRCODE_DATA";

    constructor() {
        let data = localStorage.getItem(PersistedDataManager.LOCAL_STORAGE_KEY);
        if (!data) {
            this.reset();
        } else {
            this.data = JSON.parse(data);
        }
    }

    public hasCameraPermissions(): boolean {
        return this.data.hasPermission;
    }

    public getLastUsedCameraId(): string | null {
        return this.data.lastUsedCameraId;
    }

    public setHasPermission(hasPermission: boolean) {
        this.data.hasPermission = hasPermission;
        this.flush();
    }

    public setLastUsedCameraId(lastUsedCameraId: string) {
        this.data.lastUsedCameraId = lastUsedCameraId;
        this.flush();
    }

    public resetLastUsedCameraId() {
        this.data.lastUsedCameraId = null;
        this.flush();
    }

    public reset() {
        this.data = PersistedDataFactory.createDefault();
        this.flush();
    }

    private flush(): void {
        localStorage.setItem(
            PersistedDataManager.LOCAL_STORAGE_KEY,
            JSON.stringify(this.data));
    }
}
