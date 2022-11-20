/**
 * @fileoverview
 * Set of factory implementations around Camera.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

import { Camera } from "./core";
import { CameraImpl } from "./core-impl";

/** Factory class for creating Camera. */
export class CameraFactory {

    /**
     * Returns {@link CameraFactory} if {@link navigator.mediaDevices} is
     * supported else fails.
     */
    public static async failIfNotSupported(): Promise<CameraFactory> {
        if (!navigator.mediaDevices) {
            throw "navigator.mediaDevices not supported";
        }

        return new CameraFactory();
    }

    private constructor() { /* No Op. */ }

    /** Creates camera instance based on constraints. */
    public async create(videoConstraints: MediaTrackConstraints)
        : Promise<Camera> {
        return CameraImpl.create(videoConstraints);
    }
}
