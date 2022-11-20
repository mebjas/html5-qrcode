/**
 * @fileoverview
 * Libraries associated with Camera Permissions.
 * 
 * @author mebjas <minhazav@gmail.com>
 */

/**
 * Permission management around Camera in javascript.
 * 
 * TODO(mebjas): Migrate camera specific code / logic to this class / library.
 */
 export class CameraPermissions {

    /**
     * Returns {@code true} if the web page already has access to user camera 
     * permissions.
     */
    public static async hasPermissions(): Promise<boolean> {
      // TODO(mebjas): Use Permissions Query API, once support is widespread.
      // https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query
  
      let devices = await navigator.mediaDevices.enumerateDevices();
      for (const device of devices) {
        // Hacky way to check if camera permissions are granted. Device
        // labels are only set in case user has granted permissions.
        if(device.kind === "videoinput" && device.label) {
          return true;
        }
      }
  
      return false;
    }
}
