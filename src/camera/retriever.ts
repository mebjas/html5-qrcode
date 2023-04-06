/**
 * @fileoverview
 * Libraries associated with retrieving cameras.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { CameraDevice } from "./core";
import { Html5QrcodeStrings } from "../strings";

/** Class for retrieving cameras on the device. */
export class CameraRetriever {

    /** Returns list of {@link CameraDevice} supported by the device. */
    public static retrieve(): Promise<Array<CameraDevice>> {
        if (navigator.mediaDevices) {
            return CameraRetriever.getCamerasFromMediaDevices();
        }
        
        // Using deprecated api to support really old browsers.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mst = <any>MediaStreamTrack;
        if (MediaStreamTrack && mst.getSources) {
            return CameraRetriever.getCamerasFromMediaStreamTrack();
        }

        return CameraRetriever.rejectWithError();
    }

    private static rejectWithError(): Promise<Array<CameraDevice>> {
        // This can potentially happen if the page is loaded without SSL.
        let errorMessage = Html5QrcodeStrings.unableToQuerySupportedDevices();
        if (!CameraRetriever.isHttpsOrLocalhost()) {
            errorMessage = Html5QrcodeStrings.insecureContextCameraQueryError();
        }
        return Promise.reject(errorMessage);
    }

    private static isHttpsOrLocalhost(): boolean {
        if (location.protocol === "https:") {
            return true;
        }
        const host = location.host.split(":")[0];
        return host === "127.0.0.1" || host === "localhost";
    }

    private static async getCamerasFromMediaDevices(): Promise<Array<CameraDevice>> {
        // Hacky approach to close any active stream if they are  active.
        const closeActiveStreams = (stream: MediaStream) => {
            const tracks = stream.getVideoTracks();
            for (const track of tracks) {
                track.enabled = false;
                track.stop();
                stream.removeTrack(track);
            }
        };
        // This should trigger the permission flow if required.
        const mediaStream = await navigator.mediaDevices.getUserMedia(
            { audio: false, video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const results: Array<CameraDevice> = [];
        for (const device of devices) {
            if (device.kind === "videoinput") {
                results.push({
                    id: device.deviceId,
                    label: device.label
                });
            }
        }
        closeActiveStreams(mediaStream);
        return results;
    }

    private static getCamerasFromMediaStreamTrack()
        : Promise<Array<CameraDevice>> {  
        return new Promise((resolve) => {
            const callback = (sourceInfos: Array<any>) => {
                const results: Array<CameraDevice> = [];
                for (const sourceInfo of sourceInfos) {
                    if (sourceInfo.kind === "video") {
                        results.push({
                            id: sourceInfo.id,
                            label: sourceInfo.label
                        });
                    }
                }
                resolve(results);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mst = <any>MediaStreamTrack;
            mst.getSources(callback);
        });
    }
}
