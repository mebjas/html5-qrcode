@ECHO OFF
:: This is a build script for webpack/UMD based build.

ECHO Initiating webpack build sequence.

call webpack

:: Script copied to dist/html5-qrcode.min.js
:: Fork content of 'webpack_append_data.min.js' to final js file to
:: make classes global to be backwards compatible.
type scripts\webpack_append_data.min.js >> dist\html5-qrcode.min.js

ECHO Webpack building done.
