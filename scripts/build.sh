## Build Script
echo 'Initiating build sequence'

## TODO(mebjas): Add script to convert the required assets into embedded
## base64 assets into the script.
## Fix this before submit as the logic is broken otherwise.
## find assets/*.* -print0| xargs -0  -i{} bash -c 'echo  s%{}%data\\:\\;base64\\,$(base64 -w0 {})%g'|sed -i -f - html5-qrcode.js

## Transpile typescript src to js.
## This should create transpiled/html5-qrcode.js
tsc -p tsconfig.json
echo 'html5-qrcode library built to transpiled/html5-qrcode.js'

## Minify the code
minify transpiled/html5-qrcode.js --out-file minified/html5-qrcode.tmp.js
echo 'html5-qrcode minified to minified/html5-qrcode.tmp.js'

# TODO(mebjas): Include the non minified zxing-js library and minify in runtime.
# minify third_party/zxing-js.umd.js --out-file third_party/zxing-js.umd.min.js
# echo 'third_party/zxing-js.umd.js minified'
