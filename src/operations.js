const config = require('./config');
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
    domElement.id = value;
    return domElement;
  };
}

function setAttribute(name, value) {
  return function _setAttribute(domElement, stack, document) {
    domElement.setAttribute(name, htmlEncode(value));
    return domElement;
  };
}

function removeAttribute(name) {
  return function _removeAttribute(domElement) {
    domElement.removeAttribute(name);
    return domElement;
  };
}

function setRenderFunction(getUpdateElement, nomElement, document) {
  return function _setRenderFunction(domElement) {
    if (nomElement.hasUpdateableHandler) {
      /* eslint-disable no-param-reassign */
      nomElement.render = getUpdateElement(nomElement, document, domElement);
      /* eslint-enable no-param-reassign */
    }
  };
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
    const handlersString = domElement.getAttribute('data-nomhandlers');
    const handlers = handlersString ? handlersString.split(' ') : [];
    if (handlers.indexOf(key) === -1) {
      handlers.push(key);
    }
    domElement.setAttribute('data-nomhandlers', handlers.join(' '));
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
    const handlers = domElement.getAttribute('data-nomhandlers').split(' ');
    const index = handlers.indexOf(key);
    if (index > -1) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      domElement.removeAttribute('data-nomhandlers');
    } else {
      domElement.setAttribute('data-nomhandlers', handlers.join(' '));
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

function pushDomElement(domElement) {
  return function _pushDomElement(_domElement, stack) {
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

    setRenderFunction(getUpdateElement, nomElement, document)(newDomElement);

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

function appendChild() {
  return function _appendChild(domElement, stack) {
    const parent = top(stack);
    if (parent) {
      parent.appendChild(domElement);
    }

    return domElement;
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
  createTextNode,
  enqueueOnRender,
  execute,
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
  setHandler,
  setId,
  setRenderFunction,
  updateInnerHTML,
  updateTextContent,
};
