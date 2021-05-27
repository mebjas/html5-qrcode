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
    Html5QrcodeResultFactory,
    CameraDevice
} from "./core";

import {
    Html5Qrcode,
    Html5QrcodeConfig
} from "./html5-qrcode";

import {
    Html5QrcodeScannerStrings,
    Html5QrcodeStrings
} from "./strings"

/**
 * Different states of QR Code Scanner
 */
enum Html5QrcodeScannerStatus {
    STATUS_DEFAULT = 0,
    STATUS_SUCCESS = 1,
    STATUS_WARNING = 2,
}

export class Html5QrcodeScanner {

    //#region private fields
    private elementId: string;
    private config: Html5QrcodeConfig;
    private verbose: boolean;
    private currentScanType: Html5QrcodeScanType;
    private sectionSwapAllowed: boolean;

    // Initally null fields.
    private section?: HTMLElement;
    private html5Qrcode?: Html5Qrcode;
    private qrCodeSuccessCallback?: QrcodeSuccessCallback;
    private qrCodeErrorCallback?: QrcodeErrorCallback;
    private lastMatchFound?: string;
    private cameraScanImage?: HTMLImageElement;
    private fileScanImage?: HTMLImageElement;
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
        config: Html5QrcodeConfig,
        verbose?: boolean) {
        this.elementId = elementId;
        this.config = config;
        this.verbose = verbose === true;

        if (!document.getElementById(elementId)) {
            throw `HTML Element with id=${elementId} not found`;;
        }

        this.currentScanType = Html5QrcodeScanType.SCAN_TYPE_CAMERA;
        this.sectionSwapAllowed = true;
    }

    /**
     * Renders the User Interface.
     * 
     * @param qrCodeSuccessCallback Callback called when an instance of a QR
     * code or any other supported bar code is found.
     * @param qrCodeErrorCallback Callback called in cases where no instance of
     * QR code or any other supported bar code is found.
     */
    public render(
        qrCodeSuccessCallback: QrcodeSuccessCallback,
        qrCodeErrorCallback: QrcodeErrorCallback) {
        this.lastMatchFound = undefined;

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
        }

        // Add wrapper to failure callback
        this.qrCodeErrorCallback =
            (errorMessage: string, error: Html5QrcodeError) => {
            this.setStatus(Html5QrcodeScannerStrings.scanningStatus());
            if (qrCodeErrorCallback) {
                qrCodeErrorCallback(errorMessage, error);
            }
        }

        const container = document.getElementById(this.elementId);
        if (!container) {
            throw `HTML Element with id=${this.elementId} not found`;;
        }
        container.innerHTML = "";
        this.createBasicLayout(container!);

        this.html5Qrcode = new Html5Qrcode(
            this.getScanRegionId(), this.verbose);
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
                    this.html5Qrcode.stop().then(_ => {
                        if (!this.html5Qrcode) {
                            resolve();
                            return;
                        }

                        this.html5Qrcode.clear();
                        emptyHtmlContainer();
                        resolve();
                    }).catch(error => {
                        if (this.verbose) {
                            console.error(
                                "Unable to stop qrcode scanner", error);
                        }
                        reject(error);
                    })
                }
            });
        }

        return Promise.resolve();
    }

    //#region Private methods
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
        header.style.padding = "5px";
        header.style.fontSize = "20px";
        header.style.borderBottom = "1px solid rgba(192, 192, 192, 0.18)";
        dashboard.appendChild(header);

        const titleSpan = document.createElement("span");
        const titleLink = document.createElement("a");
        titleLink.innerHTML = Html5QrcodeScannerStrings.codeScannerTitle();
        titleLink.href = Html5QrcodeConstants.GITHUB_PROJECT_URL;
        titleSpan.appendChild(titleLink);
        header.appendChild(titleSpan);

        const statusSpan = document.createElement("span");
        statusSpan.id = this.getStatusSpanId();
        statusSpan.style.float = "right";
        statusSpan.style.padding = "5px 7px";
        statusSpan.style.fontSize = "14px";
        statusSpan.style.background = "#dedede6b";
        statusSpan.style.border = "1px solid #00000000";
        statusSpan.style.color = "rgb(17, 17, 17)";
        header.appendChild(statusSpan);
        this.setStatus(Html5QrcodeScannerStrings.idleStatus());

        const headerMessageContainer = document.createElement("div");
        headerMessageContainer.id = this.getHeaderMessageContainerId();
        headerMessageContainer.style.display = "none";
        headerMessageContainer.style.fontSize = "14px";
        headerMessageContainer.style.padding = "2px 10px";
        headerMessageContainer.style.marginTop = "4px";
        headerMessageContainer.style.borderTop = "1px solid #f6f6f6";
        header.appendChild(headerMessageContainer);
    }

    private createSection(dashboard: HTMLElement) {
        const section = document.createElement("div");
        section.id = this.getDashboardSectionId();
        section.style.width = "100%";
        section.style.padding = "10px";
        section.style.textAlign = "left";
        dashboard.appendChild(section);
    }

    private createSectionControlPanel() {
        const section = document.getElementById(this.getDashboardSectionId())!;
        const sectionControlPanel = document.createElement("div");
        section.appendChild(sectionControlPanel);
        const scpCameraScanRegion = document.createElement("div");
        scpCameraScanRegion.id = this.getDashboardSectionCameraScanRegionId();
        scpCameraScanRegion.style.display
            = this.currentScanType == Html5QrcodeScanType.SCAN_TYPE_CAMERA
                ? "block" : "none";
        sectionControlPanel.appendChild(scpCameraScanRegion);

        // Assuming when the object is created permission is needed.
        const requestPermissionContainer = document.createElement("div");
        requestPermissionContainer.style.textAlign = "center";

        const requestPermissionButton = document.createElement("button");
        requestPermissionButton.innerHTML
            = Html5QrcodeScannerStrings.cameraPermissionTitle();

        const $this = this;
        requestPermissionButton.addEventListener("click", function () {
            requestPermissionButton.disabled = true;
            $this.setStatus(Html5QrcodeScannerStrings.permissionStatus());
            $this.setHeaderMessage(
                Html5QrcodeScannerStrings.cameraPermissionRequesting());

            Html5Qrcode.getCameras().then(cameras => {
                $this.setStatus(Html5QrcodeScannerStrings.idleStatus());
                $this.resetHeaderMessage();
                if (!cameras || cameras.length == 0) {
                    $this.setStatus(
                        Html5QrcodeScannerStrings.noCameraFoundErrorStatus(),
                        Html5QrcodeScannerStatus.STATUS_WARNING);
                } else {
                    scpCameraScanRegion.removeChild(requestPermissionContainer);
                    $this.renderCameraSelection(cameras);
                }
            }).catch(error => {
                requestPermissionButton.disabled = false;
                $this.setStatus(Html5QrcodeScannerStrings.idleStatus());
                $this.setHeaderMessage(
                    error, Html5QrcodeScannerStatus.STATUS_WARNING);
            });
        });
        requestPermissionContainer.appendChild(requestPermissionButton);
        scpCameraScanRegion.appendChild(requestPermissionContainer);

        const fileBasedScanRegion = document.createElement("div");
        fileBasedScanRegion.id = this.getDashboardSectionFileScanRegionId();
        fileBasedScanRegion.style.textAlign = "center";
        fileBasedScanRegion.style.display
            = this.currentScanType == Html5QrcodeScanType.SCAN_TYPE_CAMERA
                ? "none" : "block";
        sectionControlPanel.appendChild(fileBasedScanRegion);

        const fileScanInput = document.createElement("input");
        fileScanInput.id = this.getFileScanInputId();
        fileScanInput.accept = "image/*";
        fileScanInput.type = "file";
        fileScanInput.style.width = "200px";
        fileScanInput.disabled
            = this.currentScanType == Html5QrcodeScanType.SCAN_TYPE_CAMERA;
        const fileScanLabel = document.createElement("span");
        fileScanLabel.innerHTML = "&nbsp; Select Image";
        fileBasedScanRegion.appendChild(fileScanInput);
        fileBasedScanRegion.appendChild(fileScanLabel);
        fileScanInput.addEventListener('change', (e: any) => {
            if (!$this.html5Qrcode) {
                throw "html5Qrcode not defined";
            }

            if (e == null || e.target == null) {
                return;
            }
            if ($this.currentScanType != Html5QrcodeScanType.SCAN_TYPE_FILE) {
                return;
            }
            if (e.target.files.length == 0) {
                return;
            }
            const file = e.target.files[0];
            $this.html5Qrcode.scanFile(file, /* showImage= */ true)
                .then((decodedText: string) => {
                    $this.resetHeaderMessage();
                    $this.qrCodeSuccessCallback!(
                        decodedText,
                        Html5QrcodeResultFactory.createFrom(decodedText));
                })
                .catch(error => {
                    $this.setStatus(
                        Html5QrcodeScannerStrings.errorStatus(),
                        Html5QrcodeScannerStatus.STATUS_WARNING);
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
        cameraSelectionContainer.innerHTML
            = `Select Camera (${cameras.length}) &nbsp;`;
        cameraSelectionContainer.style.marginRight = "10px";

        const cameraSelectionSelect = document.createElement("select");
        cameraSelectionSelect.id = this.getCameraSelectionId();
        for (var i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            const value = camera.id;
            const name = camera.label == null ? value : camera.label;
            const option = document.createElement('option');
            option.value = value;
            option.innerHTML = name;
            cameraSelectionSelect.appendChild(option);
        }
        cameraSelectionContainer.appendChild(cameraSelectionSelect);
        scpCameraScanRegion.appendChild(cameraSelectionContainer);

        const cameraActionContainer = document.createElement("span");
        const cameraActionStartButton = document.createElement("button");
        cameraActionStartButton.innerHTML
            = Html5QrcodeScannerStrings.scanButtonStartScanningText();
        cameraActionContainer.appendChild(cameraActionStartButton);

        const cameraActionStopButton = document.createElement("button");
        cameraActionStopButton.innerHTML
            = Html5QrcodeScannerStrings.scanButtonStopScanningText();
        cameraActionStopButton.style.display = "none";
        cameraActionStopButton.disabled = true;
        cameraActionContainer.appendChild(cameraActionStopButton);

        scpCameraScanRegion.appendChild(cameraActionContainer);

        cameraActionStartButton.addEventListener('click', _ => {
            cameraSelectionSelect.disabled = true;
            cameraActionStartButton.disabled = true;
            $this.showHideScanTypeSwapLink(false);

            const config = $this.config ?
                $this.config : { fps: 10, qrbox: 250 };

            const cameraId = cameraSelectionSelect.value;
            $this.html5Qrcode!.start(
                cameraId,
                config,
                $this.qrCodeSuccessCallback!,
                $this.qrCodeErrorCallback!)
                .then(_ => {
                    cameraActionStopButton.disabled = false;
                    cameraActionStopButton.style.display = "inline-block";
                    cameraActionStartButton.style.display = "none";
                    $this.setStatus(Html5QrcodeScannerStrings.scanningStatus());
                })
                .catch(error => {
                    $this.showHideScanTypeSwapLink(true);
                    cameraSelectionSelect.disabled = false;
                    cameraActionStartButton.disabled = false;
                    $this.setStatus(Html5QrcodeScannerStrings.idleStatus());
                    $this.setHeaderMessage(
                        error, Html5QrcodeScannerStatus.STATUS_WARNING);
                });
        });

        cameraActionStopButton.addEventListener('click', _ => {
            if (!$this.html5Qrcode) {
                throw "html5Qrcode not defined";
            }
            cameraActionStopButton.disabled = true;
            $this.html5Qrcode.stop()
                .then(_ => {
                    $this.showHideScanTypeSwapLink(true);
                    cameraSelectionSelect.disabled = false;
                    cameraActionStartButton.disabled = false;
                    cameraActionStopButton.style.display = "none";
                    cameraActionStartButton.style.display = "inline-block";
                    $this.setStatus(Html5QrcodeScannerStrings.idleStatus());
                    $this.insertCameraScanImageToScanRegion();
                }).catch(error => {
                    cameraActionStopButton.disabled = false;
                    $this.setStatus(
                        Html5QrcodeScannerStrings.errorStatus(),
                        Html5QrcodeScannerStatus.STATUS_WARNING);
                    $this.setHeaderMessage(
                        error, Html5QrcodeScannerStatus.STATUS_WARNING);
                });
        });
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
        swithToFileBasedLink.innerHTML
            = this.currentScanType == Html5QrcodeScanType.SCAN_TYPE_CAMERA
                ? TEXT_IF_CAMERA_SCAN_SELECTED : TEXT_IF_FILE_SCAN_SELECTED;
        swithToFileBasedLink.href = "#scan-using-file";
        swithToFileBasedLink.addEventListener('click', function () {
            if (!$this.sectionSwapAllowed) {
                if ($this.verbose) {
                    console.error("Section swap called when not allowed");
                }
                return;
            }

            // Cleanup states
            $this.setStatus(Html5QrcodeScannerStrings.idleStatus());
            $this.resetHeaderMessage();
            $this.getFileScanInput().value = "";

            $this.sectionSwapAllowed = false;
            
            if ($this.currentScanType == Html5QrcodeScanType.SCAN_TYPE_CAMERA) {
                // swap to file
                $this.clearScanRegion();
                $this.getFileScanInput().disabled = false;
                $this.getCameraScanRegion().style.display = "none";
                $this.getFileScanRegion().style.display = "block";
                swithToFileBasedLink.innerHTML = TEXT_IF_FILE_SCAN_SELECTED;
                $this.currentScanType = Html5QrcodeScanType.SCAN_TYPE_FILE;
                $this.insertFileScanImageToScanRegion();
            } else {
                // swap to camera based scanning.
                $this.clearScanRegion();
                $this.getFileScanInput().disabled = true;
                $this.getCameraScanRegion().style.display = "block";
                $this.getFileScanRegion().style.display = "none";
                swithToFileBasedLink.innerHTML = TEXT_IF_CAMERA_SCAN_SELECTED;
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

    private setStatus(
        statusText: string, scannerStatus?: Html5QrcodeScannerStatus) {
        if (!scannerStatus) {
            scannerStatus = Html5QrcodeScannerStatus.STATUS_DEFAULT;
        }

        const statusSpan = this.getStatusSpan();
        statusSpan.innerHTML = statusText;

        switch (scannerStatus) {
            case Html5QrcodeScannerStatus.STATUS_SUCCESS:
                statusSpan.style.background = "#6aaf5042";
                statusSpan.style.color = "#477735";
                break;
            case Html5QrcodeScannerStatus.STATUS_WARNING:
                statusSpan.style.background = "#cb243124";
                statusSpan.style.color = "#cb2431";
                break;
            case Html5QrcodeScannerStatus.STATUS_DEFAULT:
            default:
                statusSpan.style.background = "#eef";
                statusSpan.style.color = "rgb(17, 17, 17)";
                break;
        }
    }

    private setHeaderMessage(
        messageText: string, scannerStatus?: Html5QrcodeScannerStatus) {
        if (!scannerStatus) {
            scannerStatus = Html5QrcodeScannerStatus.STATUS_DEFAULT;
        }

        const messageDiv = this.getHeaderMessageDiv();
        messageDiv.innerHTML = messageText;
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
        this.cameraScanImage.onload = _ => {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild($this.cameraScanImage!);
        }
        this.cameraScanImage.width = 64;
        this.cameraScanImage.style.opacity = "0.3";
        this.cameraScanImage.src = Html5QrcodeConstants.ASSET_CAMERA_SCAN;
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
        this.fileScanImage.onload = _ => {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild($this.fileScanImage!);
        }
        this.fileScanImage.width = 64;
        this.fileScanImage.style.opacity = "0.3";
        this.fileScanImage.src = Html5QrcodeConstants.ASSET_FILE_SCAN;
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

    private getStatusSpan(): HTMLElement {
        return document.getElementById(this.getStatusSpanId())!;
    }

    private getHeaderMessageDiv(): HTMLElement {
        return document.getElementById(this.getHeaderMessageContainerId())!;
    }
    //#endregion
    //#endregion
}
