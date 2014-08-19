#!/bin/bash
cd "$(dirname "$0")"
jasmine-node --captureExceptions dist/src dist/spec

