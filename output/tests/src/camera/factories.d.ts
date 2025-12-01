import { Camera } from "./core";
export declare class CameraFactory {
    static failIfNotSupported(): Promise<CameraFactory>;
    private constructor();
    create(videoConstraints: MediaTrackConstraints): Promise<Camera>;
}
