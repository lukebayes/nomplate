const config = require('./config');
const constants = require('./constants');
const htmlEncode = require('./html_encode');

/**
 * Collection of isolated DOM mutations that can be built into a single list
 * when comparing a set of Nomplate Elements with DOM elements.
 */

function top(stack) {
  return stack[stack.length - 1];
}

function setId(value) {
  return function _setId(domElement, stack, document) {
    if (value !== null && value !== undefined) {
      domElement.id = value;
    }
    return domElement;
  };
}

function setAttribute(name, value) {
  return function _setAttribute(domElement, stack, document) {
    const updatedName = name === 'key' ? constants.NOM_ATTR_KEY : name;

    if (typeof value === 'boolean' && !value) {
      domElement.removeAttribute(updatedName);
    } else {
      domElement.setAttribute(updatedName, name === 'href' ? value : htmlEncode(value));
    }

    if (constants.PROP_ATTRS.indexOf(name) > -1) {
      domElement[name] = value;
    }

    return domElement;
  };
}

function setDataAttribute(name, value) {
  return function _setDataAttribute(domElement, stack, document) {
    const updated = typeof value === 'string' ? htmlEncode(value, document) : value;
    domElement.dataset[name] = updated;
    return domElement;
  };
}

function removeAttribute(name) {
  return function _removeAttribute(domElement) {
    if (constants.PROP_ATTRS.indexOf(name) > -1) {
      domElement[name] = '';
    }

    domElement.removeAttribute(name);
    return domElement;
  };
}

function _setRenderFunction(getUpdateElement, nomElement, document, domElement) {
  if (nomElement.hasUpdateableHandler) {
    /* eslint-disable no-param-reassign */
    nomElement.render = getUpdateElement(nomElement, document, domElement);
    /* eslint-enable no-param-reassign */
  }
}

function enqueueOnRender(handler) {
  return function _enqueueOnRender(domElement) {
    // If functions are returned, they will be added to the end of the
    // operation list and executed after the DOM tree has been constructed.
    return function _enqueueOnRenderInternal() {
      // PERF(lbayes): try..catch blocks have notorious performance problems,
      // investigate altarnative approaches.
      try {
        handler(domElement);
      } catch (err) {
        console.error(err);
      }
    };
  };
}

function setClassName(value) {
  return function _setClassName(domElement, stack, document) {
    /* eslint-disable no-param-reassign */
    domElement.className = htmlEncode(value, document);
    /* eslint-enable no-param-reassign */
    return domElement;
  };
}

function removeClassName() {
  return function _removeClassName(domElement) {
    domElement.removeAttribute('class');
    return domElement;
  };
}

/**
 * When a handler is set on an element, we need to track it so that it can be
 * removed if a future update does not provide this handler. We do this by
 * storing the collection of active handler keys in the element
 * data-nomhandlers attribute. We manage duplicates on write and will remove
 * or replace all handlers whenever an element is updated.
 */
function setHandler(key, value) {
  return function _setHandler(domElement) {
    /* eslint-disable no-param-reassign */
    domElement[key] = value;
    /* eslint-enable no-param-reassign */
    // TODO(lbayes): Use dataset and DOMStringMap instead!
    const handlersString = domElement.getAttribute(constants.NOM_HANDLERS_KEY);
    const handlers = handlersString ? handlersString.split(' ') : [];
    if (handlers.indexOf(key) === -1) {
      handlers.push(key);
    }
    domElement.setAttribute(constants.NOM_HANDLERS_KEY, handlers.join(' '));
    return domElement;
  };
}

/**
 * We have received an update and the previously applied handler is not longer
 * present.
 */
function removeHandler(key) {
  return function _removeHandler(domElement) {
    /* eslint-disable no-param-reassign */
    domElement[key] = null;
    /* eslint-enable no-param-reassign */
    // TODO(lbayes): Use dataset and DOMStringMap instead!
    const handlers = domElement.getAttribute(constants.NOM_HANDLERS_KEY).split(' ');
    const index = handlers.indexOf(key);
    if (index > -1) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      domElement.removeAttribute(constants.NOM_HANDLERS_KEY);
    } else {
      domElement.setAttribute(constants.NOM_HANDLERS_KEY, handlers.join(' '));
    }
    return domElement;
  };
}

function pushElement(nomElement) {
  return function _pushElement(domElement, stack) {
    stack.push(domElement);
    return domElement;
  };
}

function pushDomElement(nomElement, getUpdateElement, domElement) {
  return function _pushDomElement(_domElement, stack, document) {
    // Apply the .render function to the expected nomElement
    _setRenderFunction(getUpdateElement, nomElement, document, domElement);

    return domElement;
  };
}

function popElement() {
  return function _popElement(domElement, stack) {
    return stack.pop();
  };
}

function createElement(nomElement, getUpdateElement) {
  return function _createElement(domElement, stack, document) {
    let newDomElement;

    if (nomElement.namespace) {
      newDomElement = document.createElementNS(nomElement.namespace, nomElement.nodeName);
    } else {
      newDomElement = document.createElement(nomElement.nodeName);
    }

    _setRenderFunction(getUpdateElement, nomElement, document, newDomElement);

    return newDomElement;
  };
}

function createTextNode(content) {
  return function _createTextNode(domElement, stack, document) {
    const text = document.createTextNode(htmlEncode(content, document));
    const parent = top(stack);
    parent.appendChild(text);
    return parent;
  };
}

function updateInnerHTML(content) {
  return function _updateInnerHTML(domElement, stack, document) {
    domElement.innerHTML = content;
    return domElement;
  };
}

function updateTextContent(content) {
  return function _updateTextContent(domElement, stack, document) {
    /* eslint-disable no-param-reassign */
    domElement.textContent = htmlEncode(content, document);
    /* eslint-enable no-param-reassign */
    return domElement;
  };
}

function createExternalElement(nomElement) {
  return function _createExternalElement(domElement, stack) {
    const parent = top(stack);
    const dElem = nomElement.domElement;
    if (parent) {
      parent.appendChild(dElem);
    }
    return dElem;
  };
}

function appendChild() {
  return function _appendChild(domElement, stack) {
    const parent = top(stack);
    if (parent) {
      parent.appendChild(domElement || optDomElement);
    }

    return domElement;
  };
}

function moveToIndex(existingNode, index) {
  return function _insertDomBefore(domElement, stack, document) {
    const parent = top(stack);
    if (parent) {
      const sibling = parent.childNodes[index];
      if (sibling !== domElement) {
        parent.insertBefore(existingNode, sibling);
      }
    }
  };
}

function removeChild(child) {
  return function _removeChild(domElement, stack) {
    top(stack).removeChild(child);
    return domElement;
  };
}

function removeAllChildren() {
  return function _removeAllChildren(domElement, stack) {
    while (domElement.firstChild) {
        domElement.removeChild(domElement.firstChild);
    }
    return domElement;
  };
}

function replaceChild(existingElement) {
  return function _replaceChild(domElement, stack) {
    top(stack).replaceChild(domElement, existingElement);
    return domElement;
  };
}

/**
 * Execute the provided operations.
 */
function execute(ops, doc, domElement) {
  const outerStack = [];
  const trailingActions = [];

  const root = ops.reduce((lastDomElement, operation) => {
    const result = operation(lastDomElement, outerStack, doc);
    // Uncomment to diagnose issues with tree creation or updates:
    // console.log('returning:', result && result.nodeName, operation.toString().split('\n').shift().split(' ')[1]);

    if (typeof result === 'function') {
      trailingActions.push(result);
      return lastDomElement;
    }
    return result;
  }, domElement);

  // Any operation that returns a function (e.g., onRender ops) will have the
  // returned handler executed in the next interval.
  // This allows handlers like onRender to accept DOM elements and call methods
  // (like focus()) after the elements have been attached to the document
  // during an update() lifecycle.
  config().setTimeout(() => {
    // NOTE(lbayes): This is now disconnected from the main request thread,
    // exceptions may get swallowed. The implementation of enqueueOnRender
    // does make an effort to continue after user-defined exceptions, so at
    // least we should not see mysterious missed calls if a previous call
    // fails.
    trailingActions.forEach((action) => {
      action();
    });
  });

  return root;
}


module.exports = {
  appendChild,
  createElement,
  createExternalElement,
  createTextNode,
  enqueueOnRender,
  execute,
  moveToIndex,
  popElement,
  pushDomElement,
  pushElement,
  removeAllChildren,
  removeAttribute,
  removeChild,
  removeClassName,
  removeHandler,
  replaceChild,
  setAttribute,
  setClassName,
  setDataAttribute,
  setHandler,
  setId,
  updateInnerHTML,
  updateTextContent,
};
