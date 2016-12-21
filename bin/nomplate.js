#! /usr/bin/env node
const path = require('path');
const fs = require('fs');
const dom = require('../').dom;
const renderString = require('../').renderString;

const args = process.argv;

function printHelp() {
  console.log('Usage: nomplate [--pretty] [arg pairs for template] <FILE>');
}

function printError(message) {
  if (String(message).toLowerCase().includes('unexpected token import')) {
    console.log('Nomplate does not support ES6-style "import" for modules.\n\
    Please use "require" statements instead.\n\
    e.g. const nomplate = require("nomplate")');
  } else {
    console.error(message);
  }
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

  let helpIndex = args.findIndex((arg) => arg === '--help');
  if (helpIndex > -1) {
    args.splice(helpIndex, 1);
    printHelp();
    return;
  }

  let file = path.resolve(args.pop());
  let handlerArgs = processHandlerArgs(args);

  let handler = null;
  try {
    handler = require(file);
  } catch (e) {
    printError(e);
  }

  if (handler && handler.default && typeof handler.default === 'function') {
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

