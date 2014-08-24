#!/bin/bash

# To hold compiler open and watch call like:
# ./build.sh --watch

# To simply build once, call:
# ./build.sh

coffee --map $1 -o lib/ ./

