const path = require( 'path' );

module.exports = {

    // bundling mode
    mode: 'production',

    // entry files
    entry: './src/html5-qrcode.ts',

    // output bundles (location)
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'html5-qrcode.library.min.js',
    },

    // file resolutions
    resolve: {
        extensions: [ '.ts' ],
    },

    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
};