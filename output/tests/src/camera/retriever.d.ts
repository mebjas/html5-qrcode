import { CameraDevice } from "./core";
export declare class CameraRetriever {
    static retrieve(): Promise<Array<CameraDevice>>;
    private static rejectWithError;
    private static isHttpsOrLocalhost;
    private static getCamerasFromMediaDevices;
    private static getCamerasFromMediaStreamTrack;
}
