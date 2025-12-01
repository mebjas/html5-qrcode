"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Html5QrcodeScanner = void 0;
const core_1 = require("./core");
const html5_qrcode_1 = require("./html5-qrcode");
const strings_1 = require("./strings");
const image_assets_1 = require("./image-assets");
const storage_1 = require("./storage");
const ui_1 = require("./ui");
const permissions_1 = require("./camera/permissions");
const scan_type_selector_1 = require("./ui/scanner/scan-type-selector");
const torch_button_1 = require("./ui/scanner/torch-button");
const file_selection_ui_1 = require("./ui/scanner/file-selection-ui");
const base_1 = require("./ui/scanner/base");
const camera_selection_ui_1 = require("./ui/scanner/camera-selection-ui");
const camera_zoom_ui_1 = require("./ui/scanner/camera-zoom-ui");
var Html5QrcodeScannerStatus;
(function (Html5QrcodeScannerStatus) {
    Html5QrcodeScannerStatus[Html5QrcodeScannerStatus["STATUS_DEFAULT"] = 0] = "STATUS_DEFAULT";
    Html5QrcodeScannerStatus[Html5QrcodeScannerStatus["STATUS_SUCCESS"] = 1] = "STATUS_SUCCESS";
    Html5QrcodeScannerStatus[Html5QrcodeScannerStatus["STATUS_WARNING"] = 2] = "STATUS_WARNING";
    Html5QrcodeScannerStatus[Html5QrcodeScannerStatus["STATUS_REQUESTING_PERMISSION"] = 3] = "STATUS_REQUESTING_PERMISSION";
})(Html5QrcodeScannerStatus || (Html5QrcodeScannerStatus = {}));
function toHtml5QrcodeCameraScanConfig(config) {
    return {
        fps: config.fps,
        qrbox: config.qrbox,
        aspectRatio: config.aspectRatio,
        disableFlip: config.disableFlip,
        videoConstraints: config.videoConstraints
    };
}
function toHtml5QrcodeFullConfig(config, verbose) {
    return {
        formatsToSupport: config.formatsToSupport,
        useBarCodeDetectorIfSupported: config.useBarCodeDetectorIfSupported,
        experimentalFeatures: config.experimentalFeatures,
        verbose: verbose
    };
}
class Html5QrcodeScanner {
    constructor(elementId, config, verbose) {
        this.lastMatchFound = null;
        this.cameraScanImage = null;
        this.fileScanImage = null;
        this.fileSelectionUi = null;
        this.elementId = elementId;
        this.config = this.createConfig(config);
        this.verbose = verbose === true;
        if (!document.getElementById(elementId)) {
            throw `HTML Element with id=${elementId} not found`;
        }
        this.scanTypeSelector = new scan_type_selector_1.ScanTypeSelector(this.config.supportedScanTypes);
        this.currentScanType = this.scanTypeSelector.getDefaultScanType();
        this.sectionSwapAllowed = true;
        this.logger = new core_1.BaseLoggger(this.verbose);
        this.persistedDataManager = new storage_1.PersistedDataManager();
        if (config.rememberLastUsedCamera !== true) {
            this.persistedDataManager.reset();
        }
    }
    render(qrCodeSuccessCallback, qrCodeErrorCallback) {
        this.lastMatchFound = null;
        this.qrCodeSuccessCallback
            = (decodedText, result) => {
                if (qrCodeSuccessCallback) {
                    qrCodeSuccessCallback(decodedText, result);
                }
                else {
                    if (this.lastMatchFound === decodedText) {
                        return;
                    }
                    this.lastMatchFound = decodedText;
                    this.setHeaderMessage(strings_1.Html5QrcodeScannerStrings.lastMatch(decodedText), Html5QrcodeScannerStatus.STATUS_SUCCESS);
                }
            };
        this.qrCodeErrorCallback =
            (errorMessage, error) => {
                if (qrCodeErrorCallback) {
                    qrCodeErrorCallback(errorMessage, error);
                }
            };
        const container = document.getElementById(this.elementId);
        if (!container) {
            throw `HTML Element with id=${this.elementId} not found`;
        }
        container.innerHTML = "";
        this.createBasicLayout(container);
        this.html5Qrcode = new html5_qrcode_1.Html5Qrcode(this.getScanRegionId(), toHtml5QrcodeFullConfig(this.config, this.verbose));
    }
    pause(shouldPauseVideo) {
        if ((0, core_1.isNullOrUndefined)(shouldPauseVideo) || shouldPauseVideo !== true) {
            shouldPauseVideo = false;
        }
        this.getHtml5QrcodeOrFail().pause(shouldPauseVideo);
    }
    resume() {
        this.getHtml5QrcodeOrFail().resume();
    }
    getState() {
        return this.getHtml5QrcodeOrFail().getState();
    }
    clear() {
        const emptyHtmlContainer = () => {
            const mainContainer = document.getElementById(this.elementId);
            if (mainContainer) {
                mainContainer.innerHTML = "";
                this.resetBasicLayout(mainContainer);
            }
        };
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
                            this.logger.logError("Unable to stop qrcode scanner", error);
                        }
                        reject(error);
                    });
                }
                else {
                    this.html5Qrcode.clear();
                    emptyHtmlContainer();
                    resolve();
                }
            });
        }
        return Promise.resolve();
    }
    getRunningTrackCapabilities() {
        return this.getHtml5QrcodeOrFail().getRunningTrackCapabilities();
    }
    getRunningTrackSettings() {
        return this.getHtml5QrcodeOrFail().getRunningTrackSettings();
    }
    applyVideoConstraints(videoConstaints) {
        return this.getHtml5QrcodeOrFail().applyVideoConstraints(videoConstaints);
    }
    getHtml5QrcodeOrFail() {
        if (!this.html5Qrcode) {
            throw "Code scanner not initialized.";
        }
        return this.html5Qrcode;
    }
    createConfig(config) {
        if (config) {
            if (!config.fps) {
                config.fps = core_1.Html5QrcodeConstants.SCAN_DEFAULT_FPS;
            }
            if (config.rememberLastUsedCamera !== (!core_1.Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED)) {
                config.rememberLastUsedCamera
                    = core_1.Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED;
            }
            if (!config.supportedScanTypes) {
                config.supportedScanTypes
                    = core_1.Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE;
            }
            return config;
        }
        return {
            fps: core_1.Html5QrcodeConstants.SCAN_DEFAULT_FPS,
            rememberLastUsedCamera: core_1.Html5QrcodeConstants.DEFAULT_REMEMBER_LAST_CAMERA_USED,
            supportedScanTypes: core_1.Html5QrcodeConstants.DEFAULT_SUPPORTED_SCAN_TYPE
        };
    }
    createBasicLayout(parent) {
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
        if (scan_type_selector_1.ScanTypeSelector.isCameraScanType(this.currentScanType)) {
            this.insertCameraScanImageToScanRegion();
        }
        else {
            this.insertFileScanImageToScanRegion();
        }
        const qrCodeDashboard = document.createElement("div");
        const dashboardId = this.getDashboardId();
        qrCodeDashboard.id = dashboardId;
        qrCodeDashboard.style.width = "100%";
        parent.appendChild(qrCodeDashboard);
        this.setupInitialDashboard(qrCodeDashboard);
    }
    resetBasicLayout(mainContainer) {
        mainContainer.style.border = "none";
    }
    setupInitialDashboard(dashboard) {
        this.createSection(dashboard);
        this.createSectionControlPanel();
        if (this.scanTypeSelector.hasMoreThanOneScanType()) {
            this.createSectionSwap();
        }
    }
    createHeader(dashboard) {
        const header = document.createElement("div");
        header.style.textAlign = "left";
        header.style.margin = "0px";
        dashboard.appendChild(header);
        let libraryInfo = new ui_1.LibraryInfoContainer();
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
    createSection(dashboard) {
        const section = document.createElement("div");
        section.id = this.getDashboardSectionId();
        section.style.width = "100%";
        section.style.padding = "10px 0px 10px 0px";
        section.style.textAlign = "left";
        dashboard.appendChild(section);
    }
    createCameraListUi(scpCameraScanRegion, requestPermissionContainer, requestPermissionButton) {
        const $this = this;
        $this.showHideScanTypeSwapLink(false);
        $this.setHeaderMessage(strings_1.Html5QrcodeScannerStrings.cameraPermissionRequesting());
        const createPermissionButtonIfNotExists = () => {
            if (!requestPermissionButton) {
                $this.createPermissionButton(scpCameraScanRegion, requestPermissionContainer);
            }
        };
        html5_qrcode_1.Html5Qrcode.getCameras().then((cameras) => {
            $this.persistedDataManager.setHasPermission(true);
            $this.showHideScanTypeSwapLink(true);
            $this.resetHeaderMessage();
            if (cameras && cameras.length > 0) {
                scpCameraScanRegion.removeChild(requestPermissionContainer);
                $this.renderCameraSelection(cameras);
            }
            else {
                $this.setHeaderMessage(strings_1.Html5QrcodeScannerStrings.noCameraFound(), Html5QrcodeScannerStatus.STATUS_WARNING);
                createPermissionButtonIfNotExists();
            }
        }).catch((error) => {
            $this.persistedDataManager.setHasPermission(false);
            if (requestPermissionButton) {
                requestPermissionButton.disabled = false;
            }
            else {
                createPermissionButtonIfNotExists();
            }
            $this.setHeaderMessage(error, Html5QrcodeScannerStatus.STATUS_WARNING);
            $this.showHideScanTypeSwapLink(true);
        });
    }
    createPermissionButton(scpCameraScanRegion, requestPermissionContainer) {
        const $this = this;
        const requestPermissionButton = base_1.BaseUiElementFactory
            .createElement("button", this.getCameraPermissionButtonId());
        requestPermissionButton.innerText
            = strings_1.Html5QrcodeScannerStrings.cameraPermissionTitle();
        requestPermissionButton.addEventListener("click", function () {
            requestPermissionButton.disabled = true;
            $this.createCameraListUi(scpCameraScanRegion, requestPermissionContainer, requestPermissionButton);
        });
        requestPermissionContainer.appendChild(requestPermissionButton);
    }
    createPermissionsUi(scpCameraScanRegion, requestPermissionContainer) {
        const $this = this;
        if (scan_type_selector_1.ScanTypeSelector.isCameraScanType(this.currentScanType)
            && this.persistedDataManager.hasCameraPermissions()) {
            permissions_1.CameraPermissions.hasPermissions().then((hasPermissions) => {
                if (hasPermissions) {
                    $this.createCameraListUi(scpCameraScanRegion, requestPermissionContainer);
                }
                else {
                    $this.persistedDataManager.setHasPermission(false);
                    $this.createPermissionButton(scpCameraScanRegion, requestPermissionContainer);
                }
            }).catch((_) => {
                $this.persistedDataManager.setHasPermission(false);
                $this.createPermissionButton(scpCameraScanRegion, requestPermissionContainer);
            });
            return;
        }
        this.createPermissionButton(scpCameraScanRegion, requestPermissionContainer);
    }
    createSectionControlPanel() {
        const section = document.getElementById(this.getDashboardSectionId());
        const sectionControlPanel = document.createElement("div");
        section.appendChild(sectionControlPanel);
        const scpCameraScanRegion = document.createElement("div");
        scpCameraScanRegion.id = this.getDashboardSectionCameraScanRegionId();
        scpCameraScanRegion.style.display
            = scan_type_selector_1.ScanTypeSelector.isCameraScanType(this.currentScanType)
                ? "block" : "none";
        sectionControlPanel.appendChild(scpCameraScanRegion);
        const requestPermissionContainer = document.createElement("div");
        requestPermissionContainer.style.textAlign = "center";
        scpCameraScanRegion.appendChild(requestPermissionContainer);
        if (this.scanTypeSelector.isCameraScanRequired()) {
            this.createPermissionsUi(scpCameraScanRegion, requestPermissionContainer);
        }
        this.renderFileScanUi(sectionControlPanel);
    }
    renderFileScanUi(parent) {
        let showOnRender = scan_type_selector_1.ScanTypeSelector.isFileScanType(this.currentScanType);
        const $this = this;
        let onFileSelected = (file) => {
            if (!$this.html5Qrcode) {
                throw "html5Qrcode not defined";
            }
            if (!scan_type_selector_1.ScanTypeSelector.isFileScanType($this.currentScanType)) {
                return;
            }
            $this.setHeaderMessage(strings_1.Html5QrcodeScannerStrings.loadingImage());
            $this.html5Qrcode.scanFileV2(file, true)
                .then((html5qrcodeResult) => {
                $this.resetHeaderMessage();
                $this.qrCodeSuccessCallback(html5qrcodeResult.decodedText, html5qrcodeResult);
            })
                .catch((error) => {
                $this.setHeaderMessage(error, Html5QrcodeScannerStatus.STATUS_WARNING);
                $this.qrCodeErrorCallback(error, core_1.Html5QrcodeErrorFactory.createFrom(error));
            });
        };
        this.fileSelectionUi = file_selection_ui_1.FileSelectionUi.create(parent, showOnRender, onFileSelected);
    }
    renderCameraSelection(cameras) {
        const $this = this;
        const scpCameraScanRegion = document.getElementById(this.getDashboardSectionCameraScanRegionId());
        scpCameraScanRegion.style.textAlign = "center";
        let cameraZoomUi = camera_zoom_ui_1.CameraZoomUi.create(scpCameraScanRegion, false);
        const renderCameraZoomUiIfSupported = (cameraCapabilities) => {
            let zoomCapability = cameraCapabilities.zoomFeature();
            if (!zoomCapability.isSupported()) {
                return;
            }
            cameraZoomUi.setOnCameraZoomValueChangeCallback((zoomValue) => {
                zoomCapability.apply(zoomValue);
            });
            let defaultZoom = 1;
            if (this.config.defaultZoomValueIfSupported) {
                defaultZoom = this.config.defaultZoomValueIfSupported;
            }
            defaultZoom = (0, core_1.clip)(defaultZoom, zoomCapability.min(), zoomCapability.max());
            cameraZoomUi.setValues(zoomCapability.min(), zoomCapability.max(), defaultZoom, zoomCapability.step());
            cameraZoomUi.show();
        };
        let cameraSelectUi = camera_selection_ui_1.CameraSelectionUi.create(scpCameraScanRegion, cameras);
        const cameraActionContainer = document.createElement("span");
        const cameraActionStartButton = base_1.BaseUiElementFactory.createElement("button", base_1.PublicUiElementIdAndClasses.CAMERA_START_BUTTON_ID);
        cameraActionStartButton.innerText
            = strings_1.Html5QrcodeScannerStrings.scanButtonStartScanningText();
        cameraActionContainer.appendChild(cameraActionStartButton);
        const cameraActionStopButton = base_1.BaseUiElementFactory.createElement("button", base_1.PublicUiElementIdAndClasses.CAMERA_STOP_BUTTON_ID);
        cameraActionStopButton.innerText
            = strings_1.Html5QrcodeScannerStrings.scanButtonStopScanningText();
        cameraActionStopButton.style.display = "none";
        cameraActionStopButton.disabled = true;
        cameraActionContainer.appendChild(cameraActionStopButton);
        let torchButton;
        const createAndShowTorchButtonIfSupported = (cameraCapabilities) => {
            if (!cameraCapabilities.torchFeature().isSupported()) {
                if (torchButton) {
                    torchButton.hide();
                }
                return;
            }
            if (!torchButton) {
                torchButton = torch_button_1.TorchButton.create(cameraActionContainer, cameraCapabilities.torchFeature(), { display: "none", marginLeft: "5px" }, (errorMessage) => {
                    $this.setHeaderMessage(errorMessage, Html5QrcodeScannerStatus.STATUS_WARNING);
                });
            }
            else {
                torchButton.updateTorchCapability(cameraCapabilities.torchFeature());
            }
            torchButton.show();
        };
        scpCameraScanRegion.appendChild(cameraActionContainer);
        const resetCameraActionStartButton = (shouldShow) => {
            if (!shouldShow) {
                cameraActionStartButton.style.display = "none";
            }
            cameraActionStartButton.innerText
                = strings_1.Html5QrcodeScannerStrings
                    .scanButtonStartScanningText();
            cameraActionStartButton.style.opacity = "1";
            cameraActionStartButton.disabled = false;
            if (shouldShow) {
                cameraActionStartButton.style.display = "inline-block";
            }
        };
        cameraActionStartButton.addEventListener("click", (_) => {
            cameraActionStartButton.innerText
                = strings_1.Html5QrcodeScannerStrings.scanButtonScanningStarting();
            cameraSelectUi.disable();
            cameraActionStartButton.disabled = true;
            cameraActionStartButton.style.opacity = "0.5";
            if (this.scanTypeSelector.hasMoreThanOneScanType()) {
                $this.showHideScanTypeSwapLink(false);
            }
            $this.resetHeaderMessage();
            const cameraId = cameraSelectUi.getValue();
            $this.persistedDataManager.setLastUsedCameraId(cameraId);
            $this.html5Qrcode.start(cameraId, toHtml5QrcodeCameraScanConfig($this.config), $this.qrCodeSuccessCallback, $this.qrCodeErrorCallback)
                .then((_) => {
                cameraActionStopButton.disabled = false;
                cameraActionStopButton.style.display = "inline-block";
                resetCameraActionStartButton(false);
                const cameraCapabilities = $this.html5Qrcode.getRunningTrackCameraCapabilities();
                if (this.config.showTorchButtonIfSupported === true) {
                    createAndShowTorchButtonIfSupported(cameraCapabilities);
                }
                if (this.config.showZoomSliderIfSupported === true) {
                    renderCameraZoomUiIfSupported(cameraCapabilities);
                }
            })
                .catch((error) => {
                $this.showHideScanTypeSwapLink(true);
                cameraSelectUi.enable();
                resetCameraActionStartButton(true);
                $this.setHeaderMessage(error, Html5QrcodeScannerStatus.STATUS_WARNING);
            });
        });
        if (cameraSelectUi.hasSingleItem()) {
            cameraActionStartButton.click();
        }
        cameraActionStopButton.addEventListener("click", (_) => {
            if (!$this.html5Qrcode) {
                throw "html5Qrcode not defined";
            }
            cameraActionStopButton.disabled = true;
            $this.html5Qrcode.stop()
                .then((_) => {
                if (this.scanTypeSelector.hasMoreThanOneScanType()) {
                    $this.showHideScanTypeSwapLink(true);
                }
                cameraSelectUi.enable();
                cameraActionStartButton.disabled = false;
                cameraActionStopButton.style.display = "none";
                cameraActionStartButton.style.display = "inline-block";
                if (torchButton) {
                    torchButton.reset();
                    torchButton.hide();
                }
                cameraZoomUi.removeOnCameraZoomValueChangeCallback();
                cameraZoomUi.hide();
                $this.insertCameraScanImageToScanRegion();
            }).catch((error) => {
                cameraActionStopButton.disabled = false;
                $this.setHeaderMessage(error, Html5QrcodeScannerStatus.STATUS_WARNING);
            });
        });
        if ($this.persistedDataManager.getLastUsedCameraId()) {
            const cameraId = $this.persistedDataManager.getLastUsedCameraId();
            if (cameraSelectUi.hasValue(cameraId)) {
                cameraSelectUi.setValue(cameraId);
                cameraActionStartButton.click();
            }
            else {
                $this.persistedDataManager.resetLastUsedCameraId();
            }
        }
    }
    createSectionSwap() {
        const $this = this;
        const TEXT_IF_CAMERA_SCAN_SELECTED = strings_1.Html5QrcodeScannerStrings.textIfCameraScanSelected();
        const TEXT_IF_FILE_SCAN_SELECTED = strings_1.Html5QrcodeScannerStrings.textIfFileScanSelected();
        const section = document.getElementById(this.getDashboardSectionId());
        const switchContainer = document.createElement("div");
        switchContainer.style.textAlign = "center";
        const switchScanTypeLink = base_1.BaseUiElementFactory.createElement("span", this.getDashboardSectionSwapLinkId());
        switchScanTypeLink.style.textDecoration = "underline";
        switchScanTypeLink.style.cursor = "pointer";
        switchScanTypeLink.innerText
            = scan_type_selector_1.ScanTypeSelector.isCameraScanType(this.currentScanType)
                ? TEXT_IF_CAMERA_SCAN_SELECTED : TEXT_IF_FILE_SCAN_SELECTED;
        switchScanTypeLink.addEventListener("click", function () {
            if (!$this.sectionSwapAllowed) {
                if ($this.verbose) {
                    $this.logger.logError("Section swap called when not allowed");
                }
                return;
            }
            $this.resetHeaderMessage();
            $this.fileSelectionUi.resetValue();
            $this.sectionSwapAllowed = false;
            if (scan_type_selector_1.ScanTypeSelector.isCameraScanType($this.currentScanType)) {
                $this.clearScanRegion();
                $this.getCameraScanRegion().style.display = "none";
                $this.fileSelectionUi.show();
                switchScanTypeLink.innerText = TEXT_IF_FILE_SCAN_SELECTED;
                $this.currentScanType = core_1.Html5QrcodeScanType.SCAN_TYPE_FILE;
                $this.insertFileScanImageToScanRegion();
            }
            else {
                $this.clearScanRegion();
                $this.getCameraScanRegion().style.display = "block";
                $this.fileSelectionUi.hide();
                switchScanTypeLink.innerText = TEXT_IF_CAMERA_SCAN_SELECTED;
                $this.currentScanType = core_1.Html5QrcodeScanType.SCAN_TYPE_CAMERA;
                $this.insertCameraScanImageToScanRegion();
                $this.startCameraScanIfPermissionExistsOnSwap();
            }
            $this.sectionSwapAllowed = true;
        });
        switchContainer.appendChild(switchScanTypeLink);
        section.appendChild(switchContainer);
    }
    startCameraScanIfPermissionExistsOnSwap() {
        const $this = this;
        if (this.persistedDataManager.hasCameraPermissions()) {
            permissions_1.CameraPermissions.hasPermissions().then((hasPermissions) => {
                if (hasPermissions) {
                    let permissionButton = document.getElementById($this.getCameraPermissionButtonId());
                    if (!permissionButton) {
                        this.logger.logError("Permission button not found, fail;");
                        throw "Permission button not found";
                    }
                    permissionButton.click();
                }
                else {
                    $this.persistedDataManager.setHasPermission(false);
                }
            }).catch((_) => {
                $this.persistedDataManager.setHasPermission(false);
            });
            return;
        }
    }
    resetHeaderMessage() {
        const messageDiv = document.getElementById(this.getHeaderMessageContainerId());
        messageDiv.style.display = "none";
    }
    setHeaderMessage(messageText, scannerStatus) {
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
    showHideScanTypeSwapLink(shouldDisplay) {
        if (this.scanTypeSelector.hasMoreThanOneScanType()) {
            if (shouldDisplay !== true) {
                shouldDisplay = false;
            }
            this.sectionSwapAllowed = shouldDisplay;
            this.getDashboardSectionSwapLink().style.display
                = shouldDisplay ? "inline-block" : "none";
        }
    }
    insertCameraScanImageToScanRegion() {
        const $this = this;
        const qrCodeScanRegion = document.getElementById(this.getScanRegionId());
        if (this.cameraScanImage) {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild(this.cameraScanImage);
            return;
        }
        this.cameraScanImage = new Image;
        this.cameraScanImage.onload = (_) => {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild($this.cameraScanImage);
        };
        this.cameraScanImage.width = 64;
        this.cameraScanImage.style.opacity = "0.8";
        this.cameraScanImage.src = image_assets_1.ASSET_CAMERA_SCAN;
        this.cameraScanImage.alt = strings_1.Html5QrcodeScannerStrings.cameraScanAltText();
    }
    insertFileScanImageToScanRegion() {
        const $this = this;
        const qrCodeScanRegion = document.getElementById(this.getScanRegionId());
        if (this.fileScanImage) {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild(this.fileScanImage);
            return;
        }
        this.fileScanImage = new Image;
        this.fileScanImage.onload = (_) => {
            qrCodeScanRegion.innerHTML = "<br>";
            qrCodeScanRegion.appendChild($this.fileScanImage);
        };
        this.fileScanImage.width = 64;
        this.fileScanImage.style.opacity = "0.8";
        this.fileScanImage.src = image_assets_1.ASSET_FILE_SCAN;
        this.fileScanImage.alt = strings_1.Html5QrcodeScannerStrings.fileScanAltText();
    }
    clearScanRegion() {
        const qrCodeScanRegion = document.getElementById(this.getScanRegionId());
        qrCodeScanRegion.innerHTML = "";
    }
    getDashboardSectionId() {
        return `${this.elementId}__dashboard_section`;
    }
    getDashboardSectionCameraScanRegionId() {
        return `${this.elementId}__dashboard_section_csr`;
    }
    getDashboardSectionSwapLinkId() {
        return base_1.PublicUiElementIdAndClasses.SCAN_TYPE_CHANGE_ANCHOR_ID;
    }
    getScanRegionId() {
        return `${this.elementId}__scan_region`;
    }
    getDashboardId() {
        return `${this.elementId}__dashboard`;
    }
    getHeaderMessageContainerId() {
        return `${this.elementId}__header_message`;
    }
    getCameraPermissionButtonId() {
        return base_1.PublicUiElementIdAndClasses.CAMERA_PERMISSION_BUTTON_ID;
    }
    getCameraScanRegion() {
        return document.getElementById(this.getDashboardSectionCameraScanRegionId());
    }
    getDashboardSectionSwapLink() {
        return document.getElementById(this.getDashboardSectionSwapLinkId());
    }
    getHeaderMessageDiv() {
        return document.getElementById(this.getHeaderMessageContainerId());
    }
}
exports.Html5QrcodeScanner = Html5QrcodeScanner;
//# sourceMappingURL=html5-qrcode-scanner.js.map