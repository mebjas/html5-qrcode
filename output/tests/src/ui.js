"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibraryInfoContainer = void 0;
const image_assets_1 = require("./image-assets");
const strings_1 = require("./strings");
class LibraryInfoDiv {
    constructor() {
        this.infoDiv = document.createElement("div");
    }
    renderInto(parent) {
        this.infoDiv.style.position = "absolute";
        this.infoDiv.style.top = "10px";
        this.infoDiv.style.right = "10px";
        this.infoDiv.style.zIndex = "2";
        this.infoDiv.style.display = "none";
        this.infoDiv.style.padding = "5pt";
        this.infoDiv.style.border = "1px solid #171717";
        this.infoDiv.style.fontSize = "10pt";
        this.infoDiv.style.background = "rgb(0 0 0 / 69%)";
        this.infoDiv.style.borderRadius = "5px";
        this.infoDiv.style.textAlign = "center";
        this.infoDiv.style.fontWeight = "400";
        this.infoDiv.style.color = "white";
        this.infoDiv.innerText = strings_1.LibraryInfoStrings.poweredBy();
        const projectLink = document.createElement("a");
        projectLink.innerText = "ScanApp";
        projectLink.href = "https://scanapp.org";
        projectLink.target = "new";
        projectLink.style.color = "white";
        this.infoDiv.appendChild(projectLink);
        const breakElemFirst = document.createElement("br");
        const breakElemSecond = document.createElement("br");
        this.infoDiv.appendChild(breakElemFirst);
        this.infoDiv.appendChild(breakElemSecond);
        const reportIssueLink = document.createElement("a");
        reportIssueLink.innerText = strings_1.LibraryInfoStrings.reportIssues();
        reportIssueLink.href = "https://github.com/mebjas/html5-qrcode/issues";
        reportIssueLink.target = "new";
        reportIssueLink.style.color = "white";
        this.infoDiv.appendChild(reportIssueLink);
        parent.appendChild(this.infoDiv);
    }
    show() {
        this.infoDiv.style.display = "block";
    }
    hide() {
        this.infoDiv.style.display = "none";
    }
}
class LibraryInfoIcon {
    constructor(onTapIn, onTapOut) {
        this.isShowingInfoIcon = true;
        this.onTapIn = onTapIn;
        this.onTapOut = onTapOut;
        this.infoIcon = document.createElement("img");
    }
    renderInto(parent) {
        this.infoIcon.alt = "Info icon";
        this.infoIcon.src = image_assets_1.ASSET_INFO_ICON_16PX;
        this.infoIcon.style.position = "absolute";
        this.infoIcon.style.top = "4px";
        this.infoIcon.style.right = "4px";
        this.infoIcon.style.opacity = "0.6";
        this.infoIcon.style.cursor = "pointer";
        this.infoIcon.style.zIndex = "2";
        this.infoIcon.style.width = "16px";
        this.infoIcon.style.height = "16px";
        this.infoIcon.onmouseover = (_) => this.onHoverIn();
        this.infoIcon.onmouseout = (_) => this.onHoverOut();
        this.infoIcon.onclick = (_) => this.onClick();
        parent.appendChild(this.infoIcon);
    }
    onHoverIn() {
        if (this.isShowingInfoIcon) {
            this.infoIcon.style.opacity = "1";
        }
    }
    onHoverOut() {
        if (this.isShowingInfoIcon) {
            this.infoIcon.style.opacity = "0.6";
        }
    }
    onClick() {
        if (this.isShowingInfoIcon) {
            this.isShowingInfoIcon = false;
            this.onTapIn();
            this.infoIcon.src = image_assets_1.ASSET_CLOSE_ICON_16PX;
            this.infoIcon.style.opacity = "1";
        }
        else {
            this.isShowingInfoIcon = true;
            this.onTapOut();
            this.infoIcon.src = image_assets_1.ASSET_INFO_ICON_16PX;
            this.infoIcon.style.opacity = "0.6";
        }
    }
}
class LibraryInfoContainer {
    constructor() {
        this.infoDiv = new LibraryInfoDiv();
        this.infoIcon = new LibraryInfoIcon(() => {
            this.infoDiv.show();
        }, () => {
            this.infoDiv.hide();
        });
    }
    renderInto(parent) {
        this.infoDiv.renderInto(parent);
        this.infoIcon.renderInto(parent);
    }
}
exports.LibraryInfoContainer = LibraryInfoContainer;
//# sourceMappingURL=ui.js.map