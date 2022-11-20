#!/bin/bash
## Build Script
echo 'Initiating webpack build sequence.'

webpack

## Script copied to dist/html5-qrcode.min.js
## Fork content of 'webpack_append_data.min.js' to final js file to
## make classes global to be backwards compatible.
cat scripts/webpack_append_data.min.js >> dist/html5-qrcode.min.js

cp dist/html5-qrcode.min.js minified/html5-qrcode.min.js
echo 'Copied the webpack script to minified/..'

echo 'Webpack building done.'
