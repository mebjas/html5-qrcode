/**
 * Copies zxing-wasm reader binary next to build outputs
 */
const fs = require("fs");
const path = require("path");

const wasmSource = path.join(
    __dirname,
    "..",
    "node_modules",
    "zxing-wasm",
    "dist",
    "reader",
    "zxing_reader.wasm"
);

const wasmTargets = [
    path.join(__dirname, "..", "dist", "zxing_reader.wasm"),
    path.join(__dirname, "..", "minified", "zxing_reader.wasm"),
];

if (!fs.existsSync(wasmSource)) {
    console.error("zxing_reader.wasm not found at", wasmSource);
    process.exit(1);
}

for (const target of wasmTargets) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(wasmSource, target);
    console.log("Copied", path.basename(wasmSource), "->", target);
}
