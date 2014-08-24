#!/bin/bash

# Run and listen for changes
jasmine-node --captureExceptions --color --autotest lib/spec --watch lib/src lib/spec

