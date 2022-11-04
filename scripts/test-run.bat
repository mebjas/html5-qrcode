@ECHO OFF
:: This is a script for running tests on Windows OS.

ECHO Initiating test script.

mocha -r tsconfig-paths/register --timeout 200000 output/tests/**/*.test.js output/tests/tests/ui/scanner/*.test.js

ECHO Cleaning up test artifacts

rmdir /s /q .\\output
