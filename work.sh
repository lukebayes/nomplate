#!/bin/bash

# Run and listen for changes
jasmine-node --captureExceptions --color --autotest dist/spec --watch dist/src dist/spec

