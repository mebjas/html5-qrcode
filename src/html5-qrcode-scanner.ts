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
     * Note: default value is true.
     */
    rememberLastUsedCamera?: boolean | undefined;
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

        this.currentScanType = Html5QrcodeScanType.SCAN_TYPE_CAMERA;
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
     * Note: Should only be called if {@code Html5QrcodeScanner#getState()}
     *   returns {@code Html5QrcodeScannerState#SCANNING} or 
     *   {@code Html5QrcodeScannerState#PAUSED}.
     *
     * @beta This is an experimental API
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
     * Apply a video constraints on running video track from camera.
     *
     * Note: Should only be called if {@code Html5QrcodeScanner#getState()}
     *   returns {@code Html5QrcodeScannerState#SCANNING} or 
     *   {@code Html5QrcodeScannerState#PAUSED}.
     *
     * @beta This is an experimental API
     * @param {MediaTrackConstraints} specifies a variety of video or camera
     *  controls as defined in
     *  https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * @returns a Promise which succeeds if the passed constraints are applied,
     *  fails otherwise.
     * @throws error if the scanning is not in running state.
     */
    public applyVideoConstraints(videoConstaints: MediaTrackConstraints)
        : Promise<any> {
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
            return config;
        }

        return {
            fps: Html5QrcodeConstants.SCAN_DEFAULT_FPS,
            rememberLastUsedCamera:
                Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED
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
        this.insertCameraScanImageToScanRegion();

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
        this.createSection(dashboard);
        this.createSectionControlPanel();
        this.createSectionSwap();
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
        const requestPermissionButton = document.createElement("button");
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

        if (this.persistedDataManager.hasCameraPermissions()) {
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
            = this.currentScanType === Html5QrcodeScanType.SCAN_TYPE_CAMERA
                ? "block" : "none";
        sectionControlPanel.appendChild(scpCameraScanRegion);

        // Assuming when the object is created permission is needed.
        const requestPermissionContainer = document.createElement("div");
        requestPermissionContainer.style.textAlign = "center";
        scpCameraScanRegion.appendChild(requestPermissionContainer);
        this.createPermissionsUi(
            scpCameraScanRegion, requestPermissionContainer);

        const fileBasedScanRegion = document.createElement("div");
        fileBasedScanRegion.id = this.getDashboardSectionFileScanRegionId();
        fileBasedScanRegion.style.textAlign = "center";
        fileBasedScanRegion.style.display
            = this.currentScanType === Html5QrcodeScanType.SCAN_TYPE_CAMERA
                ? "none" : "block";
        sectionControlPanel.appendChild(fileBasedScanRegion);

        const fileScanInput = document.createElement("input");
        fileScanInput.id = this.getFileScanInputId();
        fileScanInput.accept = "image/*";
        fileScanInput.type = "file";
        fileScanInput.style.width = "200px";
        fileScanInput.disabled
            = this.currentScanType === Html5QrcodeScanType.SCAN_TYPE_CAMERA;
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
            if ($this.currentScanType !== Html5QrcodeScanType.SCAN_TYPE_FILE) {
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
            const option = document.createElement("option");
            option.value = value;
            option.innerText = name;
            options.push(option);
            cameraSelectionSelect.appendChild(option);
        }
        cameraSelectionContainer.appendChild(cameraSelectionSelect);
        scpCameraScanRegion.appendChild(cameraSelectionContainer);

        const cameraActionContainer = document.createElement("span");
        const cameraActionStartButton = document.createElement("button");
        cameraActionStartButton.innerText
            = Html5QrcodeScannerStrings.scanButtonStartScanningText();
        cameraActionContainer.appendChild(cameraActionStartButton);

        const cameraActionStopButton = document.createElement("button");
        cameraActionStopButton.innerText
            = Html5QrcodeScannerStrings.scanButtonStopScanningText();
        cameraActionStopButton.style.display = "none";
        cameraActionStopButton.disabled = true;
        cameraActionContainer.appendChild(cameraActionStopButton);

        scpCameraScanRegion.appendChild(cameraActionContainer);

        const resetCameraActionStarButton = (shouldShow: boolean) => {
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
            $this.showHideScanTypeSwapLink(false);
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
                    resetCameraActionStarButton(/* shouldShow= */ false);
                })
                .catch((error) => {
                    $this.showHideScanTypeSwapLink(true);
                    cameraSelectionSelect.disabled = false;
                    resetCameraActionStarButton(/* shouldShow= */ true);
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
                    $this.showHideScanTypeSwapLink(true);
                    cameraSelectionSelect.disabled = false;
                    cameraActionStartButton.disabled = false;
                    cameraActionStopButton.style.display = "none";
                    cameraActionStartButton.style.display = "inline-block";
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
        const swithToFileBasedLink = document.createElement("a");
        swithToFileBasedLink.style.textDecoration = "underline";
        swithToFileBasedLink.id = this.getDashboardSectionSwapLinkId();
        swithToFileBasedLink.innerText
            = this.currentScanType === Html5QrcodeScanType.SCAN_TYPE_CAMERA
                ? TEXT_IF_CAMERA_SCAN_SELECTED : TEXT_IF_FILE_SCAN_SELECTED;
        swithToFileBasedLink.href = "#scan-using-file";
        swithToFileBasedLink.addEventListener("click", function () {
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
            
            if ($this.currentScanType === Html5QrcodeScanType.SCAN_TYPE_CAMERA) {
                // swap to file
                $this.clearScanRegion();
                $this.getFileScanInput().disabled = false;
                $this.getCameraScanRegion().style.display = "none";
                $this.getFileScanRegion().style.display = "block";
                swithToFileBasedLink.innerText = TEXT_IF_FILE_SCAN_SELECTED;
                $this.currentScanType = Html5QrcodeScanType.SCAN_TYPE_FILE;
                $this.insertFileScanImageToScanRegion();
            } else {
                // swap to camera based scanning.
                $this.clearScanRegion();
                $this.getFileScanInput().disabled = true;
                $this.getCameraScanRegion().style.display = "block";
                $this.getFileScanRegion().style.display = "none";
                swithToFileBasedLink.innerText = TEXT_IF_CAMERA_SCAN_SELECTED;
                $this.currentScanType = Html5QrcodeScanType.SCAN_TYPE_CAMERA;
                $this.insertCameraScanImageToScanRegion();
            }

            $this.sectionSwapAllowed = true;
        });
        switchContainer.appendChild(swithToFileBasedLink);
        section.appendChild(switchContainer);
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
                messageDiv.style.background = "#6aaf5042";
                messageDiv.style.color = "#477735";
                break;
            case Html5QrcodeScannerStatus.STATUS_WARNING:
                messageDiv.style.background = "#cb243124";
                messageDiv.style.color = "#cb2431";
                break;
            case Html5QrcodeScannerStatus.STATUS_DEFAULT:
            default:
                messageDiv.style.background = "#00000000";
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
