/**
 * @fileoverview
 * Camera libraries. 
 * 
 * @author mebjas <minhazav@gmail.com>
 */

/**
 * Util class around camera management.
 * 
 * TODO(mebjas): Migrate camera specific code / logic to this class / library.
 */
export class CameraManager {

  /**
   * Returns {@code true} if the web page already has access to user camera 
   * permissions.
   */
  public static hasCameraPermissions(): Promise<boolean> {
    // TODO(mebjas): Use Permissions Query API, once support is widespread.
    // https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query

    return new Promise((resolve, _) => {
      // Note: If permissions are not granted, this can retrigger camera
      // permission dialog.
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices.forEach((device) => {
          // Hacky way to check if camera permissions are granted. Device
          // labels are only set in case user has granted permissions.
          if(device.kind === "videoinput" && device.label) {
            resolve(true);
          }
        });
        resolve(false);
      });
    });
  }
}
