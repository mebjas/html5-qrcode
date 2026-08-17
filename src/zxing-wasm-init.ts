/**
 * Configures zxing-wasm reader WASM loading (CDN, same directory, or custom URL).
 */
import { prepareZXingModule, purgeZXingModule } from "zxing-wasm/reader";

import {
    ZxingWasmConfig,
    ZxingWasmLoadMode,
} from "./zxing-wasm-config";

const ZXING_READER_WASM_FILE = "zxing_reader.wasm";

let globalConfig: ZxingWasmConfig = {
    loadMode: ZxingWasmLoadMode.CDN,
};

let wasmReady: Promise<void> | null = null;
let lastAppliedConfigKey = "";

/**
 * Sets default WASM loading behaviour for all scanners created after this call.
 * Per-instance {@link ZxingWasmConfig} on {@link Html5QrcodeConfigs} overrides this.
 */
export function configureZxingWasm(config: ZxingWasmConfig): void {
    globalConfig = {
        ...globalConfig,
        ...config,
    };
    resetZxingWasmModule();
}

function resetZxingWasmModule(): void {
    wasmReady = null;
    lastAppliedConfigKey = "";
    purgeZXingModule();
}

function resolveEffectiveConfig(config?: ZxingWasmConfig): ZxingWasmConfig {
    return {
        loadMode: config?.loadMode ?? globalConfig.loadMode ?? ZxingWasmLoadMode.CDN,
        wasmUrl: config?.wasmUrl ?? globalConfig.wasmUrl,
    };
}

function configKey(config: ZxingWasmConfig): string {
    return `${config.loadMode ?? ""}|${config.wasmUrl ?? ""}`;
}

function resolveSameDirectoryWasmUrl(): string {
    if (typeof document !== "undefined") {
        const scripts = document.getElementsByTagName("script");
        for (let i = scripts.length - 1; i >= 0; i--) {
            const src = scripts[i].src;
            if (src && (src.includes("html5-qrcode") || src.includes("Html5Qrcode"))) {
                const slash = src.lastIndexOf("/");
                if (slash >= 0) {
                    return src.substring(0, slash + 1) + ZXING_READER_WASM_FILE;
                }
            }
        }
    }
    return ZXING_READER_WASM_FILE;
}

function buildLocateFile(
    config: ZxingWasmConfig,
): ((path: string, prefix: string) => string) | undefined {
    const mode = config.loadMode ?? ZxingWasmLoadMode.CDN;
    if (mode === ZxingWasmLoadMode.CDN) {
        return undefined;
    }
    if (mode === ZxingWasmLoadMode.SAME_DIRECTORY) {
        const wasmUrl = resolveSameDirectoryWasmUrl();
        return (path: string, prefix: string) => {
            if (path.endsWith(".wasm")) {
                return wasmUrl;
            }
            return prefix + path;
        };
    }
    if (mode === ZxingWasmLoadMode.CUSTOM) {
        const wasmUrl = config.wasmUrl;
        if (!wasmUrl) {
            throw new Error(
                "zxingWasm.wasmUrl is required when zxingWasm.loadMode is \"custom\".");
        }
        return (path: string, prefix: string) => {
            if (path.endsWith(".wasm")) {
                return wasmUrl;
            }
            return prefix + path;
        };
    }
    return undefined;
}

/**
 * Ensures the ZXing reader WASM module is loaded before decoding.
 */
export function ensureZxingWasmReady(config?: ZxingWasmConfig): Promise<void> {
    const effective = resolveEffectiveConfig(config);
    const key = configKey(effective);
    if (wasmReady && lastAppliedConfigKey === key) {
        return wasmReady;
    }
    resetZxingWasmModule();
    lastAppliedConfigKey = key;

    const locateFile = buildLocateFile(effective);
    const options: {
        overrides?: { locateFile: (path: string, prefix: string) => string };
        fireImmediately: true;
    } = { fireImmediately: true };
    if (locateFile) {
        options.overrides = { locateFile };
    }

    wasmReady = (prepareZXingModule(
        options as { fireImmediately: true },
    ) as unknown as Promise<unknown>).then(() => undefined);
    return wasmReady;
}
