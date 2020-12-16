## Build Script
echo 'Initiating build sequence'

## TODO(mebjas): Add script to convert the required assets into embedded
## base64 assets into the script.
## Fix this before submit as the logic is broken otherwise.
## find assets/*.* -print0| xargs -0  -i{} bash -c 'echo  s%{}%data\\:\\;base64\\,$(base64 -w0 {})%g'|sed -i -f - html5-qrcode.js

## Concatenate source files into a temporary file to avoid redundant code snippets while transpiling
## Remove import/export statement before concatenate
sed '25s/export//' third_party/qrcode.js > src/html5-qrcode.tmp.js
sed '16s/export//' src/html5-qrcode.js | sed '14d' >> src/html5-qrcode.tmp.js
sed '16s/export//' src/html5-qrcode-scanner.js | sed '14d' >> src/html5-qrcode.tmp.js

## Transpile the Main Js Code
babel src/html5-qrcode.tmp.js -o transpiled/html5-qrcode.js

## Remove temporary source file
rm src/html5-qrcode.tmp.js
echo 'Source code transpiled.'

## Minify the code
minify transpiled/html5-qrcode.js > minified/html5-qrcode.min.js
echo 'Source code minified to minified/html5-qrcode.min.js'