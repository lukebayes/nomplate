#!/bin/bash
cd "$(dirname "$0")"
./build.sh
jasmine-node --captureExceptions lib/src lib/spec

