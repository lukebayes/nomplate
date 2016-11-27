import fs from 'fs';
import vm from 'vm';
import CoffeeScript from 'coffee-script';
import Nomtml from './nomtml';

let addFunction = function(key, recipient, source) {
  if (key === 'constructor' || key === 'pretty') { return; }

  if (recipient[key] === undefined) {
    return recipient[key] = (...args) => source[key].apply(source, args);
  } else {
    return console.log(`view option '${key}' is blocking application of Nomtml attribute of same name`);
  }
};

let renderLayout = layout => console.log('rendering layout now: ', layout);

let render = function(source, options) {
  console.log('render: ', source);
  if (!options) { options = {}; }
  let sandbox = {};

  // Callers can send in a custom nomplate instance:
  let context = options.nomplate || new Nomtml();

  // Rename Poorly-named Express View:
  sandbox.renderLayout = layout => console.log('RENDINER LAYOUT: ', layout);

  delete options.body;

  for (var key in options) { let value = options[key]; sandbox[key] = value; }
  for (key in context) { addFunction(key, sandbox, context); }
    
  if (options.pretty !== undefined) {
    context.pretty = options.pretty;
  }

  let compiled_js = CoffeeScript.compile(source, context);
  vm.runInNewContext(compiled_js, sandbox);
  
  return () => context.output;
};

let renderFile = function(path, options, callback) {
  let encoding = 'utf-8';
  console.log('RENDER FILE WITH:', path, options, callback);
  return fs.readFile(path, {encoding}, (err, data) => callback(err, render(data.toString(), options)()));
};


export { render, renderFile, renderLayout };

