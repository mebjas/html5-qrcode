## Test script

echo 'Initiating test sequence'
mocha-phantomjs -p node_modules/phantomjs/bin/phantomjs -R dot ./test/test.html5-qrcode.html
