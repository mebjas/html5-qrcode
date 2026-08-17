/**
 * Configuration for loading zxing-wasm reader binary.
 */

/** How {@link zxing_reader.wasm} is resolved at runtime. */
export enum ZxingWasmLoadMode {
    /** jsDelivr CDN (zxing-wasm default). */
    CDN = "cdn",
    /** `zxing_reader.wasm` next to the html5-qrcode script tag. */
    SAME_DIRECTORY = "sameDirectory",
    /** Custom URL or path from {@link ZxingWasmConfig.wasmUrl}. */
    CUSTOM = "custom",
}

/**
 * Controls where the ZXing reader WASM module is loaded from.
 */
export interface ZxingWasmConfig {
    /**
     * @defaultValue {@link ZxingWasmLoadMode.CDN}
     */
    loadMode?: ZxingWasmLoadMode | undefined;

    /**
     * Full URL or site-relative path to `zxing_reader.wasm`.
     * Required when {@link loadMode} is {@link ZxingWasmLoadMode.CUSTOM}.
     */
    wasmUrl?: string | undefined;
}
