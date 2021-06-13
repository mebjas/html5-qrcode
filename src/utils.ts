/**
 * @fileoverview
 * Utils used by {@class Html5Qrcode} & {@class Html5QrcodeScanner}
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

import { Logger } from "./core";

/**
 * Utils around {@interface MediaTrackConstraints} for video.
 */
export class VideoConstraintsUtil {
    public static isMediaStreamConstraintsValid(
        videoConstraints: MediaTrackConstraints,
        logger: Logger): boolean {
        if (typeof videoConstraints !== "object") {
            const typeofVideoConstraints = typeof videoConstraints;
            logger.logError(
                "videoConstraints should be of type object, the "
                    + `object passed is of type ${typeofVideoConstraints}.`,
                /* experimental= */ true);
            return false;
        }
        // TODO(mebjas): Make this validity check more sophisticuated
        // Following keys are audio controls, audio controls are not supported.
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
                logger.logError(
                    `${key} is not supported videoConstaints.`,
                    /* experimental= */ true);
                return false;
            }
        }

        return true;
    }
}
