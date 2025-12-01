"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraRetriever = void 0;
const strings_1 = require("../strings");
class CameraRetriever {
    static retrieve() {
        if (navigator.mediaDevices) {
            return CameraRetriever.getCamerasFromMediaDevices();
        }
        var mst = MediaStreamTrack;
        if (MediaStreamTrack && mst.getSources) {
            return CameraRetriever.getCamerasFromMediaStreamTrack();
        }
        return CameraRetriever.rejectWithError();
    }
    static rejectWithError() {
        let errorMessage = strings_1.Html5QrcodeStrings.unableToQuerySupportedDevices();
        if (!CameraRetriever.isHttpsOrLocalhost()) {
            errorMessage = strings_1.Html5QrcodeStrings.insecureContextCameraQueryError();
        }
        return Promise.reject(errorMessage);
    }
    static isHttpsOrLocalhost() {
        if (location.protocol === "https:") {
            return true;
        }
        const host = location.host.split(":")[0];
        return host === "127.0.0.1" || host === "localhost";
    }
    static getCamerasFromMediaDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            const closeActiveStreams = (stream) => {
                const tracks = stream.getVideoTracks();
                for (const track of tracks) {
                    track.enabled = false;
                    track.stop();
                    stream.removeTrack(track);
                }
            };
            let mediaStream = yield navigator.mediaDevices.getUserMedia({ audio: false, video: true });
            let devices = yield navigator.mediaDevices.enumerateDevices();
            let results = [];
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
        });
    }
    static getCamerasFromMediaStreamTrack() {
        return new Promise((resolve, _) => {
            const callback = (sourceInfos) => {
                const results = [];
                for (const sourceInfo of sourceInfos) {
                    if (sourceInfo.kind === "video") {
                        results.push({
                            id: sourceInfo.id,
                            label: sourceInfo.label
                        });
                    }
                }
                resolve(results);
            };
            var mst = MediaStreamTrack;
            mst.getSources(callback);
        });
    }
}
exports.CameraRetriever = CameraRetriever;
//# sourceMappingURL=retriever.js.map