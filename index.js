const Element = require('./src/element');
const builder = require('./src/builder');
const dom = require('./src/dom');
const generateId = require('./src/generate_id');
const htmlEncode = require('./src/html_encode');
const operations = require('./src/operations');
const renderElement = require('./src/render_element');
const renderString = require('./src/render_string');
const scheduler = require('./src/scheduler');
const svg = require('./src/svg');

// Expose the forceUpdate function.
const forceUpdate = builder.forceUpdate;

module.exports = {
  Element,
  builder,
  dom,
  forceUpdate,
  generateId,
  htmlEncode,
  operations,
  renderElement,
  renderString,
  scheduler,
  svg,
};

