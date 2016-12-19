const Element = require('./element');
const scheduler = require('./scheduler');

/**
 * This is global, module state that exists across multiple calls into this
 * module. That said, the stack will only have entries when calls synchronously
 * make their way into the module, and this should only ever happen when calls
 * intend to create a tree structure by calling node within a node handler.
 *
 * There should be no way to leave state in this stack beyond a single outer
 * call to element().
 */
// TODO(lbayes): Provide the globals, instead of reaching out to them.
const schedule = scheduler(global.requestAnimationFrame || global.setTimeout);

const stack = [];

function top() {
  return stack[stack.length - 1] || null;
}

/**
 * Allow a variety of inputs to express an element className.
 *
 * If the value is an Array, only values that are not empty string, undefined,
 * null, -1, or 0 will be assigned as classNames.
 *
 * If the value is an Object, only keys that have a truthy value (and not -1)
 * will be assigned to the element.className.
 *
 * If the value is a string, it will be dropped directly into the element.
 */
function processClassName(value) {
  if (Array.isArray(value)) {
    return value.filter(entry => !!entry && entry !== -1).join(' ');
  } else if (typeof value === 'object') {
    return Object.keys(value).filter(key => !!value[key] && value[key] !== -1).join(' ');
  }
  return value;
}

function getRenderScheduler(elem, handler) {
  return function _getRenderScheduler(optCompleteHandler) {
    if (elem.onRender) {
      schedule(elem, () => {
        /* eslint-disable no-use-before-define */
        elem.onRender(builder, handler, optCompleteHandler);
        /* eslint-enable no-use-before-define */
      });
    }
  };
}

function processHandler(elem, handler) {
  stack.push(elem);
  if (handler.length > 0) {
    /* eslint-disable no-param-reassign */
    elem.hasUpdateableHandler = true;
    /* eslint-enable no-param-reassign */
    handler(getRenderScheduler(elem, handler));
  } else {
    handler();
  }
  stack.pop();
}

function processAttrs(attrs) {
  if (attrs && attrs.className) {
    /* eslint-disable no-param-reassign */
    attrs.className = processClassName(attrs.className);
    /* eslint-enable no-param-reassign */
  }
  return attrs;
}

/**
 * Process the collapsing argument scheme that allows us to define elements
 * more tersely.
 */
function processArgs(...args) {
  let attrs;
  let inlineTextChild;
  let handler;
  let type;

  args.forEach((value) => {
    type = typeof value;
    if (type !== 'undefined') {
      if (type === 'string') {
        inlineTextChild = value;
      } else if (type === 'function') {
        handler = value;
      } else {
        attrs = processAttrs(value);
      }
    }
  });

  return {
    attrs,
    inlineTextChild,
    handler,
  };
}

/**
 * This function is the workhorse of the entire system. The arguments provided
 * to this function are fungible. The idea here is that our declarative DSL can
 * be more terse if we do not need to fill unused argument slots.
 *
 * Handler and inlineTextChild are mutually exclusive and handler takes precedent.
 *
 * Otherwise, simply omit unused arguments and move the remaining values to the
 * left.
 *
 * TODO(lbayes): Need to verify/resolve issues with tags that support text
 * inlineTextChild and arbitrary childNodes (e.g., paragraph tag)
 */
function builder(nodeName, optAttrs, optHandler, optContent, optNamespace) {
  try {
    const parent = top();
    const attrs = processArgs(optAttrs, optHandler, optContent);
    const elem = new Element(nodeName, attrs, parent, optNamespace);

    if (parent) {
      parent.childNodes.push(elem);
    }

    if (attrs.handler) {
      processHandler(elem, attrs.handler);
    }

    return elem;
  } catch (err) {
    // We cannot allow global state to leak between callers, especially when
    // there is an exception.
    stack.length = 0;
    /* eslint-disable no-console */
    console.error(err);
    /* eslint-enable no-console */
    throw err;
  }
}

// Expose the stinkleton forceUpdate function.
builder.forceUpdate = function _forceUpdate() {
  schedule.forceUpdate();
};

// Expose the element wrapper for the dom and svg clients.
builder.elementWrapper = function(nodeName, optNamespace) {
  return function _elementWrapper(optAttrs, optHandler, optContent) {
    return builder(nodeName, optAttrs, optHandler, optContent, optNamespace);
  };
};

module.exports = builder;

