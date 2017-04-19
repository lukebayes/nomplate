const config = require('./config');
const operations = require('./operations');

const EMPTY_ATTRS = Object.freeze({});
const KEY_UP = 'keyup';

function getUpdateElement(nomElement, document, optDomElement) {
  return function _updateElement(builder, handler, optCompleteHandler) {
    const parentNode = optDomElement.parentNode;
    const newNomElement = builder(nomElement.nodeName, nomElement.attrs, handler);
    const nullOrParentElement = parentNode ? null : optDomElement;

    /* eslint-disable no-use-before-define */
    const newDomElement = renderElement(newNomElement, document, nullOrParentElement);
    /* eslint-enable no-use-before-define */

    if (parentNode) {
      parentNode.replaceChild(newDomElement, optDomElement);
    }

    if (optCompleteHandler && typeof optCompleteHandler === 'function') {
      optCompleteHandler(newDomElement, newNomElement);
    }
  };
}

/**
 * Execute all operations to update the provided optDomElement with the provided
 * nomElement. The document is used to createElements and text nodes.
 *
 * If any operation handler returns a function, it will be appended to the
 * trailing actions list and executed after the tree has been created.
 */
function executeOperations(ops, nomElement, document, optDomElement) {
  const stack = [];
  const trailingActions = [];

  const root = ops.reduce((lastElement, operation) => {
    const result = operation(lastElement, stack, document);
    if (typeof result === 'function') {
      trailingActions.push(result);
      return lastElement;
    }
    return result;
  }, optDomElement);

  // Any operation that returns a function (e.g., onRender ops) will have the
  // returned handler executed in the next interval.
  // This allows handlers like onRender to accept DOM elements and call methods
  // (like focus()) after the elements have been attached to the document
  // during and update() lifecycle.
  config().setTimeout(() => {
    // NOTE(lbayes): This is now disconnected from the main request thread,
    // exceptions may get swallowed. The implementation of enqueueOnRender
    // does make an effort to continue after user-defined exceptions, so at
    // least we should not see mysterious missed calls if a previous call
    // fails.
    trailingActions.forEach((action) => {
      action();
    });
  }, 0);

  return root;
}

/**
 * Syntactic sugar for components to listen for the enter key click.
 */
function onEnterHandler(handler) {
  return function _onEnterHandler(event) {
    if (event && event.keyCode === 13) {
      handler(event);
    }
  };
}

function createDispatcherOperation(ops, nomElement, origKey, value) {
  const key = origKey.toLowerCase();
  if (key === 'onenter') {
    // TODO(lbayes): Subscriptions to onEnter and onKeyup are mutually exclusive!
    // Syntactic sugar for common usecase
    ops.push(operations.setHandler(KEY_UP, onEnterHandler(value)));
  } else {
    ops.push(operations.setHandler(key, value));
  }
}

function elementAttributesToOperations(ops, nomElement, optDomElement) {
  const attrs = nomElement.attrs || EMPTY_ATTRS;
  const modifiedKeys = {};

  // Look for attributes that need to be set
  Object.keys(attrs).forEach((key) => {
    const value = attrs[key];
    if (key === 'className' || key === 'classname') {
      if (value !== (optDomElement && optDomElement.className)) {
        ops.push(operations.setClassName(attrs[key]));
      }
    } else if (key === 'onRender' || key === 'onrender') {
      if (typeof value === 'function') {
        ops.push(operations.enqueueOnRender(value));
      } else {
        throw new Error('onRender requires a function handler');
      }
    } else if (typeof value === 'function') {
      createDispatcherOperation(ops, nomElement, key, value);
    } else if (value !== false && value !== (optDomElement && optDomElement.getAttribute(key))) {
      ops.push(operations.setAttribute(key, value));
    }
    modifiedKeys[key] = true;
  });

  // Look for attributes that need to be removed.
  if (optDomElement) {
    const domAttrs = optDomElement.attributes;
    for (let i = 0, len = domAttrs.length; i < len; i += 1) {
      const key = domAttrs[i].name;
      if (key === 'class') {
        if (!modifiedKeys.className) {
          ops.push(operations.removeClassName());
        }
      } else if (key === 'data-nomhandlers') {
        const handlers = domAttrs[i].value.split(' ');
        handlers.forEach((handlerName) => {
          if (!modifiedKeys[handlerName]) {
            ops.push(operations.removeHandler(handlerName));
          }
        });
      } else if (!modifiedKeys[key]) {
        ops.push(operations.removeAttribute(key));
      }
    }
  }
}

/**
 * Create (or modify) a DOM element using the provided nomElement as a
 * blueprint. Recurse into children via write or update DOM child nodes.
 */
function elementToOperations(ops, nomElement, document, optDomElement) {
  if (!optDomElement) {
    if (!nomElement) {
      throw new Error('elementToOperations requires a Nomplate Element');
    }
    // We did receive a context DOM element, create the tree directly.
    if (nomElement.nodeName === 'text') {
      ops.push(operations.createTextNode(nomElement.textContent));
      ops.push(operations.appendChild());
    } else {
      ops.push(operations.createElement(nomElement, getUpdateElement));
      ops.push(operations.pushElement(nomElement));
      // Synchronize element attributes, including className and event handlers.
      elementAttributesToOperations(ops, nomElement);
      // Traverse into the each child.
      /* eslint-disable no-use-before-define */
      writeDomChildren(ops, nomElement, document);
      /* eslint-enable no-use-before-define */
      ops.push(operations.popElement());
      ops.push(operations.appendChild());
    }
  } else if (nomElement.nodeName === 'text') {
    ops.push(operations.updateTextContent(nomElement.textContent));
  } else {
    ops.push(operations.pushElement(nomElement, optDomElement));
    // Synchronize element attributes, including className and event handlers.
    elementAttributesToOperations(ops, nomElement, optDomElement);
    // Traverse into the each child.
    /* eslint-disable no-use-before-define */
    updateDomChildNodes(ops, nomElement, document, optDomElement);
    /* eslint-enable no-use-before-define */
    ops.push(operations.popElement());
  }
  return ops;
}

function updateDomChildNodes(ops, nomElement, document, optDomElement) {
  const nomKids = nomElement.childNodes;
  const domKids = Array.prototype.slice.call(optDomElement.childNodes);

  if (nomElement.hasUpdateableHandler) {
    ops.push(operations.setRenderFunction(getUpdateElement, nomElement, document));
  }

  const matchedKids = [];
  let i = 0;
  while (i < domKids.length) {
    const domKid = domKids[i];
    const nomKid = nomKids[i];
    if (domKid && nomKid && domKid.nodeName === nomKid.nodeName) {
      elementToOperations(ops, nomKid, document, domKid);
      matchedKids.push(i);
    } else {
      ops.push(operations.removeChild(domKids[i]));
    }
    i += 1;
  }

  i = 0;
  while (i < nomKids.length) {
    if (matchedKids.indexOf(i) === -1) {
      elementToOperations(ops, nomKids[i], document);
    }
    i += 1;
  }
}

function writeDomChildren(ops, nomElement, document) {
  const kids = nomElement.childNodes || [];
  if (kids.length > 0) {
    // We're in a greenfield and need to create children.
    kids.forEach((child) => {
      elementToOperations(ops, child, document);
    });
  }
}

/**
 * Using the provided nomElement, and the optionally provided optDomElement,
 * create a collection of transformations that will make a tree of DOM elements
 * that represent the nomElement tree. If a optDomElement is provided, it will be
 * interrogated and it will only be touched in places where it differs from
 * the nomElement tree.
 */
function renderElement(nomElement, document, optDomElement) {
  const ops = [];
  elementToOperations(ops, nomElement, document, optDomElement);
  return executeOperations(ops, nomElement, document, optDomElement);
}

module.exports = renderElement;

