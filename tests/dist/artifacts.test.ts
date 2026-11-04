/**
 * Build-artifact smoke tests.
 *
 * Loads each distribution output and verifies the public API surface and
 * basic behavior stay intact. Requires dist/ to be built - run
 * `npm run build` before `npm run test:dist`.
 */

// Tests are compiled to CommonJS (tsconfig.test.json) but load ESM
// artifacts via dynamic import().
/* eslint-disable @typescript-eslint/no-var-requires */

import { expect } from "chai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { pathToFileURL } from "url";

// jsdom ships no bundled type declarations; @types/jsdom is not a
// dependency, so require it untyped.
const { JSDOM } = require("jsdom");

// TypeScript compiles `import()` to `require()` under the CommonJS
// test config; this keeps the native dynamic import.
const nativeImport = new Function(
    "specifier", "return import(specifier);") as (s: string) => Promise<any>;

const distDir = path.join(process.cwd(), "dist");

// Runtime surface of the entry (type-only exports are elided by tsc).
const CLASS_EXPORTS = ["Html5Qrcode", "Html5QrcodeScanner"];
const ENUM_EXPORTS = [
    "Html5QrcodeSupportedFormats",
    "Html5QrcodeScannerState",
    "Html5QrcodeScanType",
];

function assertApiSurface(mod: any, context: string) {
    for (const name of CLASS_EXPORTS) {
        expect(typeof mod[name], `${context}: ${name}`).to.equal("function");
    }
    for (const name of ENUM_EXPORTS) {
        expect(typeof mod[name], `${context}: ${name}`).to.equal("object");
    }
}

function assertEnumValues(mod: any, context: string) {
    expect(mod.Html5QrcodeSupportedFormats.QR_CODE,
        `${context}: QR_CODE`).to.equal(0);
    expect(mod.Html5QrcodeScannerState.NOT_STARTED,
        `${context}: NOT_STARTED`).to.equal(1);
}

function assertHtml5QrcodeBehavior(mod: any, context: string) {
    document.body.innerHTML = '<div id="smoke-reader"></div>';
    const reader = new mod.Html5Qrcode("smoke-reader");
    expect(reader.getState(),
        `${context}: initial state`).to.equal(
        mod.Html5QrcodeScannerState.NOT_STARTED);

    document.body.innerHTML = "";
    expect(() => new mod.Html5Qrcode("no-such-element"),
        `${context}: missing element should throw`).to.throw();
}

before(() => {
    if (!fs.existsSync(path.join(distDir, "cjs", "index.js"))) {
        throw new Error(
            "dist/ is not built. Run `npm run build` before `npm run test:dist`.");
    }
});

describe("dist/cjs (per-file output)", () => {
    it("exposes the public API surface", () => {
        const lib = require(path.join(distDir, "cjs", "index.js"));
        assertApiSurface(lib, "cjs");
        assertEnumValues(lib, "cjs");
    });

    it("constructs Html5Qrcode against a DOM element", () => {
        const lib = require(path.join(distDir, "cjs", "index.js"));
        assertHtml5QrcodeBehavior(lib, "cjs");
    });
});

describe("@zxing/library (external dependency)", () => {
    it("exposes the decoder surface html5-qrcode relies on", () => {
        const zxing = require("@zxing/library");
        for (const name of [
            "MultiFormatReader",
            "HTMLCanvasElementLuminanceSource",
            "HybridBinarizer",
            "BinaryBitmap",
        ]) {
            expect(typeof zxing[name], `zxing: ${name}`).to.equal("function");
        }
        expect(zxing.BarcodeFormat.QR_CODE).to.equal(11);
        expect(zxing.DecodeHintType.POSSIBLE_FORMATS).to.equal(2);
    });
});

describe("dist/html5-qrcode.esm.min.js (bundled ESM)", () => {
    // Node only treats the file as ESM with an .mjs extension because
    // dist/package.json has no "type" field.
    const tmpMjs = path.join(os.tmpdir(), "html5-qrcode-esm-smoke.mjs");

    it("exposes the public API surface", async () => {
        fs.copyFileSync(
            path.join(distDir, "html5-qrcode.esm.min.js"), tmpMjs);
        const mod = await nativeImport(pathToFileURL(tmpMjs).href);
        assertApiSurface(mod, "esm");
        assertEnumValues(mod, "esm");
    });

    it("constructs Html5Qrcode against a DOM element", async () => {
        const mod = await nativeImport(pathToFileURL(tmpMjs).href);
        assertHtml5QrcodeBehavior(mod, "esm");
    });
});

describe("dist/html5-qrcode.min.js (UMD)", () => {
    it("exposes window globals for backwards compatibility", () => {
        const dom = new JSDOM("<!DOCTYPE html>", { runScripts: "outside-only" });
        const bundle = fs.readFileSync(
            path.join(distDir, "html5-qrcode.min.js"), "utf8");
        dom.window.eval(bundle);

        const win = dom.window as any;
        expect(win.__Html5QrcodeLibrary__,
            "UMD: __Html5QrcodeLibrary__").to.not.equal(undefined);
        assertApiSurface(win.__Html5QrcodeLibrary__, "umd");

        for (const name of CLASS_EXPORTS) {
            expect(typeof win[name], `UMD global: ${name}`).to.equal("function");
        }
        for (const name of ENUM_EXPORTS) {
            expect(typeof win[name], `UMD global: ${name}`).to.equal("object");
        }
        expect(win.Html5QrcodeSupportedFormats.QR_CODE).to.equal(0);
        expect(win.Html5QrcodeScannerState.NOT_STARTED).to.equal(1);
    });
});
