#!/usr/bin/env bash

# Run this in terminal with `source setup-env.sh
if [ -n "${ZSH_VERSION}" ]; then
  BASEDIR="$( cd $( dirname "${(%):-%N}" ) && pwd )"
elif [ -n "${BASH_VERSION}" ]; then
  if [[ "$(basename -- "$0")" == "setup-env.sh" ]]; then
    echo "Don't run $0, source it (see README.md)" >&2
    exit 1
  fi
  BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
else
  echo "Unsupported shell, use bash or zsh."
  exit 2
fi

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "${BASEDIR}/script/utils.sh"

# Add script to the path
add_to_path "${BASEDIR}/script"
echo "Updated PATH with ${BASEDIR}/script"

# Add nodejs bin to the path
add_to_path "${BASEDIR}/lib/nodejs/bin"
echo "Updated PATH with ${BASEDIR}/lib/nodejs/bin"

# Add node_moduels/.bin to the path
add_to_path "${BASEDIR}/node_modules/.bin"
echo "Updated PATH with ${BASEDIR}/node_modules/.bin"

