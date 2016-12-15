import operations from './operations';

const EMPTY_ATTRS = Object.freeze({});
const KEY_UP = 'keyup';

// TODO(lbayes): Provide the globals to the module.
const localSetTimeout = global.setTimeout;

function getUpdateElement(nomElement, domElement, document) {
  return function _updateElement(builder, handler, optCompleteHandler) {
    const parentNode = domElement.parentNode;
    const newNomElement = builder(nomElement.nodeName, nomElement.attrs, handler);
    localSetTimeout(() => {
      const nullOrParentElement = parentNode ? null : domElement;

      /* eslint-disable no-use-before-define */
      const newDomElement = renderElement(newNomElement, nullOrParentElement, document);
      /* eslint-enable no-use-before-define */

      localSetTimeout(() => {
        if (parentNode) {
          parentNode.replaceChild(newDomElement, domElement);
        }

        if (optCompleteHandler && typeof optCompleteHandler === 'function') {
          localSetTimeout(() => {
            optCompleteHandler(newDomElement, newNomElement);
          }, 0);
        }
      }, 0);
    }, 0);
  };
}

/**
 * Execute all operations to update the provided domElement with the provided
 * nomElement. The document is used to createElements and text nodes.
 *
 * If any operation handler returns a function, it will be appended to the
 * trailing actions list and executed after the tree has been created.
 */
function executeOperations(ops, nomElement, domElement, document) {
  const stack = [];
  const trailingActions = [];

  const root = ops.reduce((lastElement, operation) => {
    const result = operation(lastElement, stack, document);
    if (typeof result === 'function') {
      trailingActions.push(result);
      return lastElement;
    }
    return result;
  }, domElement);

  trailingActions.forEach((action) => {
    action();
  });

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

function elementAttributesToOperations(ops, nomElement, domElement) {
  const attrs = nomElement.attrs || EMPTY_ATTRS;
  const modifiedKeys = {};

  // Look for attributes that need to be set
  Object.keys(attrs).forEach((key) => {
    const value = attrs[key];
    if (key === 'className' || key === 'classname') {
      if (value !== (domElement && domElement.className)) {
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
    } else if (value !== false && value !== (domElement && domElement.getAttribute(key))) {
      ops.push(operations.setAttribute(key, value));
    }
    modifiedKeys[key] = true;
  });

  // Look for attributes that need to be removed.
  if (domElement) {
    const domAttrs = domElement.attributes;
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
function elementToOperations(ops, nomElement, domElement, document) {
  if (!domElement) {
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
      elementAttributesToOperations(ops, nomElement, null);
      // Traverse into the each child.
      /* eslint-disable no-use-before-define */
      writeDomChildren(ops, nomElement, null, document);
      /* eslint-enable no-use-before-define */
      ops.push(operations.popElement());
      ops.push(operations.appendChild());
    }
  } else if (nomElement.nodeName === 'text') {
    ops.push(operations.updateTextContent(nomElement.textContent));
  } else {
    ops.push(operations.pushElement(nomElement, domElement));
    // Synchronize element attributes, including className and event handlers.
    elementAttributesToOperations(ops, nomElement, domElement);
    // Traverse into the each child.
    /* eslint-disable no-use-before-define */
    updateDomChildNodes(ops, nomElement, domElement, document);
    /* eslint-enable no-use-before-define */
    ops.push(operations.popElement());
  }
  return ops;
}

function updateDomChildNodes(ops, nomElement, domElement, document) {
  const nomKids = nomElement.childNodes;
  const domKids = Array.prototype.slice.call(domElement.childNodes);

  if (nomElement.hasUpdateableHandler) {
    ops.push(operations.setRenderFunction(getUpdateElement, nomElement, document));
  }

  const matchedKids = [];
  let i = 0;
  while (i < domKids.length) {
    const domKid = domKids[i];
    const nomKid = nomKids[i];
    if (domKid && nomKid && domKid.nodeName === nomKid.nodeName) {
      elementToOperations(ops, nomKid, domKid, document);
      matchedKids.push(i);
    } else {
      ops.push(operations.removeChild(domKids[i]));
    }
    i += 1;
  }

  i = 0;
  while (i < nomKids.length) {
    if (matchedKids.indexOf(i) === -1) {
      elementToOperations(ops, nomKids[i], null, document);
    }
    i += 1;
  }
}

function writeDomChildren(ops, nomElement, domElement, document) {
  const kids = nomElement.childNodes || [];
  if (kids.length > 0) {
    // We're in a greenfield and need to create children.
    kids.forEach((child) => {
      elementToOperations(ops, child, null, document);
    });
  }
}

/**
 * Using the provided nomElement, and the optionally provided domElement,
 * create a collection of transformations that will make a tree of DOM elements
 * that represent the nomElement tree. If a domElement is provided, it will be
 * interrogated and it will only be touched in places where it differs from
 * the nomElement tree.
 */
function renderElement(nomElement, optDomElement, document) {
  const ops = [];
  elementToOperations(ops, nomElement, optDomElement, document);
  return executeOperations(ops, nomElement, optDomElement, document);
}

export default renderElement;

