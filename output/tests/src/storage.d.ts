export declare class PersistedDataManager {
    private data;
    private static LOCAL_STORAGE_KEY;
    constructor();
    hasCameraPermissions(): boolean;
    getLastUsedCameraId(): string | null;
    setHasPermission(hasPermission: boolean): void;
    setLastUsedCameraId(lastUsedCameraId: string): void;
    resetLastUsedCameraId(): void;
    reset(): void;
    private flush;
}
