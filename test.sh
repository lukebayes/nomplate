#!/bin/bash
cd "$(dirname "$0")"
./build.sh
jasmine-node --captureExceptions dist/src dist/spec

