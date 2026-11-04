/**
 * Copies the vendored ZXing into dist/third_party/ as a MINIFIED artifact,
 * keeping the same filename so the relative specifiers emitted by the tsc
 * builds ("../third_party/zxing-js.umd") keep resolving, and copies the
 * sibling .d.ts so consumer type-checking keeps working.
 */
const fs = require("fs");
const path = require("path");
const { minify } = require("terser");

const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "third_party");
const outDir = path.join(root, "dist", "third_party");

async function main() {
    fs.mkdirSync(outDir, { recursive: true });
    fs.copyFileSync(
        path.join(srcDir, "zxing-js.umd.d.ts"),
        path.join(outDir, "zxing-js.umd.d.ts"));

    const source = fs.readFileSync(
        path.join(srcDir, "zxing-js.umd.js"), "utf8");
    const result = await minify(source, {
        compress: true,
        mangle: true,
        format: { comments: "some" },
    });
    if (!result.code) {
        throw new Error("terser produced no output");
    }
    fs.writeFileSync(
        path.join(outDir, "zxing-js.umd.js"), result.code);
    console.log(
        `third_party/zxing-js.umd.js: ${source.length} -> ${result.code.length} bytes`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
