const path = require("path");

module.exports = {
    // bundling mode
    mode: "production",
    // entry files
    entry: "./src/index.ts",
    // output bundles (location)
    output: {
        path: path.resolve( __dirname, "dist" ),
        filename: "html5-qrcode.library.min.js",
        library: "_",
    },
    // file resolutions
    resolve: {
        extensions: [ ".ts" ],
    },
    target: "web",
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ]
    },
    optimization: {
        minimize: true,
        usedExports: true
    }
};
