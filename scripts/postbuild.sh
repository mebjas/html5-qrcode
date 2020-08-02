## Post build script
echo 'Initiating post-build sequence'

## Copy qrcode.min.js to the min script
cp third_party/qrcode.min.js minified/html5-qrcode.min.js
echo 'Copied qrcode.min.js to minified/html5-qrcode.min.js'

## Copy all other temp files to final minified script
cat minified/html5-qrcode.tmp.js >> minified/html5-qrcode.min.js
echo 'Copied minified/html5-qrcode.tmp.js to minified/html5-qrcode.min.js'

echo '\n\n/** Html5QrcodeScanner **/' >> minified/html5-qrcode.min.js

cat minified/html5-qrcode-scanner.tmp.js >> minified/html5-qrcode.min.js
echo 'Copied minified/html5-qrcode-scanner.tmp.js to minified/html5-qrcode.min.js'

## Remove the temp files
rm minified/html5-qrcode.tmp.js
echo 'Removed minified/html5-qrcode.tmp.js'

rm minified/html5-qrcode-scanner.tmp.js
echo 'Removed minified/html5-qrcode-scanner.tmp.js'

## All done - success
echo 'minifed and combined, Success!'
