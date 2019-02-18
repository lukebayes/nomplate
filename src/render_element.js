const operations = require('./operations');

const EMPTY_ATTRS = Object.freeze({});

/**
 *  If a DOM element definition contains a block that has one or more arguments
 *  defined, the inner function that this returns will
 */
function getUpdateElement(nomElement, doc, lastDomElement) {
  return function _updateElement(builder, handler, optCompleteHandler) {
    // TODO(lbayes): Consider hiding the existing dom element while we reconstitute the tree
    // in order to avoid unnecessary reflows and repaints?
    const newNomElement = builder(nomElement.nodeName, nomElement.attrs, handler);
    newNomElement.render = nomElement.render;

    if (nomElement.parent) {
      nomElement.parent.replaceChild(newNomElement, nomElement);
    }

    /* eslint-disable no-use-before-define */
    const newDomElement = renderElement(newNomElement, doc, lastDomElement);
    /* eslint-enable no-use-before-define */

    if (lastDomElement !== newDomElement && lastDomElement.parentNode) {
      lastDomElement.parentNode.replaceChild(newDomElement, lastDomElement);
    }

    if (optCompleteHandler && typeof optCompleteHandler === 'function') {
      setTimeout(() => {
        optCompleteHandler(newDomElement, newNomElement);
      });
    }
  };
}

/**
 * Get and call the appropriate update strategy for child nodes.
 */
function nomElementChildNodesToOperations(ops, nomElement, doc, optDomElement) {
  getChildUpdateStrategy(nomElement, optDomElement)(ops, nomElement, doc, optDomElement);
}

function updateEachChild(ops, nomElement, doc, optDomElement) {
  const kids = nomElement.childNodes || [];
  for (let i = 0, len = kids.length; i < len; ++i) {
    const nomChild = kids[i];
    const domChild = optDomElement && optDomElement.childNodes[i];
    nomElementToOperations(ops, nomChild, doc, domChild);
  }
}

function replaceAllChildren(ops, nomElement, doc, domElement) {
  while(domElement.firstChild) {
    domElement.removeChild(domElement.firstChild);
  }
  updateEachChild(ops, nomElement, doc, domElement);
}

function getChildUpdateStrategy(nomElement, optDomElement) {
  if (!optDomElement || childrenAreSimilarEnough(nomElement, optDomElement)) {
    return updateEachChild;
  } else {
    return replaceAllChildren;
  }
}

function childrenMatch(domKids) {
  return function(child, index) {
    return child.nodeName === domKids[index].nodeName.toLowerCase();
  };
}

function childrenAreSimilarEnough(nomElement, domElement) {
  return nomElement.childNodes.length === domElement.childNodes.length &&
    nomElement.childNodes.every(childrenMatch(domElement.childNodes));
}

function createDispatcherOperation(ops, nomElement, key, value) {
  if (key === 'onenter') {
    // TODO(lbayes): Subscriptions to onEnter and onKeyup are mutually exclusive!
    // Syntactic sugar for common usecase
    ops.push(operations.setHandler(KEY_UP, onEnterHandler(value)));
  } else {
    ops.push(operations.setHandler(key, value));
  }
}

/**
 * Build operations from the current element's attributes.
 */
function elementAttributesToOperations(ops, nomElement, optDomElement) {
  const attrs = nomElement.attrs || EMPTY_ATTRS;

  Object.keys(attrs).forEach((keyWithCase) => {
    const value = attrs[keyWithCase];
    const key = keyWithCase.toLowerCase();

    if (key === 'id' && (!optDomElement || value !== optDomElement.id)) {
      ops.push(operations.setId(value));
    } else if (key === 'classname' && (!optDomElement || value !== optDomElement.className)) {
      ops.push(operations.setClassName(value));
    } else if (key === 'onrender') {
      if (typeof value === 'function') {
        ops.push(operations.enqueueOnRender(value));
      } else {
        throw new Error('onRender requires a function handler');
      }
    } else if (typeof value === 'function') {
      createDispatcherOperation(ops, nomElement, key, value);
    } else if (!optDomElement && value !== false) {
      // Ensure we set the attribute name with provided case.
      ops.push(operations.setAttribute(keyWithCase, value));
    } else if (optDomElement && value !== optDomElement.getAttribute(keyWithCase)) {
      ops.push(operations.setAttribute(keyWithCase, value));
    }
  });
}

/**
 * Create new DOM elements from the provided NOM element.
 */
function nomElementToOperations(ops, nomElement, doc, optDomElement) {
  if (nomElement.nodeName === 'text') {
    ops.push(operations.removeAllChildren());
    ops.push(operations.createTextNode(nomElement.textValue));
  } else {
    if (!optDomElement) {
      // Create the new element.
      ops.push(operations.createElement(nomElement, getUpdateElement));
    } else {
      ops.push(operations.pushDomElement(optDomElement));
    }

    // Push the new element onto the stack so that subsequent operations apply to it.
    ops.push(operations.pushElement(nomElement));

    if (nomElement.nodeName === 'style' && nomElement.selectors) {
      ops.push(operations.updateInnerHTML(nomElement.renderSelectors()));
    }

    // Synchronize element attributes, including className and event handlers.
    elementAttributesToOperations(ops, nomElement, optDomElement);

    // Handle custom CSS styles.
    // Traverse into the each child.
    nomElementChildNodesToOperations(ops, nomElement, doc, optDomElement);

    // Pop the new element off the stack.
    ops.push(operations.popElement());

    if (!optDomElement) {
      // Append the element tree to the current parent.
      ops.push(operations.appendChild());
    }
  }
}

function renderElement(nomElement, doc, optDomElement) {
  if (!doc) {
    throw new IllegalOperationError('renderElement requires a reference to an HTML document.');
  }

  const ops = [];
  nomElementToOperations(ops, nomElement, doc, optDomElement);
  return operations.execute(ops, doc, optDomElement);
}

module.exports = renderElement;

