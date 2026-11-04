@ECHO OFF
:: Runs build-artifact smoke tests over dist\.
:: Requires dist\ to be built - run `npm run build` first.

ECHO Initiating dist smoke tests.

call npm run-script test:build

mocha -r jsdom-global/register --timeout 200000 output\tests\tests\dist\*.test.js

:: Cleanup
ECHO Cleaning up test artifacts

rmdir /s /q .\\output
