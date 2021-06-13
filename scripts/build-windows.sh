# shellcheck shell=batch
## Build Script
echo 'Initiating default build sequence for Windows OS.'

echo > dist\\html5-qrcode.min.js
echo 'html5-qrcode.min.js truncated!'

## TODO(mebjas): Add script to convert the required assets into embedded
## base64 assets into the script.
## Fix this before submit as the logic is broken otherwise.
## find assets/*.* -print0| xargs -0  -i{} bash -c 'echo  s%{}%data\\:\\;base64\\,$(base64 -w0 {})%g'|sed -i -f - html5-qrcode.js

## Build the Typescript source to javascript
## TODO(mebjas) Use webpack directly
node node_modules\\webpack\\bin\\webpack.js
echo 'html5-qrcode library built to dist/html5-qrcode.library.min.js'

# TODO(mebjas): Include the non minified zxing-js library and minify in runtime.
# minify third_party/zxing-js.umd.js --out-file third_party/zxing-js.umd.min.js
# echo 'third_party/zxing-js.umd.js minified'

## Post build script
echo '/** ZXing **/' > dist\\html5-qrcode.min.js
cat third_party\\zxing-js.umd.min.js >> dist\\html5-qrcode.min.js
echo 'Copied third_party/zxing-js.umd.min.js to dist/html5-qrcode.min.js'

## Copy all other temp files to final minified script

echo  >> dist\\html5-qrcode.min.js
echo '/** Html5Qrcode **/' >> dist\\html5-qrcode.min.js
cat dist\\html5-qrcode.library.min.js >> dist\\html5-qrcode.min.js
echo 'Copied dist/html5-qrcode.library.min.js to dist/html5-qrcode.min.js'

## This is super hack to make the library global.
## TODO(mebjas) Address this normally.
echo '' >> dist/html5-qrcode.min.js
echo '/**ref**/' >> dist/html5-qrcode.min.js
echo ';var Html5Qrcode = window._.Html5Qrcode;' >> dist/html5-qrcode.min.js
echo ';var Html5QrcodeScanner = window._.Html5QrcodeScanner;' >> dist/html5-qrcode.min.js
echo ';var Html5QrcodeSupportedFormats = window._.Html5QrcodeSupportedFormats;' >> dist/html5-qrcode.min.js
## Remove the temp files
rm dist\\html5-qrcode.library.min.js
echo 'Removed dist/html5-qrcode.library.min.js'

## All done - success
echo 'minifed and combined, Success!'
