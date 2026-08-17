const fs = require("fs");
const path = require("path");

const dirs = [
    "dist",
    "lib",
    "build",
    path.join("meta", "bundlesize"),
    path.join("meta", "coverage"),
    ".rpt2_cache",
];
for (const d of dirs) {
    try {
        fs.rmSync(d, { recursive: true, force: true });
    } catch (_) {
        /* ignore */
    }
}
try {
    const srcDir = path.join("src");
    for (const name of fs.readdirSync(srcDir)) {
        if (name.endsWith(".d.ts")) {
            fs.unlinkSync(path.join(srcDir, name));
        }
    }
} catch (_) {
    /* ignore */
}
