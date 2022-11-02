/**
 * @fileoverview
 * Complete Scanner build on top of {@link Html5Qrcode}.
 * - Decode QR Code using web cam or smartphone camera
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */
import {
    Html5QrcodeConstants,
    Html5QrcodeScanType,
    QrcodeSuccessCallback,
    QrcodeErrorCallback,
    Html5QrcodeResult,
    Html5QrcodeError,
    Html5QrcodeErrorFactory,
    CameraDevice,
    BaseLoggger,
    Logger,
    isNullOrUndefined,
} from "./core";

import {
    Html5Qrcode,
    Html5QrcodeConfigs,
    Html5QrcodeCameraScanConfig,
    Html5QrcodeFullConfig,
} from "./html5-qrcode";

import {
    Html5QrcodeScannerStrings,
} from "./strings";

import {
    ASSET_FILE_SCAN,
    ASSET_CAMERA_SCAN,
} from "./image-assets";

import {
    PersistedDataManager
} from "./storage";

import {
    LibraryInfoContainer
} from "./ui";

import {
  CameraManager
} from "./camera";

import { Html5QrcodeScannerState } from "./state-manager";

import { ScanTypeSelector } from "./ui/scanner/scan-type-selector";

import {
    TorchButton,
    TorchUtils
} from "./ui/scanner/torch-button";

import {
    BaseUiElementFactory
} from "./ui/scanner/base";

/**
 * Different states of QR Code Scanner.
 */
enum Html5QrcodeScannerStatus {
    STATUS_DEFAULT = 0,
    STATUS_SUCCESS = 1,
    STATUS_WARNING = 2,
    STATUS_REQUESTING_PERMISSION = 3,
}

/**
 * Interface for controlling different aspects of {@class Html5QrcodeScanner}.
 */
interface Html5QrcodeScannerConfig
    extends Html5QrcodeCameraScanConfig, Html5QrcodeConfigs {

    /**
     * If {@code true} the library will remember if the camera permissions
     * were previously granted and what camera was last used. If the permissions
     * is already granted for "camera", QR code scanning will automatically
     * start for previously used camera.
     * 
     * Note: default value is {@code true}.
     */
    rememberLastUsedCamera?: boolean | undefined;

    /**
     * Sets the desired scan types to be supported in the scanner.
     * 
     *  - Not setting a value will follow the default order supported by
     *      library.
     *  - First value would be used as the default value. Example:
     *    - [SCAN_TYPE_CAMERA, SCAN_TYPE_FILE]: Camera will be default type,
     *      user can switch to file based scan.
     *    - [SCAN_TYPE_FILE, SCAN_TYPE_CAMERA]: File based scan will be default
     *      type, user can switch to camera based scan.
     *  - Setting only value will disable option to switch to other. Example:
     *    - [SCAN_TYPE_CAMERA] - Only camera based scan supported.
     *    - [SCAN_TYPE_FILE] - Only file based scan supported.
     *  - Setting wrong values or multiple values will fail.
     */
    supportedScanTypes: Array<Html5QrcodeScanType> | [];

    /**
     * If {@code true} the rendered UI will have button to turn flash on or off
     * based on device + browser support.
     * 
     * Note: default value is {@code false}.
     */
    showTorchButtonIfSupported?: boolean | undefined;
}

function toHtml5QrcodeCameraScanConfig(config: Html5QrcodeScannerConfig)
    : Html5QrcodeCameraScanConfig {
    return {
        fps: config.fps,
        qrbox: config.qrbox,
        aspectRatio: config.aspectRatio,
        disableFlip: config.disableFlip,
        videoConstraints: config.videoConstraints
    };
}

function toHtml5QrcodeFullConfig(
    config: Html5QrcodeConfigs, verbose: boolean | undefined)
    : Html5QrcodeFullConfig {
    return {
        formatsToSupport: config.formatsToSupport,
        experimentalFeatures: config.experimentalFeatures,
        verbose: verbose
    };
}

export class Html5QrcodeScanner {

    //#region private fields
    private elementId: string;
    private config: Html5QrcodeScannerConfig;
    private verbose: boolean;
    private currentScanType: Html5QrcodeScanType;
    private sectionSwapAllowed: boolean;
    private persistedDataManager: PersistedDataManager;
    private scanTypeSelector: ScanTypeSelector;
    private logger: Logger;

    // Initally null fields.
    private html5Qrcode: Html5Qrcode | undefined;
    private qrCodeSuccessCallback: QrcodeSuccessCallback | undefined;
    private qrCodeErrorCallback: QrcodeErrorCallback | undefined;
    private lastMatchFound: string | null = null;
    private cameraScanImage: HTMLImageElement | null = null;
    private fileScanImage: HTMLImageElement | null = null;
    //#endregion

    /**
     * Creates instance of this class.
     *
     * @param elementId Id of the HTML element.
     * @param config Extra configurations to tune the code scanner.
     * @param verbose - If true, all logs would be printed to console. 
     */
    public constructor(
        elementId: string,
        config: Html5QrcodeScannerConfig | undefined,
        verbose: boolean | undefined) {
        this.elementId = elementId;
        this.config = this.createConfig(config);
        this.verbose = verbose === true;

        if (!document.getElementById(elementId)) {
            throw `HTML Element with id=${elementId} not found`;
        }

        this.scanTypeSelector = new ScanTypeSelector(
            this.config.supportedScanTypes);
        this.currentScanType = this.scanTypeSelector.getDefaultScanType();

        this.sectionSwapAllowed = true;
        this.logger = new BaseLoggger(this.verbose);

        this.persistedDataManager = new PersistedDataManager();
        if (config!.rememberLastUsedCamera !== true) {
            this.persistedDataManager.reset();
        }
    }

    /**
     * Renders the User Interface.
     * 
     * @param qrCodeSuccessCallback Callback called when an instance of a QR
     * code or any other supported bar code is found.
     * @param qrCodeErrorCallback optional, callback called in cases where no
     * instance of QR code or any other supported bar code is found.
     */
    public render(
        qrCodeSuccessCallback: QrcodeSuccessCallback,
        qrCodeErrorCallback: QrcodeErrorCallback | undefined) {
        this.lastMatchFound = null;

        // Add wrapper to success callback.
        this.qrCodeSuccessCallback
            = (decodedText: string, result: Html5QrcodeResult) => {
            if (qrCodeSuccessCallback) {
                qrCodeSuccessCallback(decodedText, result);
            } else {
                if (this.lastMatchFound === decodedText) {
                    return;
                }

                this.lastMatchFound = decodedText;
                this.setHeaderMessage(
                    Html5QrcodeScannerStrings.lastMatch(decodedText),
                    Html5QrcodeScannerStatus.STATUS_SUCCESS);
            }
        };

        // Add wrapper to failure callback
        this.qrCodeErrorCallback =
            (errorMessage: string, error: Html5QrcodeError) => {
            if (qrCodeErrorCallback) {
                qrCodeErrorCallback(errorMessage, error);
            }
        };

        const container = document.getElementById(this.elementId);
        if (!container) {
            throw `HTML Element with id=${this.elementId} not found`;
        }
        container.innerHTML = "";
        this.createBasicLayout(container!);
        this.html5Qrcode = new Html5Qrcode(
            this.getScanRegionId(),
            toHtml5QrcodeFullConfig(this.config, this.verbose));
    }

    //#region State related public APIs
    /**
     * Pauses the ongoing scan.
     * 
     * Notes:
     * -   Should only be called if camera scan is ongoing.
     * 
     * @param shouldPauseVideo (Optional, default = false) If {@code true}
     * the video will be paused.
     * 
     * @throws error if method is called when scanner is not in scanning state.
     */
    public pause(shouldPauseVideo?: boolean) {
        if (!this.html5Qrcode) {
            throw "Code scanner not initialized.";
        }

        if (isNullOrUndefined(shouldPauseVideo) || shouldPauseVideo !== true) {
            shouldPauseVideo = false;
        }

        this.html5Qrcode.pause(shouldPauseVideo);
    }
    
    /**
     * Resumes the paused scan.
     * 
     * If the video was previously paused by setting {@code shouldPauseVideo}
     * to {@code true} in {@link Html5QrcodeScanner#pause(shouldPauseVideo)},
     * calling this method will resume the video.
     * 
     * Notes:
     * -   Should only be called if camera scan is ongoing.
     * -   With this caller will start getting results in success and error
     * callbacks.
     * 
     * @throws error if method is called when scanner is not in paused state.
     */
    public resume() {
        if (!this.html5Qrcode) {
            throw "Code scanner not initialized.";
        }

        this.html5Qrcode.resume();
    }

    /**
     * Gets state of the camera scan.
     *
     * @returns state of type {@enum Html5QrcodeScannerState}.
     */
    public getState(): Html5QrcodeScannerState {
        if (!this.html5Qrcode) {
            throw "Code scanner not initialized.";
        }

        return this.html5Qrcode.getState();
    }

    /**
     * Removes the QR Code scanner UI.
     * 
     * @returns Promise which succeeds if the cleanup is complete successfully,
     *  fails otherwise.
     */
    public clear(): Promise<void> {
        const emptyHtmlContainer = () => {
            const mainContainer = document.getElementById(this.elementId);
            if (mainContainer) {
                mainContainer.innerHTML = "";
                this.resetBasicLayout(mainContainer);
            }
        }

        if (this.html5Qrcode) {
            return new Promise((resolve, reject) => {
                if (!this.html5Qrcode) {
                    resolve();
                    return;
                }
                if (this.html5Qrcode.isScanning) {
                    this.html5Qrcode.stop().then((_) => {
                        if (!this.html5Qrcode) {
                            resolve();
                            return;
                        }

                        this.html5Qrcode.clear();
                        emptyHtmlContainer();
                        resolve();
                    }).catch((error) => {
                        if (this.verbose) {
                            this.logger.logError(
                                "Unable to stop qrcode scanner", error);
                        }
                        reject(error);
                    });
                } else {
                    // Assuming file based scan was ongoing.
                    this.html5Qrcode.clear();
                    emptyHtmlContainer();
                }
            });
        }

        return Promise.resolve();
    }
    //#endregion

    //#region Beta APIs to modify running stream state.
    /**
     * Returns the capabilities of the running video track.
     * 
     * Read more: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getConstraints
     * 
     * Note: Should only be called if {@code Html5QrcodeScanner#getState()}
     *   returns {@code Html5QrcodeScannerState#SCANNING} or 
     *   {@code Html5QrcodeScannerState#PAUSED}.
     *
     * @returns the capabilities of a running video track.
     * @throws error if the scanning is not in running state.
     */
    public getRunningTrackCapabilities(): MediaTrackCapabilities {
        if (!this.html5Qrcode) {
            throw "Code scanner not initialized.";
        }

        return this.html5Qrcode.getRunningTrackCapabilities();
    }

    /**
     * Returns the object containing the current values of each constrainable
     * property of the running video track.
     * 
     * Read more: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getSettings
     * 
     * Note: Should only be called if {@code Html5QrcodeScanner#getState()}
     *   returns {@code Html5QrcodeScannerState#SCANNING} or 
     *   {@code Html5QrcodeScannerState#PAUSED}.
     *
     * @returns the supported settings of the running video track.
     * @throws error if the scanning is not in running state.
     */
    public getRunningTrackSettings(): MediaTrackSettings {
        if (!this.html5Qrcode) {
            throw "Code scanner not initialized.";
        }

        return this.html5Qrcode.getRunningTrackSettings();
    }

    /**
     * Apply a video constraints on running video track from camera.
     *
     * Note: Should only be called if {@code Html5QrcodeScanner#getState()}
     *   returns {@code Html5QrcodeScannerState#SCANNING} or 
     *   {@code Html5QrcodeScannerState#PAUSED}.
     *
     * @param {MediaTrackConstraints} specifies a variety of video or camera
     *  controls as defined in
     *  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * @returns a Promise which succeeds if the passed constraints are applied,
     *  fails otherwise.
     * @throws error if the scanning is not in running state.
     */
    public applyVideoConstraints(videoConstaints: MediaTrackConstraints)
        : Promise<void> {
        if (!this.html5Qrcode) {
            throw "Code scanner not initialized.";
        }

        return this.html5Qrcode.applyVideoConstraints(videoConstaints);
    }
    //#endregion

    //#region Private methods
    private createConfig(config: Html5QrcodeScannerConfig | undefined)
        : Html5QrcodeScannerConfig {
        if (config) {
            if (!config.fps) {
                config.fps = Html5QrcodeConstants.SCAN_DEFAULT_FPS;
            }

            if (config.rememberLastUsedCamera !== (
                !Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED)) {
                config.rememberLastUsedCamera
                    = Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED;
            }

            if (!config.supportedScanTypes) {
                config.supportedScanTypes
                    = Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE;
            }

            return config;
        }

        return {
            fps: Html5QrcodeConstants.SCAN_DEFAULT_FPS,
            rememberLastUsedCamera:
                Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED,
            supportedScanTypes:
                Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE
        };
    }

    private createBasicLayout(parent: HTMLElement) {
        parent.style.position = "relative";
        parent.style.padding = "0px";
        parent.style.border = "1px solid silver";
        this.createHeader(parent);

        const qrCodeScanRegion = document.createElement("div");
        const scanRegionId = this.getScanRegionId();
        qrCodeScanRegion.id = scanRegionId;
        qrCodeScanRegion.style.width = "100%";
        qrCodeScanRegion.style.minHeight = "100px";
        qrCodeScanRegion.style.textAlign = "center";
        parent.appendChild(qrCodeScanRegion);
        if (ScanTypeSelector.isCameraScanType(this.currentScanType)) {
            this.insertCameraScanImageToScanRegion();
        } else {
            this.insertFileScanImageToScanRegion();
        }

        const qrCodeDashboard = document.createElement("div");
        const dashboardId = this.getDashboardId();
        qrCodeDashboard.id = dashboardId;
        qrCodeDashboard.style.width = "100%";
        parent.appendChild(qrCodeDashboard);

        this.setupInitialDashboard(qrCodeDashboard);
    }

    private resetBasicLayout(mainContainer: HTMLElement) {
        mainContainer.style.border = "none";
    }

    private setupInitialDashboard(dashboard: HTMLElement) {
        const $this = this;
        this.createSection(dashboard);
        this.createSectionControlPanel();
        if (this.scanTypeSelector.hasMoreThanOneScanType()) {
            this.createSectionSwap();
        }
    }

    private createHeader(dashboard: HTMLElement) {
        const header = document.createElement("div");
        header.style.textAlign = "left";
        header.style.margin = "0px";
        dashboard.appendChild(header);

        let libraryInfo = new LibraryInfoContainer();
        libraryInfo.renderInto(header);

        const headerMessageContainer = document.createElement("div");
        headerMessageContainer.id = this.getHeaderMessageContainerId();
        headerMessageContainer.style.display = "none";
        headerMessageContainer.style.textAlign = "center";
        headerMessageContainer.style.fontSize = "14px";
        headerMessageContainer.style.padding = "2px 10px";
        headerMessageContainer.style.margin = "4px";
        headerMessageContainer.style.borderTop = "1px solid #f6f6f6";
        header.appendChild(headerMessageContainer);
    }

    private createSection(dashboard: HTMLElement) {
        const section = document.createElement("div");
        section.id = this.getDashboardSectionId();
        section.style.width = "100%";
        section.style.padding = "10px 0px 10px 0px";
        section.style.textAlign = "left";
        dashboard.appendChild(section);
    }

    private createCameraListUi(
        scpCameraScanRegion: HTMLDivElement,
        requestPermissionContainer: HTMLDivElement,
        requestPermissionButton?: HTMLButtonElement) {
        const $this = this;
        $this.setHeaderMessage(
            Html5QrcodeScannerStrings.cameraPermissionRequesting());

        const createPermissionButtonIfNotExists = () => {
            if (!requestPermissionButton) {
                $this.createPermissionButton(
                    scpCameraScanRegion, requestPermissionContainer);
            }
        }

        Html5Qrcode.getCameras().then((cameras) => {
            // By this point the user has granted camera permissions.
            $this.persistedDataManager.setHasPermission(
                /* hasPermission */ true);

            $this.resetHeaderMessage();
            if (cameras && cameras.length > 0) {
                scpCameraScanRegion.removeChild(requestPermissionContainer);
                $this.renderCameraSelection(cameras);
            } else {
                $this.setHeaderMessage(
                    Html5QrcodeScannerStrings.noCameraFound(),
                    Html5QrcodeScannerStatus.STATUS_WARNING);
                createPermissionButtonIfNotExists();
            }
        }).catch((error) => {
            $this.persistedDataManager.setHasPermission(
                /* hasPermission */ false);
            
            if (requestPermissionButton) {
                requestPermissionButton.disabled = false;
            } else {
                // Case when the permission button generation was skipped
                // likely due to persistedDataManager indicated permissions
                // exists.
                // This should ideally never happen, but if it so happened that
                // the camera retrieval failed, we want to create button this
                // time.
                createPermissionButtonIfNotExists();
            }
            $this.setHeaderMessage(
                error, Html5QrcodeScannerStatus.STATUS_WARNING);
        });
    }

    private createPermissionButton(
        scpCameraScanRegion: HTMLDivElement,
        requestPermissionContainer: HTMLDivElement) {
        const $this = this;
        const requestPermissionButton = BaseUiElementFactory.createButton();
        requestPermissionButton.id = this.getCameraPermissionButtonId();
        requestPermissionButton.innerText
            = Html5QrcodeScannerStrings.cameraPermissionTitle();

        requestPermissionButton.addEventListener("click", function () {
            requestPermissionButton.disabled = true;
            $this.createCameraListUi(
                scpCameraScanRegion,
                requestPermissionContainer,
                requestPermissionButton);
        });
        requestPermissionContainer.appendChild(requestPermissionButton);
    }

    private createPermissionsUi(
        scpCameraScanRegion: HTMLDivElement,
        requestPermissionContainer: HTMLDivElement) {
        const $this = this;

        // Only render last selected camera by default if the default scant type
        // is camera.
        if (ScanTypeSelector.isCameraScanType(this.currentScanType)
            && this.persistedDataManager.hasCameraPermissions()) {
            CameraManager.hasCameraPermissions().then(
                (hasPermissions: boolean) => {
                if (hasPermissions) {
                    $this.createCameraListUi(
                        scpCameraScanRegion, requestPermissionContainer);
                } else {
                    $this.persistedDataManager.setHasPermission(
                        /* hasPermission */ false);
                    $this.createPermissionButton(
                        scpCameraScanRegion, requestPermissionContainer);
                }
            }).catch((_: any) => {
                $this.persistedDataManager.setHasPermission(
                    /* hasPermission */ false);
                $this.createPermissionButton(
                    scpCameraScanRegion, requestPermissionContainer);
            });
            return;
        }

        this.createPermissionButton(
            scpCameraScanRegion, requestPermissionContainer);
    }

    private createSectionControlPanel() {
        const $this = this;
        const section = document.getElementById(this.getDashboardSectionId())!;
        const sectionControlPanel = document.createElement("div");
        section.appendChild(sectionControlPanel);
        const scpCameraScanRegion = document.createElement("div");
        scpCameraScanRegion.id = this.getDashboardSectionCameraScanRegionId();
        scpCameraScanRegion.style.display
            = ScanTypeSelector.isCameraScanType(this.currentScanType)
            ? "block" : "none";
        sectionControlPanel.appendChild(scpCameraScanRegion);

        // Web browsers require the users to grant explicit permissions before
        // giving camera access. We need to render a button to request user
        // permission.
        // Assuming when the object is created permission is needed.
        const requestPermissionContainer = document.createElement("div");
        requestPermissionContainer.style.textAlign = "center";
        scpCameraScanRegion.appendChild(requestPermissionContainer);

        // TODO(minhazav): If default scan type is file, the permission or
        // camera access shouldn't start unless user explicitly switches to
        // camera based scan. @priority: high.

        if (this.scanTypeSelector.isCameraScanRequired()) {
            this.createPermissionsUi(
                scpCameraScanRegion, requestPermissionContainer);
        }

        this.renderFileScanUi(sectionControlPanel);
    }

    // TODO: decouple the UI components for camera scan and file based scan to
    // independent UI classes.
    private renderFileScanUi(parent: HTMLDivElement) {
        const $this = this;
        const fileBasedScanRegion = document.createElement("div");
        fileBasedScanRegion.id = this.getDashboardSectionFileScanRegionId();
        fileBasedScanRegion.style.textAlign = "center";
        fileBasedScanRegion.style.display
            = ScanTypeSelector.isCameraScanType(this.currentScanType)
            ? "none" : "block";
        parent.appendChild(fileBasedScanRegion);

        const fileScanInput = BaseUiElementFactory.createInputFile();
        fileScanInput.id = this.getFileScanInputId();
        fileScanInput.accept = "image/*";
        fileScanInput.style.width = "200px";
        fileScanInput.disabled
            = ScanTypeSelector.isCameraScanType(this.currentScanType);
        const fileScanLabel = document.createElement("span");
        fileScanLabel.innerText = " Select Image";
        fileBasedScanRegion.appendChild(fileScanInput);
        fileBasedScanRegion.appendChild(fileScanLabel);
        fileScanInput.addEventListener("change", (e: any) => {
            if (!$this.html5Qrcode) {
                throw "html5Qrcode not defined";
            }

            if (e == null || e.target == null) {
                return;
            }
            if (!ScanTypeSelector.isFileScanType($this.currentScanType)) {
                return;
            }
            if (e.target.files.length === 0) {
                return;
            }
            const file = e.target.files[0];
            $this.html5Qrcode.scanFileV2(file, /* showImage= */ true)
                .then((html5qrcodeResult: Html5QrcodeResult) => {
                    $this.resetHeaderMessage();
                    $this.qrCodeSuccessCallback!(
                        html5qrcodeResult.decodedText,
                        html5qrcodeResult);
                })
                .catch((error) => {
                    $this.setHeaderMessage(
                        error, Html5QrcodeScannerStatus.STATUS_WARNING);
                    $this.qrCodeErrorCallback!(
                        error, Html5QrcodeErrorFactory.createFrom(error));
                });
        });
    }

    private renderCameraSelection(cameras: Array<CameraDevice>) {
        const $this = this;
        const scpCameraScanRegion = document.getElementById(
            this.getDashboardSectionCameraScanRegionId())!;
        scpCameraScanRegion.style.textAlign = "center";

        const cameraSelectionContainer = document.createElement("span");
        cameraSelectionContainer.style.marginRight = "10px";

        const numCameras = cameras.length;
        const cameraSelectionSelect = document.createElement("select");
        if (numCameras === 1) {
            // If only one camera is found, don't show camera selection.
            cameraSelectionSelect.style.display = "none";
        } else {
            // Otherwise, show the number of cameras found as well.
            const selectCameraString = Html5QrcodeScannerStrings.selectCamera();
            cameraSelectionContainer.innerText
                = `${selectCameraString} (${cameras.length})  `;
        }
        cameraSelectionSelect.id = this.getCameraSelectionId();
        const options = [];
        for (const camera of cameras) {
            const value = camera.id;
            const name = camera.label == null ? value : camera.label;
            const option = BaseUiElementFactory.createOption();
            option.value = value;
            option.innerText = name;
            options.push(option);
            cameraSelectionSelect.appendChild(option);
        }
        cameraSelectionContainer.appendChild(cameraSelectionSelect);
        scpCameraScanRegion.appendChild(cameraSelectionContainer);

        const cameraActionContainer = document.createElement("span");
        const cameraActionStartButton = BaseUiElementFactory.createButton();
        cameraActionStartButton.innerText
            = Html5QrcodeScannerStrings.scanButtonStartScanningText();
        cameraActionContainer.appendChild(cameraActionStartButton);

        const cameraActionStopButton = BaseUiElementFactory.createButton();
        cameraActionStopButton.innerText
            = Html5QrcodeScannerStrings.scanButtonStopScanningText();
        cameraActionStopButton.style.display = "none";
        cameraActionStopButton.disabled = true;
        cameraActionContainer.appendChild(cameraActionStopButton);

        // Optional torch button support.
        const torchButton = TorchButton.create(
            $this.html5Qrcode!,
            {display: "none", marginLeft: "5px"},
            // Callback in case of torch action failure.
            (errorMessage) => {
                $this.setHeaderMessage(
                    errorMessage,
                    Html5QrcodeScannerStatus.STATUS_WARNING);
            }
        );
        const cameraActionTorchButton = torchButton.getTorchButton();
        cameraActionContainer.appendChild(cameraActionTorchButton);

        const showTorchButtonIfSupported = (settings: MediaTrackSettings) => {
            if (!TorchUtils.isTorchSupported(settings)) {
                // Torch not supported, ignore.
                cameraActionTorchButton.style.display = "none";
                return;
            }

            cameraActionTorchButton.style.display = "inline-block";
        };

        scpCameraScanRegion.appendChild(cameraActionContainer);

        const resetCameraActionStartButton = (shouldShow: boolean) => {
            if (!shouldShow) {
                cameraActionStartButton.style.display = "none";
            }
            cameraActionStartButton.innerText
                = Html5QrcodeScannerStrings
                    .scanButtonStartScanningText();
            cameraActionStartButton.style.opacity = "1";
            cameraActionStartButton.disabled = false;
            if (shouldShow) {
                cameraActionStartButton.style.display = "inline-block";
            }
        };

        cameraActionStartButton.addEventListener("click", (_) => {
            // Update the UI.
            cameraActionStartButton.innerText
                = Html5QrcodeScannerStrings.scanButtonScanningStarting();
            cameraSelectionSelect.disabled = true;
            cameraActionStartButton.disabled = true;
            cameraActionStartButton.style.opacity = "0.5";
            // Swap link is available only when both scantypes are required.
            if (this.scanTypeSelector.hasMoreThanOneScanType()) {
                $this.showHideScanTypeSwapLink(false);
            }
            $this.resetHeaderMessage();            

            // Attempt starting the camera.
            const cameraId = cameraSelectionSelect.value;
            $this.persistedDataManager.setLastUsedCameraId(cameraId);

            $this.html5Qrcode!.start(
                cameraId,
                toHtml5QrcodeCameraScanConfig($this.config),
                $this.qrCodeSuccessCallback!,
                $this.qrCodeErrorCallback!)
                .then((_) => {
                    cameraActionStopButton.disabled = false;
                    cameraActionStopButton.style.display = "inline-block";
                    resetCameraActionStartButton(/* shouldShow= */ false);

                    // Show torch button if needed.
                    if (this.config.showTorchButtonIfSupported === true) {
                        showTorchButtonIfSupported(
                            $this.html5Qrcode!.getRunningTrackSettings());
                    }
                })
                .catch((error) => {
                    $this.showHideScanTypeSwapLink(true);
                    cameraSelectionSelect.disabled = false;
                    resetCameraActionStartButton(/* shouldShow= */ true);
                    $this.setHeaderMessage(
                        error, Html5QrcodeScannerStatus.STATUS_WARNING);
                });
        });

        if (numCameras === 1) {
            // If there is only one camera, start scanning directly.
            cameraActionStartButton.click();
        }

        cameraActionStopButton.addEventListener("click", (_) => {
            if (!$this.html5Qrcode) {
                throw "html5Qrcode not defined";
            }
            cameraActionStopButton.disabled = true;
            $this.html5Qrcode.stop()
                .then((_) => {
                    // Swap link is required if more than one scan types are
                    // required.
                    if(this.scanTypeSelector.hasMoreThanOneScanType()) {
                        $this.showHideScanTypeSwapLink(true);
                    }
                    
                    cameraSelectionSelect.disabled = false;
                    cameraActionStartButton.disabled = false;
                    cameraActionStopButton.style.display = "none";
                    cameraActionStartButton.style.display = "inline-block";
                    // Reset torch state.
                    torchButton.reset();
                    cameraActionTorchButton.style.display = "none";
                    $this.insertCameraScanImageToScanRegion();
                }).catch((error) => {
                    cameraActionStopButton.disabled = false;
                    $this.setHeaderMessage(
                        error, Html5QrcodeScannerStatus.STATUS_WARNING);
                });
        });

        if ($this.persistedDataManager.getLastUsedCameraId()) {
            const cameraId = $this.persistedDataManager.getLastUsedCameraId();
            let cameraFound = false;
            for (const option of options) {
                if (option.value === cameraId) {
                    cameraFound = true;
                    break;
                }
            }

            if (cameraFound) {
                cameraSelectionSelect.value = cameraId!;
                cameraActionStartButton.click();
            } else {
                $this.persistedDataManager.resetLastUsedCameraId();
            }
        }
    }

    private createSectionSwap() {
        const $this = this;
        const TEXT_IF_CAMERA_SCAN_SELECTED
            = Html5QrcodeScannerStrings.textIfCameraScanSelected();
        const TEXT_IF_FILE_SCAN_SELECTED
            = Html5QrcodeScannerStrings.textIfFileScanSelected();

        const section = document.getElementById(this.getDashboardSectionId())!;
        const switchContainer = document.createElement("div");
        switchContainer.style.textAlign = "center";
        const switchScanTypeLink = BaseUiElementFactory.createAnchor();
        switchScanTypeLink.style.textDecoration = "underline";
        switchScanTypeLink.id = this.getDashboardSectionSwapLinkId();
        switchScanTypeLink.innerText
            = ScanTypeSelector.isCameraScanType(this.currentScanType)
            ? TEXT_IF_CAMERA_SCAN_SELECTED : TEXT_IF_FILE_SCAN_SELECTED;
        switchScanTypeLink.addEventListener("click", function () {
            // TODO(minhazav): Abstract this to a different library.
            if (!$this.sectionSwapAllowed) {
                if ($this.verbose) {
                    $this.logger.logError(
                        "Section swap called when not allowed");
                }
                return;
            }

            // Cleanup states
            $this.resetHeaderMessage();
            $this.getFileScanInput().value = "";
            $this.sectionSwapAllowed = false;
            
            if (ScanTypeSelector.isCameraScanType($this.currentScanType)) {
                // Swap to file based scanning.
                $this.clearScanRegion();
                $this.getFileScanInput().disabled = false;
                $this.getCameraScanRegion().style.display = "none";
                $this.getFileScanRegion().style.display = "block";
                switchScanTypeLink.innerText = TEXT_IF_FILE_SCAN_SELECTED;
                $this.currentScanType = Html5QrcodeScanType.SCAN_TYPE_FILE;
                $this.insertFileScanImageToScanRegion();
            } else {
                // Swap to camera based scanning.
                $this.clearScanRegion();
                $this.getFileScanInput().disabled = true;
                $this.getCameraScanRegion().style.display = "block";
                $this.getFileScanRegion().style.display = "none";
                switchScanTypeLink.innerText = TEXT_IF_CAMERA_SCAN_SELECTED;
                $this.currentScanType = Html5QrcodeScanType.SCAN_TYPE_CAMERA;
                $this.insertCameraScanImageToScanRegion();

                $this.startCameraScanIfPermissionExistsOnSwap();
            }

            $this.sectionSwapAllowed = true;
        });
        switchContainer.appendChild(switchScanTypeLink);
        section.appendChild(switchContainer);
    }

    // Start camera scanning automatically when swapping to camera based scan
    // if set in config and has permission.
    private startCameraScanIfPermissionExistsOnSwap() {
        const $this = this;
        if (this.persistedDataManager.hasCameraPermissions()) {
            CameraManager.hasCameraPermissions().then(
                (hasPermissions: boolean) => {
                if (hasPermissions) {
                    // Start feed.
                    // Assuming at this point the permission button exists.
                    let permissionButton = document.getElementById(
                        $this.getCameraPermissionButtonId());
                    if (!permissionButton) {
                        this.logger.logError(
                            "Permission button not found, fail;");
                        throw "Permission button not found";
                    }
                    permissionButton.click();
                } else {
                    $this.persistedDataManager.setHasPermission(
                        /* hasPermission */ false);
                }
            }).catch((_: any) => {
                $this.persistedDataManager.setHasPermission(
                    /* hasPermission */ false);
            });
            return;
        }
    }

    private resetHeaderMessage() {
        const messageDiv = document.getElementById(
            this.getHeaderMessageContainerId())!;
        messageDiv.style.display = "none";
    }

    private setHeaderMessage(
        messageText: string, scannerStatus?: Html5QrcodeScannerStatus) {
        if (!scannerStatus) {
            scannerStatus = Html5QrcodeScannerStatus.STATUS_DEFAULT;
        }

        const messageDiv = this.getHeaderMessageDiv();
        messageDiv.innerText = messageText;
        messageDiv.style.display = "block";

        switch (scannerStatus) {
            case Html5QrcodeScannerStatus.STATUS_SUCCESS:
                messageDiv.style.background = "rgba(106, 175, 80, 0.26)";
                messageDiv.style.color = "#477735";
                break;
            case Html5QrcodeScannerStatus.STATUS_WARNING:
                messageDiv.style.background = "rgba(203, 36, 49, 0.14)";
                messageDiv.style.color = "#cb2431";
                break;
            case Html5QrcodeScannerStatus.STATUS_DEFAULT:
            default:
                messageDiv.style.background = "rgba(0, 0, 0, 0)";
                messageDiv.style.color = "rgb(17, 17, 17)";
                break;
        }
    }

    private showHideScanTypeSwapLink(shouldDisplay?: boolean) {
        if (shouldDisplay !== true) {
            shouldDisplay = false;
        }

        this.sectionSwapAllowed = shouldDisplay;
        this.getDashboardSectionSwapLink().style.display
            = shouldDisplay ? "inline-block" : "none";
    }

    private insertCameraScanImageToScanRegion() {
        const $this = this;
        const qrCodeScanRegion = document.getElementById(
            this.getScanRegionId())!;

        if (this.cameraScanImage) {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild(this.cameraScanImage);
            return;
        }

        this.cameraScanImage = new Image;
        this.cameraScanImage.onload = (_) => {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild($this.cameraScanImage!);
        }
        this.cameraScanImage.width = 64;
        this.cameraScanImage.style.opacity = "0.8";
        this.cameraScanImage.src = ASSET_CAMERA_SCAN;
    }

    private insertFileScanImageToScanRegion() {
        const $this = this;
        const qrCodeScanRegion = document.getElementById(
            this.getScanRegionId())!;

        if (this.fileScanImage) {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild(this.fileScanImage);
            return;
        }

        this.fileScanImage = new Image;
        this.fileScanImage.onload = (_) => {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild($this.fileScanImage!);
        }
        this.fileScanImage.width = 64;
        this.fileScanImage.style.opacity = "0.8";
        this.fileScanImage.src = ASSET_FILE_SCAN;
    }

    private clearScanRegion() {
        const qrCodeScanRegion = document.getElementById(
            this.getScanRegionId())!;
        qrCodeScanRegion.innerHTML = "";
    }

    //#region state getters
    private getDashboardSectionId(): string {
        return `${this.elementId}__dashboard_section`;
    }

    private getDashboardSectionCameraScanRegionId(): string {
        return `${this.elementId}__dashboard_section_csr`;
    }

    private getDashboardSectionFileScanRegionId(): string {
        return `${this.elementId}__dashboard_section_fsr`;
    }

    private getDashboardSectionSwapLinkId(): string {
        return `${this.elementId}__dashboard_section_swaplink`;
    }

    private getScanRegionId(): string {
        return `${this.elementId}__scan_region`;
    }

    private getDashboardId(): string {
        return `${this.elementId}__dashboard`;
    }

    private getFileScanInputId(): string {
        return `${this.elementId}__filescan_input`;
    }

    private getStatusSpanId(): string {
        return `${this.elementId}__status_span`;
    }

    private getHeaderMessageContainerId(): string {
        return `${this.elementId}__header_message`;
    }

    private getCameraSelectionId(): string {
        return `${this.elementId}__camera_selection`;
    }

    private getCameraPermissionButtonId(): string {
        return `${this.elementId}__camera_permission_button`;
    }

    private getCameraScanRegion(): HTMLElement {
        return document.getElementById(
            this.getDashboardSectionCameraScanRegionId())!;
    }

    private getFileScanRegion(): HTMLElement {
        return document.getElementById(
            this.getDashboardSectionFileScanRegionId())!;
    }

    private getFileScanInput(): HTMLInputElement {
        return <HTMLInputElement>document.getElementById(
            this.getFileScanInputId())!;
    }

    private getDashboardSectionSwapLink(): HTMLElement {
        return document.getElementById(this.getDashboardSectionSwapLinkId())!;
    }

    private getHeaderMessageDiv(): HTMLElement {
        return document.getElementById(this.getHeaderMessageContainerId())!;
    }
    //#endregion
    //#endregion
}
