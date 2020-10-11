/**
 * @fileoverview
 * Complete Scanner build on top of {@link Html5Qrcode}.
 * - Decode QR Code using web cam or smartphone camera
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 * 
 * Note: ECMA Script is not supported by all browsers. Use minified/html5-qrcode.min.js for better
 * browser support. Alternatively the transpiled code lives in transpiled/html5-qrcode.js
 */
class Html5QrcodeScanner {

    static SCAN_TYPE_CAMERA = "SCAN_TYPE_CAMERA";
    static SCAN_TYPE_FILE = "SCAN_TYPE_FILE";
    static STATUS_SUCCESS = "STATUS_SUCCESS";
    static STATUS_WARNING = "STATUS_WARNING";
    static STATUS_DEFAULT = "STATUS_DEFAULT";

    static ASSET_FILE_SCAN = "https://raw.githubusercontent.com/mebjas/html5-qrcode/master/assets/file-scan.gif";
    static ASSET_CAMERA_SCAN = "https://raw.githubusercontent.com/mebjas/html5-qrcode/master/assets/camera-scan.gif";

    /**
     * Creates instance of this class.
     *
     * @param {String} elementId - Id of the HTML element.
     * @param {Object} config extra configurations to tune QR code scanner.
     *  Supported Fields:
     *      - fps: expected framerate of qr code scanning. example { fps: 2 }
     *          means the scanning would be done every 500 ms.
     *      - qrbox: width of QR scanning box, this should be smaller than
     *          the width and height of the box. This would make the scanner
     *          look like this:
     *          ----------------------
     *          |********************|
     *          |******,,,,,,,,,*****|      <--- shaded region
     *          |******|       |*****|      <--- non shaded region would be
     *          |******|       |*****|          used for QR code scanning.
     *          |******|_______|*****|
     *          |********************|
     *          |********************|
     *          ----------------------
     *      - aspectRatio: Optional, desired aspect ratio for the video feed.
     *          Ideal aspect ratios are 4:3 or 16:9. Passing very wrong aspect
     *          ratio could lead to video feed not showing up.
     *      - disableFlip: Optional, if {@code true} flipped QR Code won't be
     *          scanned. Only use this if you are sure the camera cannot give
     *          mirrored feed if you are facing performance constraints.
     *      - videoConstraints: {MediaTrackConstraints}, Optional
     *          @beta(this config is not well supported yet).
     *
     *          Important: When passed this will override other parameters
     *          like 'cameraIdOrConfig' or configurations like 'aspectRatio'.
     *
     *          videoConstraints should be of type {@code MediaTrackConstraints}
     *          as defined in
     *          https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     *          and is used to specify a variety of video or camera controls
     *          like: aspectRatio, facingMode, frameRate, etc.
     * @param {Boolean} verbose - Optional argument, if true, all logs
     *                  would be printed to console. 
     */
    constructor(elementId, config, verbose) {
        this.elementId = elementId;
        this.config = config;
        this.verbose = verbose === true;

        if (!document.getElementById(elementId)) {
            throw `HTML Element with id=${elementId} not found`;
        }

        this.currentScanType = Html5QrcodeScanner.SCAN_TYPE_CAMERA;
        this.sectionSwapAllowed = true;

        this.section = undefined;
        this.html5Qrcode = undefined;
        this.qrCodeSuccessCallback = undefined;
        this.qrCodeErrorCallback = undefined;
    }

    /**
     * Renders the User Interface
     * 
     * @param {Function} qrCodeSuccessCallback - callback on QR Code found.
     *  Example:
     *      function(qrCodeMessage) {}
     * @param {Function} qrCodeErrorCallback - callback on QR Code parse error.
     *  Example:
     *      function(errorMessage) {}
     * 
     */
    render(qrCodeSuccessCallback, qrCodeErrorCallback) {
        const $this = this;

        this.lastMatchFound = undefined;
        // Add wrapper to success callback.
        this.qrCodeSuccessCallback = message => {
            $this.__setStatus("MATCH", Html5QrcodeScanner.STATUS_SUCCESS);
            if (qrCodeSuccessCallback) {
                qrCodeSuccessCallback(message);
            } else {
                if ($this.lastMatchFound == message) {
                    return;
                }
                $this.lastMatchFound = message;
                $this.__setHeaderMessage(
                    `Last Match: ${message}`, Html5QrcodeScanner.STATUS_SUCCESS);
            }
        }

        // Add wrapper to failure callback
        this.qrCodeErrorCallback = error => {
            $this.__setStatus("Scanning");
            if (qrCodeErrorCallback) {
                qrCodeErrorCallback(error);
            }
        }

        const container = document.getElementById(this.elementId);
        container.innerHTML = "";
        this.__createBasicLayout(container);

        this.html5Qrcode = new Html5Qrcode(
            this.__getScanRegionId(), this.verbose);
    }

    /**
     * Removes the QR Code scanner.
     * 
     * @returns Promise which succeeds if the cleanup is complete successfully,
     *  fails otherwise.
     */
    clear() {
        const $this = this;
        const emptyHtmlContainer = () => {
            const mainContainer = document.getElementById(this.elementId);
            if (mainContainer) {
                mainContainer.innerHTML = "";
                this.__resetBasicLayout(mainContainer);
            }
        }

        if (this.html5Qrcode) {
            return new Promise((resolve, reject) => {
                if ($this.html5Qrcode._isScanning) {
                    $this.html5Qrcode.stop().then(_ => {
                        $this.html5Qrcode.clear();
                        emptyHtmlContainer();
                        resolve();
                    }).catch(error => {
                        if ($this.verbose) {
                            console.error("Unable to stop qrcode scanner", error);
                        }
                        reject(error);
                    })
                }
            });
        }
    }

    //#region private control methods
    __createBasicLayout(parent) {
        parent.style.position = "relative";
        parent.style.padding = "0px";
        parent.style.border = "1px solid silver";
        this.__createHeader(parent);

        const qrCodeScanRegion = document.createElement("div");
        const scanRegionId = this.__getScanRegionId();
        qrCodeScanRegion.id = scanRegionId;
        qrCodeScanRegion.style.width = "100%";
        qrCodeScanRegion.style.minHeight = "100px";
        qrCodeScanRegion.style.textAlign = "center";
        parent.appendChild(qrCodeScanRegion);
        this.__insertCameraScanImageToScanRegion();

        const qrCodeDashboard = document.createElement("div");
        const dashboardId = this.__getDashboardId();
        qrCodeDashboard.id = dashboardId;
        qrCodeDashboard.style.width = "100%";
        parent.appendChild(qrCodeDashboard);

        this.__setupInitialDashboard(qrCodeDashboard);
	}
	
	__resetBasicLayout(parent) {
        parent.style.border = "none";
	}

    __setupInitialDashboard(dashboard) {
        this.__createSection(dashboard);
        this.__createSectionControlPanel();
        this.__createSectionSwap();
    }

    __createHeader(dashboard) {
        const header = document.createElement("div");
        header.style.textAlign = "left";
        header.style.margin = "0px";
        header.style.padding = "5px";
        header.style.fontSize = "20px";
        header.style.borderBottom = "1px solid rgba(192, 192, 192, 0.18)";
        dashboard.appendChild(header);

        const titleSpan = document.createElement("span");
        titleSpan.innerHTML = "QR Code Scanner";
        header.appendChild(titleSpan);

        const statusSpan = document.createElement("span");
        statusSpan.id = this.__getStatusSpanId();
        statusSpan.style.float = "right";
        statusSpan.style.padding = "5px 7px";
        statusSpan.style.fontSize = "14px";
        statusSpan.style.background = "#dedede6b";
        statusSpan.style.border = "1px solid #00000000";
        statusSpan.style.color = "rgb(17, 17, 17)";
        header.appendChild(statusSpan);
        this.__setStatus("IDLE");

        const headerMessageContainer = document.createElement("div");
        headerMessageContainer.id = this.__getHeaderMessageContainerId();
        headerMessageContainer.style.display = "none";
        headerMessageContainer.style.fontSize = "14px";
        headerMessageContainer.style.padding = "2px 10px";
        headerMessageContainer.style.marginTop = "4px";
        headerMessageContainer.style.borderTop = "1px solid #f6f6f6";
        header.appendChild(headerMessageContainer);
    }

    __createSection(dashboard) {
        const section = document.createElement("div");
        section.id = this.__getDashboardSectionId();
        section.style.width = "100%";
        section.style.padding = "10px";
        section.style.textAlign = "left";
        dashboard.appendChild(section);
    }

    __createSectionControlPanel() {
        const $this = this;
        const section = document.getElementById(this.__getDashboardSectionId());
        const sectionControlPanel = document.createElement("div");
        section.appendChild(sectionControlPanel);
        const scpCameraScanRegion = document.createElement("div");
        scpCameraScanRegion.id = this.__getDashboardSectionCameraScanRegionId();
        scpCameraScanRegion.style.display
            = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA
                ? "block" : "none";
        sectionControlPanel.appendChild(scpCameraScanRegion);

        // Assuming when the object is created permission is needed.
        const requestPermissionContainer = document.createElement("div");
        requestPermissionContainer.style.textAlign = "center";

        const requestPermissionButton = document.createElement("button");
        requestPermissionButton.innerHTML = "Request Camera Permissions";
        requestPermissionButton.addEventListener("click", function () {
            requestPermissionButton.disabled = true;
            $this.__setStatus("PERMISSION");
            $this.__setHeaderMessage("Requesting camera permissions...");

            Html5Qrcode.getCameras().then(cameras => {
                $this.__setStatus("IDLE");
                $this.__resetHeaderMessage();
                if (!cameras || cameras.length == 0) {
                    $this.__setStatus(
                        "No Cameras", Html5QrcodeScanner.STATUS_WARNING);
                } else {
                    scpCameraScanRegion.removeChild(requestPermissionContainer);
                    $this.__renderCameraSelection(cameras);
                }
            }).catch(error => {
                requestPermissionButton.disabled = false;
                $this.__setStatus("IDLE");
                $this.__setHeaderMessage(error, Html5QrcodeScanner.STATUS_WARNING);
            });
        });
        requestPermissionContainer.appendChild(requestPermissionButton);
        scpCameraScanRegion.appendChild(requestPermissionContainer);

        const fileBasedScanRegion = document.createElement("div");
        fileBasedScanRegion.id = this.__getDashboardSectionFileScanRegionId();
        fileBasedScanRegion.style.textAlign = "center";
        fileBasedScanRegion.style.display
            = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA
                ? "none" : "block";
        sectionControlPanel.appendChild(fileBasedScanRegion);

        const fileScanInput = document.createElement("input");
        fileScanInput.id = this.__getFileScanInputId();
        fileScanInput.accept = "image/*";
        fileScanInput.type = "file";
        fileScanInput.style.width = "200px";
        fileScanInput.disabled
            = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA;
        const fileScanLabel = document.createElement("span");
        fileScanLabel.innerHTML = "&nbsp; Select Image";
        fileBasedScanRegion.appendChild(fileScanInput);
        fileBasedScanRegion.appendChild(fileScanLabel);
        fileScanInput.addEventListener('change', e => {
            if ($this.currentScanType !== Html5QrcodeScanner.SCAN_TYPE_FILE) {
                return;
            }
            if (e.target.files.length == 0) {
                return;
            }
            const file = e.target.files[0];
            $this.html5Qrcode.scanFile(file, true)
                .then(qrCode => {
                    $this.__resetHeaderMessage();
                    $this.qrCodeSuccessCallback(qrCode);
                })
                .catch(error => {
                    $this.__setStatus("ERROR", Html5QrcodeScanner.STATUS_WARNING);
                    $this.__setHeaderMessage(error, Html5QrcodeScanner.STATUS_WARNING);
                    $this.qrCodeErrorCallback(error);
                });
        });
    }

    __renderCameraSelection(cameras) {
        const $this = this;
        const scpCameraScanRegion = document.getElementById(
            this.__getDashboardSectionCameraScanRegionId());
        scpCameraScanRegion.style.textAlign = "center";

        const cameraSelectionContainer = document.createElement("span");
        cameraSelectionContainer.innerHTML
            = `Select Camera (${cameras.length}) &nbsp;`;
        cameraSelectionContainer.style.marginRight = "10px";

        const cameraSelectionSelect = document.createElement("select");
        cameraSelectionSelect.id = this.__getCameraSelectionId();
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
        cameraActionStartButton.innerHTML = "Start Scanning";
        cameraActionContainer.appendChild(cameraActionStartButton);

        const cameraActionStopButton = document.createElement("button");
        cameraActionStopButton.innerHTML = "Stop Scanning";
        cameraActionStopButton.style.display = "none";
        cameraActionStopButton.disabled = true;
        cameraActionContainer.appendChild(cameraActionStopButton);

        scpCameraScanRegion.appendChild(cameraActionContainer);

        cameraActionStartButton.addEventListener('click', _ => {
            cameraSelectionSelect.disabled = true;
            cameraActionStartButton.disabled = true;
            $this._showHideScanTypeSwapLink(false);

            const config = $this.config ?
                $this.config : { fps: 10, qrbox: 250 };

            const cameraId = cameraSelectionSelect.value;
            $this.html5Qrcode.start(
                cameraId,
                config,
                $this.qrCodeSuccessCallback,
                $this.qrCodeErrorCallback)
                .then(_ => {
                    cameraActionStopButton.disabled = false;
                    cameraActionStopButton.style.display = "inline-block";
                    cameraActionStartButton.style.display = "none";
                    $this.__setStatus("Scanning");
                })
                .catch(error => {
                    $this._showHideScanTypeSwapLink(true);
                    cameraSelectionSelect.disabled = false;
                    cameraActionStartButton.disabled = false;
                    $this.__setStatus("IDLE");
                    $this.__setHeaderMessage(
                        error, Html5QrcodeScanner.STATUS_WARNING);
                });
        });

        cameraActionStopButton.addEventListener('click', _ => {
            cameraActionStopButton.disabled = true;
            $this.html5Qrcode.stop()
                .then(_ => {
                    $this._showHideScanTypeSwapLink(true);
                    cameraSelectionSelect.disabled = false;
                    cameraActionStartButton.disabled = false;
                    cameraActionStopButton.style.display = "none";
                    cameraActionStartButton.style.display = "inline-block";
                    $this.__setStatus("IDLE");
                    $this.__insertCameraScanImageToScanRegion();
                }).catch(error => {
                    cameraActionStopButton.disabled = false;
                    $this.__setStatus("ERROR", Html5QrcodeScanner.STATUS_WARNING);
                    $this.__setHeaderMessage(
                        error, Html5QrcodeScanner.STATUS_WARNING);
                });
        });
    }

    __createSectionSwap() {
        const $this = this;
        const TEXT_IF_CAMERA_SCAN_SELECTED
            = "Scan an Image File";
        const TEXT_IF_FILE_SCAN_SELECTED
            = "Scan using camera directly";

        const section = document.getElementById(this.__getDashboardSectionId());
        const switchContainer = document.createElement("div");
        switchContainer.style.textAlign = "center";
        const swithToFileBasedLink = document.createElement("a");
        swithToFileBasedLink.style.textDecoration = "underline";
        swithToFileBasedLink.id = this.__getDashboardSectionSwapLinkId();
        swithToFileBasedLink.innerHTML
            = this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA
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
            $this.__setStatus("IDLE");
            $this.__resetHeaderMessage();
            $this.__getFileScanInput().value = "";

            $this.sectionSwapAllowed = false;
            if ($this.currentScanType == Html5QrcodeScanner.SCAN_TYPE_CAMERA) {
                // swap to file
                $this.__clearScanRegion();
                $this.__getFileScanInput().disabled = false;
                $this.__getCameraScanRegion().style.display = "none";
                $this.__getFileScanRegion().style.display = "block";
                swithToFileBasedLink.innerHTML = TEXT_IF_FILE_SCAN_SELECTED;
                $this.currentScanType = Html5QrcodeScanner.SCAN_TYPE_FILE;
                $this.__insertFileScanImageToScanRegion();
            } else {
                // swap to camera based scanning
                $this.__clearScanRegion();
                $this.__getFileScanInput().disabled = true;
                $this.__getCameraScanRegion().style.display = "block";
                $this.__getFileScanRegion().style.display = "none";
                swithToFileBasedLink.innerHTML = TEXT_IF_CAMERA_SCAN_SELECTED;
                $this.currentScanType = Html5QrcodeScanner.SCAN_TYPE_CAMERA;
                $this.__insertCameraScanImageToScanRegion();
            }

            $this.sectionSwapAllowed = true;
        });
        switchContainer.appendChild(swithToFileBasedLink);
        section.appendChild(switchContainer);
    }

    __setStatus(statusText, statusClass) {
        if (!statusClass) {
            statusClass = Html5QrcodeScanner.STATUS_DEFAULT;
        }
        const statusSpan = document.getElementById(this.__getStatusSpanId());
        statusSpan.innerHTML = statusText;

        switch (statusClass) {
            case Html5QrcodeScanner.STATUS_SUCCESS:
                statusSpan.style.background = "#6aaf5042";
                statusSpan.style.color = "#477735";
                break;
            case Html5QrcodeScanner.STATUS_WARNING:
                statusSpan.style.background = "#cb243124";
                statusSpan.style.color = "#cb2431";
                break;
            case Html5QrcodeScanner.STATUS_DEFAULT:
            default:
                statusSpan.style.background = "#eef";
                statusSpan.style.color = "rgb(17, 17, 17)";
                break;
        }
    }

    __resetHeaderMessage() {
        const messageDiv = document.getElementById(
            this.__getHeaderMessageContainerId());
        messageDiv.style.display = "none";
    }

    __setHeaderMessage(messageText, statusClass) {
        if (!statusClass) {
            statusClass = Html5QrcodeScanner.STATUS_DEFAULT;
        }
        const messageDiv = document.getElementById(
            this.__getHeaderMessageContainerId());
        messageDiv.innerHTML = messageText;
        messageDiv.style.display = "block";

        switch (statusClass) {
            case Html5QrcodeScanner.STATUS_SUCCESS:
                messageDiv.style.background = "#6aaf5042";
                messageDiv.style.color = "#477735";
                break;
            case Html5QrcodeScanner.STATUS_WARNING:
                messageDiv.style.background = "#cb243124";
                messageDiv.style.color = "#cb2431";
                break;
            case Html5QrcodeScanner.STATUS_DEFAULT:
            default:
                messageDiv.style.background = "#00000000";
                messageDiv.style.color = "rgb(17, 17, 17)";
                break;
        }
    }

    _showHideScanTypeSwapLink(shouldDisplay) {
        if (shouldDisplay !== true) {
            shouldDisplay = false;
        }

        this.sectionSwapAllowed = shouldDisplay;
        this.__getDashboardSectionSwapLink().style.display
            = shouldDisplay ? "inline-block" : "none";
    }

    __insertCameraScanImageToScanRegion() {
        const $this = this;
        const qrCodeScanRegion = document.getElementById(
            this.__getScanRegionId());

        if (this.cameraScanImage) {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild(this.cameraScanImage);
            return;
        }

        this.cameraScanImage = new Image;
        this.cameraScanImage.onload = _ => {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild($this.cameraScanImage);
        }
        this.cameraScanImage.width = 64;
        this.cameraScanImage.style.opacity = 0.3;
        this.cameraScanImage.src = Html5QrcodeScanner.ASSET_CAMERA_SCAN;
    }

    __insertFileScanImageToScanRegion() {
        const $this = this;
        const qrCodeScanRegion = document.getElementById(
            this.__getScanRegionId());

        if (this.fileScanImage) {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild(this.fileScanImage);
            return;
        }

        this.fileScanImage = new Image;
        this.fileScanImage.onload = _ => {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild($this.fileScanImage);
        }
        this.fileScanImage.width = 64;
        this.fileScanImage.style.opacity = 0.3;
        this.fileScanImage.src = Html5QrcodeScanner.ASSET_FILE_SCAN;
    }

    __clearScanRegion() {
        const qrCodeScanRegion = document.getElementById(
            this.__getScanRegionId());
        qrCodeScanRegion.innerHTML = "";
    }
    //#endregion

    //#region state getters
    __getDashboardSectionId() {
        return `${this.elementId}__dashboard_section`;
    }

    __getDashboardSectionCameraScanRegionId() {
        return `${this.elementId}__dashboard_section_csr`;
    }

    __getDashboardSectionFileScanRegionId() {
        return `${this.elementId}__dashboard_section_fsr`;
    }

    __getDashboardSectionSwapLinkId() {
        return `${this.elementId}__dashboard_section_swaplink`;
    }

    __getScanRegionId() {
        return `${this.elementId}__scan_region`;
    }

    __getDashboardId() {
        return `${this.elementId}__dashboard`;
    }

    __getFileScanInputId() {
        return `${this.elementId}__filescan_input`;
    }

    __getStatusSpanId() {
        return `${this.elementId}__status_span`;
    }

    __getHeaderMessageContainerId() {
        return `${this.elementId}__header_message`;
    }

    __getCameraSelectionId() {
        return `${this.elementId}__camera_selection`;
    }

    __getCameraScanRegion() {
        return document.getElementById(
            this.__getDashboardSectionCameraScanRegionId());
    }

    __getFileScanRegion() {
        return document.getElementById(
            this.__getDashboardSectionFileScanRegionId());
    }

    __getFileScanInput() {
        return document.getElementById(this.__getFileScanInputId());
    }

    __getDashboardSectionSwapLink() {
        return document.getElementById(this.__getDashboardSectionSwapLinkId());
    }
    //#endregion
}
