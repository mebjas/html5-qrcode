## Build Script
echo 'Initiating build sequence'

## TODO(mebjas): Add script to convert the required assets into embedded
## base64 assets into the script.
## Fix this before submit as the logic is broken otherwise.
## find assets/*.* -print0| xargs -0  -i{} bash -c 'echo  s%{}%data\\:\\;base64\\,$(base64 -w0 {})%g'|sed -i -f - html5-qrcode.js

## Transpile the Main Js Code
babel src/html5-qrcode.js -d transpiled
echo 'html5-qrcode.js transpiled'

babel src/html5-qrcode-scanner.js -d transpiled
echo 'html5-qrcode-scanner.js transpiled'

## Minify the code
minify transpiled/html5-qrcode.js --out-file minified/html5-qrcode.tmp.js
echo 'html5-qrcode minified to minified/html5-qrcode.tmp.js'

minify transpiled/html5-qrcode-scanner.js --out-file minified/html5-qrcode-scanner.tmp.js
echo 'html5-qrcode-scanner minified to minified/html5-qrcode-scanner.tmp.js'
