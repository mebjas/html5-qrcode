/**
 * @fileoverview
 * All structured UI classes.
 * 
 * TODO(mebjas): Migrate all UI components to modular UI classes so they are
 * easy to improve.
 * TODO(mebjas): Add tests for all UI components.
 * @author mebjas <minhazav@gmail.com>
 */

import { ASSET_CLOSE_ICON_16PX, ASSET_INFO_ICON_16PX } from "./image-assets";

import { LibraryInfoStrings } from "./strings";

type OnClickListener0 = () => void;

//#region Info Icon + Div

class LibraryInfoDiv {
    private infoDiv: HTMLDivElement;

    constructor() {
        this.infoDiv = document.createElement("div");
    }

    public renderInto(parent: HTMLElement) {
        this.infoDiv.style.position = "absolute";
        this.infoDiv.style.top = "10px";
        this.infoDiv.style.right = "10px";
        this.infoDiv.style.zIndex = "2";
        this.infoDiv.style.display = "none";
        this.infoDiv.style.padding = "5pt";
        this.infoDiv.style.border = "1px solid silver";
        this.infoDiv.style.fontSize = "10pt";
        this.infoDiv.style.background = "rgb(248 248 248)";

        this.infoDiv.innerText = LibraryInfoStrings.builtUsing();
        const projectLink = document.createElement("a");
        projectLink.innerText = "html5-qrcode";
        projectLink.href = "https://github.com/mebjas/html5-qrcode";
        projectLink.target = "new";
        this.infoDiv.appendChild(projectLink);

        const breakElemFirst = document.createElement("br");
        const breakElemSecond = document.createElement("br");
        this.infoDiv.appendChild(breakElemFirst);
        this.infoDiv.appendChild(breakElemSecond);

        const reportIssueLink = document.createElement("a");
        reportIssueLink.innerText = LibraryInfoStrings.reportIssues();
        reportIssueLink.href = "https://github.com/mebjas/html5-qrcode/issues";
        reportIssueLink.target = "new";
        this.infoDiv.appendChild(reportIssueLink);

        parent.appendChild(this.infoDiv);
    }

    public show() {
        this.infoDiv.style.display = "block";
    }

    public hide() {
        this.infoDiv.style.display = "none";
    }
}

class LibraryInfoIcon {

    private infoIcon: HTMLImageElement;
    private onTapIn: OnClickListener0;
    private onTapOut: OnClickListener0;
    private isShowingInfoIcon: boolean = true;

    constructor(onTapIn: OnClickListener0, onTapOut: OnClickListener0) {
        this.onTapIn = onTapIn;
        this.onTapOut = onTapOut;

        this.infoIcon = document.createElement("img");
    }
    
    public renderInto(parent: HTMLElement) {
        this.infoIcon.src = ASSET_INFO_ICON_16PX;
        this.infoIcon.style.position = "absolute";
        this.infoIcon.style.top = "4px";
        this.infoIcon.style.right = "4px";
        this.infoIcon.style.opacity = "0.6";
        this.infoIcon.style.cursor = "pointer";
        this.infoIcon.style.zIndex = "2";

        this.infoIcon.onmouseover = (_) => this.onHoverIn();
        this.infoIcon.onmouseout = (_) => this.onHoverOut();
        this.infoIcon.onclick = (_) => this.onClick();

        parent.appendChild(this.infoIcon);
    }

    private onHoverIn() {
        if (this.isShowingInfoIcon) {
            this.infoIcon.style.opacity = "1";
        }
    }

    private onHoverOut() {
        if (this.isShowingInfoIcon) {
            this.infoIcon.style.opacity = "0.6";
        }
    }

    private onClick() {
        if (this.isShowingInfoIcon) {
            this.isShowingInfoIcon = false;
            this.onTapIn();
            this.infoIcon.src = ASSET_CLOSE_ICON_16PX;
            this.infoIcon.style.opacity = "1";
        } else {
            this.isShowingInfoIcon = true;
            this.onTapOut();
            this.infoIcon.src = ASSET_INFO_ICON_16PX;
            this.infoIcon.style.opacity = "0.6";
        }
    }
}

export class LibraryInfoContainer {

    private infoDiv: LibraryInfoDiv;
    private infoIcon: LibraryInfoIcon;

    constructor() {
        this.infoDiv = new LibraryInfoDiv();
        this.infoIcon = new LibraryInfoIcon(() => {
            this.infoDiv.show();
        }, () => {
            this.infoDiv.hide();
        });
    }
    
    public renderInto(parent: HTMLElement) {
        this.infoDiv.renderInto(parent);
        this.infoIcon.renderInto(parent);
    }
}
//#endregion
