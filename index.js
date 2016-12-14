import Element from './src/element';
import builder from './src/builder';
import dom from './src/dom';
import generateId from './src/generate_id';
import htmlEncode from './src/html_encode';
import operations from './src/operations';
import renderElement from './src/render_element';
import renderString from './src/render_string';
import scheduler from './src/scheduler';

// Expose the forceUpdate function.
const forceUpdate = builder.forceUpdate;

export {
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
};

