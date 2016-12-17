#! /usr/bin/env babel-node
import path from 'path';
import fs from 'fs';

import {dom, renderString} from '../';


const args = process.argv;

function printHelp() {
  console.log('Usage: nomplate [--pretty] [arg pairs for template] <FILE>');
}

function printError(message) {
  console.error(message);
  process.exit(1);
}

function processArgValue(value) {
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else {
    let asNumber = parseInt(value);
    if (!isNaN(asNumber)) {
      return asNumber;
    }
  }
  return value;
}

function processArgKey(key) {
  while (key[0] === '-') {
    key = key.slice(1);
  }

  return key;
}

function processHandlerArgs(args) {
  const hash = {};
  for (let i = 0, len = args.length; i < len; i += 1) {
    let key = args[i];
    let value = args[i + 1];
    if (key.indexOf('=') > -1) {
     const parts = key.split('=');
     key = parts[0];
     value = parts[1];
    } else {
      i += 1;
    }
    hash[processArgKey(key)] = processArgValue(value);
  }
  return hash;
}

function validate(args) {
  if (args.length === 0) {
    printHelp();
    process.exit(1);
  }
}

function execute(args) {
  validate(args);

  let outputFile = null;
  let outputIndex = args.findIndex((arg) => arg === '--output');
  if (outputIndex > -1) {
    outputFile = args[outputIndex + 1];
    args.splice(outputIndex, 2);
  }

  let prettyIndex = args.findIndex((arg) => arg === '--pretty');
  if (prettyIndex > -1) {
    args.splice(prettyIndex, 1);
  }

  let file = path.resolve(args.pop());
  let handlerArgs = processHandlerArgs(args);

  let handler = require(file);

  if (handler.default && typeof handler.default === 'function') {
    handler = handler.default;
  }

  const str = renderString()(handler(handlerArgs), prettyIndex > -1);

  if (outputFile) {
    fs.writeFileSync(outputFile, str);
  } else {
    console.log(str);
  }
}

if (require.main === module) {
  // The first two args are the node runtime and this file.
  execute(process.argv.slice(2));
}
