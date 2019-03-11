const Element = require('./element');
const camelToDash = require('./camel_to_dash');
const config = require('./config');

/**
 * This is global, module state that exists across multiple calls into this
 * module. That said, the stack will only have entries when calls synchronously
 * make their way into the module, and this should only ever happen when calls
 * intend to create a tree structure by calling node within a node handler.
 *
 * There should be no way to leave state in this stack beyond a single outer
 * call to element().
 */

function top() {
  const stack = config().builderStack;
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
    if (value._isUnsafe) {
      return value;
    } else {
      return Object.keys(value).filter(key => !!value[key] && value[key] !== -1).join(' ');
    }
  }
  return value;
}

/**
 * Create the function that will be passed to a developer-provided update
 * argument.
 *
 * When a component is declared, an update handler can be requested as follows:
 *
 *   dom.div((update) => { setTimeout(update, 400); });
 *
 * That update argument will receive the function that is returned from this
 * definition.
 */
function getUpdateScheduler(elem, handler) {
  return function _getUpdateScheduler(optCompleteHandler) {
    if (elem.render) {
      function renderNow() {
        /* eslint-disable no-use-before-define */
        elem.render(builder, handler, optCompleteHandler);
        /* eslint-enable no-use-before-define */
      }

      if (optCompleteHandler) {
        // Ensure the complete handler is called by the scheduler, even if this
        // element is descheduled because a parent was also rendered.
        renderNow.onSkipped = function() {
          optCompleteHandler(elem);
        };
      }

      config().schedule(elem, renderNow);
    }
  };
}

/**
 * Process an element child handler declaration. This is how elements are
 * composed in Nomplate.
 *
 *   dom.ul(() => {
 *     dom.li('abcd');
 *     dom.li('efgh');
 *     dom.li('ijkl');
 *   });
 *
 * The following method will call the handler and synchronously construct the
 * Nomplate element tree.
 */
function processHandler(elem, handler) {
  const stack = config().builderStack;

  stack.push(elem);
  // If the provided handler has provided arguments
  // (i.e., an update() argument).
  if (handler.length > 0) {
    /* eslint-disable no-param-reassign */
    elem.hasUpdateableHandler = true;
    /* eslint-enable no-param-reassign */
    handler(getUpdateScheduler(elem, handler));
  } else {
    handler();
  }
  stack.pop();
}

function processStyleObject(obj) {
  const parts = [];
  Object.keys(obj).forEach((key) => {
    parts.push(`${camelToDash(key)}:${obj[key]};`);
  });
  return parts.join('');
}

function processAttrs(attrs) {
  if (attrs) {
    if (attrs.className) {
      /* eslint-disable no-param-reassign */
      attrs.className = processClassName(attrs.className);
      /* eslint-enable no-param-reassign */
    } else if (attrs.style && typeof attrs.style === 'object') {
      attrs.style = processStyleObject(attrs.style);
      if (attrs.style === '') {
        delete attrs.style;
      }
    } else if (attrs.onenter && attrs.onkeyup) {
      throw new Error('onenter and onkeyup are mutually exclusive, consider adding a switch statement to your onkeyup handler for the enter case.');
    }
  }
  return attrs;
}

/**
 * Process the collapsing argument scheme that allows us to define elements
 * more tersely.
 */
function processArgs(...args) {
  let attrs;
  let handler;
  let inlineTextChild;
  let type;

  args.forEach((value) => {
    type = typeof value;
    if (type !== 'undefined') {
      if (type === 'string' || value && type === 'object' && value._isUnsafe) {
        // value is either a string, or looks like: {_isUnsafe: true, content: 'abcd'};
        // htmlEncode will handle this by returning content unchanged.
        inlineTextChild = value;
      } else if (type === 'function') {
        handler = value;
      } else if (value) {
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
    const stack = config().builderStack;
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
  config().schedule.forceUpdate();
};

// Expose the element wrapper for the dom and svg clients.
builder.elementWrapper = function(nodeName, optNamespace) {
  return function _elementWrapper(optAttrs, optHandler, optContent) {
    return builder(nodeName, optAttrs, optHandler, optContent, optNamespace);
  };
};

// Add CSS selector to the current node.
builder.addSelector = function(selector, styles) {
  top().addSelector(selector, styles);
};

builder.addKeyframe = function(name, rules) {
  top().addSelector(`@keyframes ${name}`, rules);
};

// Return this Object wherever we would normally html_encode a string value.
builder.unsafeContent = function(content) {
  return {
    _isUnsafe: true,
    content: content,
  };
};

module.exports = builder;

