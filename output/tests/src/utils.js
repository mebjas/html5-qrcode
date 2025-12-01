"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoConstraintsUtil = void 0;
class VideoConstraintsUtil {
    static isMediaStreamConstraintsValid(videoConstraints, logger) {
        if (typeof videoConstraints !== "object") {
            const typeofVideoConstraints = typeof videoConstraints;
            logger.logError("videoConstraints should be of type object, the "
                + `object passed is of type ${typeofVideoConstraints}.`, true);
            return false;
        }
        const bannedKeys = [
            "autoGainControl",
            "channelCount",
            "echoCancellation",
            "latency",
            "noiseSuppression",
            "sampleRate",
            "sampleSize",
            "volume"
        ];
        const bannedkeysSet = new Set(bannedKeys);
        const keysInVideoConstraints = Object.keys(videoConstraints);
        for (const key of keysInVideoConstraints) {
            if (bannedkeysSet.has(key)) {
                logger.logError(`${key} is not supported videoConstaints.`, true);
                return false;
            }
        }
        return true;
    }
}
exports.VideoConstraintsUtil = VideoConstraintsUtil;
//# sourceMappingURL=utils.js.map