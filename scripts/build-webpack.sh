#!/bin/bash
## Build Script
echo 'Initiating webpack build sequence.'

export NODE_OPTIONS=--openssl-legacy-provider

webpack

## Script copied to dist/html5-qrcode.min.js
## Fork content of 'webpack_append_data.min.js' to final js file to
## make classes global to be backwards compatible.
cat scripts/webpack_append_data.min.js >> dist/html5-qrcode.min.js

echo 'Webpack building done.'
