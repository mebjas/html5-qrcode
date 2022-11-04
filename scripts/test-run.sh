#!/bin/bash
## Build Script

echo 'Initiating test script.'

mocha -r tsconfig-paths/register \
    -r jsdom-global/register \
    --timeout 200000 \
    output/tests/**/*.test.js \
    output/tests/tests/ui/scanner/*.test.js

# Cleanup.
echo 'Cleaning up test artifacts'
rm -Rf ./output
