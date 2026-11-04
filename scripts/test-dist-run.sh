#!/bin/bash
## Runs build-artifact smoke tests over dist/.
## Requires dist/ to be built - run `npm run build` first.

echo 'Initiating dist smoke tests.'

npm run-script test:build

mocha -r jsdom-global/register \
    --timeout 200000 \
    output/tests/tests/dist/*.test.js

# Cleanup.
echo 'Cleaning up test artifacts'
rm -Rf ./output
