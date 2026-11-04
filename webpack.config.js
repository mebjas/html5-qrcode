const path = require("path");

const tsRule = {
    test: /\.tsx?/,
    use: "ts-loader",
    exclude: /node_modules/,
};

// @zxing/library does not declare sideEffects in its package.json, so
// webpack would conservatively keep every re-exported module. Marking the
// package side-effect-free lets tree-shaking drop the parts we never touch
// (writers/encoders, browser capture readers).
const zxingTreeShakingRule = {
    test: /node_modules[\\/]@zxing[\\/]library/,
    sideEffects: false,
};

// UMD-style bundle: dist/html5-qrcode.min.js
// scripts/build-webpack.sh additionally appends the window re-expose
// snippet to this file only.
const umdConfig = {
    mode: "production",
    entry: "./src/index.ts",
    output: {
        path: path.resolve( __dirname, "dist" ),
        filename: "html5-qrcode.min.js",
        library: "__Html5QrcodeLibrary__",
    },
    resolve: { extensions: [ ".ts", ".js" ] },
    target: "web",
    devtool: false,
    module: {
        rules: [ tsRule, zxingTreeShakingRule ]
    },
    optimization: { minimize: true, usedExports: true }
};

// Single-file minified ESM bundle: dist/html5-qrcode.esm.min.js
const esmConfig = {
    mode: "production",
    entry: "./src/index.ts",
    experiments: { outputModule: true },
    output: {
        path: path.resolve( __dirname, "dist" ),
        filename: "html5-qrcode.esm.min.js",
        library: { type: "module" },
    },
    resolve: { extensions: [ ".ts", ".js" ] },
    target: "web",
    devtool: false,
    module: {
        rules: [ tsRule, zxingTreeShakingRule ]
    },
    optimization: { minimize: true, usedExports: true }
};

module.exports = [ umdConfig, esmConfig ];
