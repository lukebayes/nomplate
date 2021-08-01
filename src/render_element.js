const constants = require('./constants');
const events = require('./events');
const operations = require('./operations');

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

function updateOrCreateEachChildStrategy(ops, nomElement, doc, optDomElement) {
  const kids = nomElement.childNodes || [];
  for (let i = 0, len = kids.length; i < len; ++i) {
    const nomChild = kids[i];
    const domChild = optDomElement && optDomElement.childNodes[i];
    nomElementToOperations(ops, nomChild, doc, domChild);
  }
}

function replaceAllChildrenStrategy(ops, nomElement, doc, domElement) {
  while(domElement.firstChild) {
    domElement.removeChild(domElement.firstChild);
  }
  updateOrCreateEachChildStrategy(ops, nomElement, doc, domElement);
}

function updateChildrenWithKeysStrategy(ops, nomElement, doc, domElement) {
  // NOTE(lbayes): Clone the dom children so that we can remove
  // matched elements.
  const domKids = Array.prototype.slice.call(domElement.children);
  const nomKids = nomElement.children;
  const mapped = [];

  for (var i = 0, len = nomKids.length; i < len; ++i) {
    const nomKid = nomKids[i];
    const key = nomKid.getAttribute('key');
    const matched = removeChildWithMatchingKey(key, domKids);

    if (matched) {
      mapped.push({
        nom: nomKid,
        dom: matched,
      });
      ops.push(operations.moveToIndex(matched, i));
    }
  }

  while(domKids.length > 0) {
    ops.push(operations.removeChild(domKids.shift()));
  }
}

function removeChildWithMatchingKey(keyValue, domElements) {
  for (var i = 0, len = domElements.length; i < len; ++i) {
    const domElement = domElements[i];
    if (getNomKeyValue(domElement) === keyValue) {
      domElements.splice(i, 1);
      return domElement;
    }
  }
  return null;
}

/**
 * Get a function that can be used to update element children based
 * on the shape of the provided nomplate and DOM elements.
 */
function getChildUpdateStrategy(nomElement, optDomElement) {
  if (optDomElement && allChildrenHaveKeys(nomElement, optDomElement)) {
    return updateChildrenWithKeysStrategy;
  } else if (!optDomElement || childrenArInterchangeable(nomElement, optDomElement)) {
    return updateOrCreateEachChildStrategy;
  } else {
    return replaceAllChildrenStrategy;
  }
}

/**
 * Returns a function that will ensure each DOM element is the same
 * type as each provided nomplate element.
 */
function elementsMatch(domKids) {
  return function(child, index) {
    return child.nodeName === domKids[index].nodeName.toLowerCase();
  };
}

/**
 * Returns true if child counts are the same and each child type is the same,
 */
function childrenArInterchangeable(nomElement, domElement) {
  return nomElement.childNodes.length === domElement.childNodes.length &&
    nomElement.childNodes.every(elementsMatch(domElement.childNodes));
}

function allChildrenHaveKeys(nomElement, optDomElement) {
  if (!optDomElement || optDomElement.children.length === 0) {
    return false;
  }

  // NOTE(lbayes): Using .children below to avoid #text nodes.
  const kids = optDomElement.children;
  for (var i = 0, len = kids.length; i < len; ++i) {
    if (!getNomKeyValue(kids[i])) {
      return false;
    }
  }

  return true;
}

function getNomKeyValue(optDomElement) {
  return optDomElement && optDomElement.getAttribute(constants.NOM_ATTR_KEY);
}

function createOnEnterHandler(handler) {
  return function(event) {
    if (event && event.keyCode === 13) {
      handler(event);
    }
  };
}

function createDispatcherOperation(ops, nomElement, name, handler) {
  if (name === events.ON_ENTER) {
    // NOTE(lbayes): Subscriptions to onEnter and onKeyup are mutually exclusive, an exception
    // will be thrown by the builder if these are both subscribed.
    ops.push(operations.setHandler(events.ON_KEY_UP, createOnEnterHandler(handler)));
  } else {
    ops.push(operations.setHandler(name, handler));
  }
}

function getAllAttributeKeys(attrs, optDomElement) {
  const allKeys = Object.keys((attrs || constants.EMPTY_ATTRS));
  if (optDomElement) {
    const domKeys = Array.prototype.slice.call(optDomElement.attributes).map((attr) => {
      return attr.name === 'class' ? 'className' : attr.name;
    });
    return allKeys.concat(domKeys);
  }
  return allKeys;
}

function isEmptyObject(value) {
  return (value && typeof value === 'object' && Object.keys(value).length === 0);
}

/**
 * Build operations from the current element's attributes.
 */
function elementAttributesToOperations(ops, nomElement, optDomElement) {
  const attrs = nomElement.attrs || constants.EMPTY_ATTRS;

  getAllAttributeKeys(attrs, optDomElement).forEach((keyWithCase) => {
    const value = attrs[keyWithCase];
    const lowerCaseKey = keyWithCase.toLowerCase();

    if (lowerCaseKey === 'id') {
      if (!optDomElement || value !== optDomElement.id) {
        ops.push(operations.setId(value));
      }
    } else if (lowerCaseKey === 'classname') {
      if (optDomElement && value !== optDomElement.className) {
        if (!value) {
          ops.push(operations.removeClassName());
        } else {
          ops.push(operations.setClassName(value));
        }
      } else {
        ops.push(operations.setClassName(value));
      }
    } else if (lowerCaseKey === 'key') {
      if (!optDomElement || value !== getNomKeyValue(optDomElement)) {
        ops.push(operations.setAttribute(lowerCaseKey, value));
      }
    } else if (lowerCaseKey === 'onrender') {
      if (typeof value === 'function') {
        ops.push(operations.enqueueOnRender(value));
      } else {
        throw new Error('onRender requires a function handler');
      }
    } else if (typeof value === 'function') {
      createDispatcherOperation(ops, nomElement, lowerCaseKey, value);
    } else if (!optDomElement) {
      if (value !== false && value !== 'false' && !isEmptyObject(value)) {
        // Ensure we set the attribute name with provided case.
        ops.push(operations.setAttribute(keyWithCase, value));
      }
    } else if (optDomElement) {
      const domValue = optDomElement.getAttribute(keyWithCase);
      if (value === '' || value === undefined || value === null || value === NaN) {
        // Remove invalid/empty-ish attribute values
        ops.push(operations.removeAttribute(keyWithCase, value));
      } else if (value != domValue) {
        // Update attributes with new values:
        ops.push(operations.setAttribute(keyWithCase, value));
      }
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
      ops.push(operations.pushDomElement(nomElement, getUpdateElement, optDomElement));
    }

    // Push the new element onto the stack so that subsequent operations apply to it.
    ops.push(operations.pushElement(nomElement));

    if (nomElement.nodeName === constants.STYLE_NODE_NAME && nomElement.selectors) {
      ops.push(operations.updateInnerHTML(nomElement.renderSelectors()));
    }

    // Synchronize element attributes, including className and event handlers.
    elementAttributesToOperations(ops, nomElement, optDomElement);

    if (nomElement.unsafeContent) {
      ops.push(operations.removeAllChildren());
      ops.push(operations.updateInnerHTML(nomElement.unsafeContent));
    } else {
      // Handle custom CSS styles.
      // Traverse into the each child.
      nomElementChildNodesToOperations(ops, nomElement, doc, optDomElement);
    }

    // Pop the new element off the stack.
    ops.push(operations.popElement());

    if (!optDomElement) {
      // Append the element tree to the current parent.
      ops.push(operations.appendChild());
    }
  }
}

/**
 * Renders the provided Nomplate element using the provided DOM document
 * object and returns a DOM element.
 *
 * This method will select optimal render pipelines depending on the current
 * state of the request. If no DOM element is provided, it will simply
 * create the requested tree. If the DOM element is provided, it will attempt
 * to reuses elements whenever they are similar enough. Element matching is
 * done heuristically, if you want to ensure element reuse, set the 'key'
 * attribute to a value that is stable across updates.
 */
function renderElement(nomElement, doc, optDomElement) {
  if (!doc) {
    throw new Error('renderElement requires a reference to an HTML document.');
  }

  const ops = [];
  nomElementToOperations(ops, nomElement, doc, optDomElement);
  return operations.execute(ops, doc, optDomElement);
}

module.exports = renderElement;

