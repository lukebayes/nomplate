import htmlEncode from './html_encode';

/**
 * Collection of isolated DOM mutations that can be built into a single list
 * when comparing a set of Nomplate Elements with DOM elements.
 */

function top(stack) {
  return stack[stack.length - 1];
}

function setAttribute(name, value) {
  return function _setAttribute(element, stack, document) {
    element.setAttribute(name, htmlEncode(value));
    return element;
  };
}

function removeAttribute(name) {
  return function _removeAttribute(element) {
    element.removeAttribute(name);
    return element;
  };
}

function setRenderFunction(getUpdateElement, nomElement, document) {
  return function _setRenderFunction(domElement) {
    if (nomElement.hasUpdateableHandler) {
      /* eslint-disable no-param-reassign */
      nomElement.onRender = getUpdateElement(nomElement, document, domElement);
      /* eslint-enable no-param-reassign */
    }
  };
}

function enqueueOnRender(handler) {
  return function _enqueueOnRender(element) {
    // If functions are returned, they will be added to the end of the
    // operation list and executed after the DOM tree has been constructed.
    return function _enqueueOnRenderInternal() {
      handler(element);
    };
  };
}

function setClassName(value) {
  return function _setClassName(element, stack, document) {
    /* eslint-disable no-param-reassign */
    element.className = htmlEncode(value, document);
    /* eslint-enable no-param-reassign */
    return element;
  };
}

function removeClassName() {
  return function _removeClassName(element) {
    element.removeAttribute('class');
    return element;
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
  return function _setHandler(element) {
    /* eslint-disable no-param-reassign */
    element[key] = value;
    /* eslint-enable no-param-reassign */
    const handlersString = element.getAttribute('data-nomhandlers');
    const handlers = handlersString ? handlersString.split(' ') : [];
    if (handlers.indexOf(key) === -1) {
      handlers.push(key);
    }
    element.setAttribute('data-nomhandlers', handlers.join(' '));
    return element;
  };
}

/**
 * We have received an update and the previously applied handler is not longer
 * present.
 */
function removeHandler(key) {
  return function _removeHandler(element) {
    /* eslint-disable no-param-reassign */
    element[key] = null;
    /* eslint-enable no-param-reassign */
    const handlers = element.getAttribute('data-nomhandlers').split(' ');
    const index = handlers.indexOf(key);
    if (index > -1) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      element.removeAttribute('data-nomhandlers');
    } else {
      element.setAttribute('data-nomhandlers', handlers.join(' '));
    }
    return element;
  };
}

function pushElement(nomElement, optDomElement) {
  return function _pushElement(element, stack) {
    const elem = optDomElement || element;
    /* eslint-disable no-param-reassign */
    nomElement.domElement = elem;
    /* eslint-enable no-param-reassign */
    stack.push(elem);
    return elem;
  };
}

function popElement() {
  return function _popElement(element, stack) {
    return stack.pop();
  };
}

function createElement(nomElement, getUpdateElement) {
  return function _createElement(element, stack, document) {
    let domElement;

    if (nomElement.namespace) {
      domElement = document.createElementNS(nomElement.namespace, nomElement.nodeName);
    } else {
      domElement = document.createElement(nomElement.nodeName);
    }

    /* eslint-disable no-param-reassign */
    nomElement.domElement = domElement;
    /* eslint-enable no-param-reassign */

    setRenderFunction(getUpdateElement, nomElement, document)(domElement);

    return domElement;
  };
}

function createTextNode(content) {
  return function _createTextNode(element, stack, document) {
    return document.createTextNode(content);
  };
}

function updateTextContent(content) {
  return function _updateTextContent(element, stack, document) {
    /* eslint-disable no-param-reassign */
    element.textContent = htmlEncode(content, document);
    /* eslint-enable no-param-reassign */
    return element;
  };
}

function appendChild() {
  return function _appendChild(element, stack) {
    const parent = top(stack);
    if (parent) {
      parent.appendChild(element);
    }
    return element;
  };
}

function removeChild(child) {
  return function _removeChild(element, stack) {
    top(stack).removeChild(child);
    return element;
  };
}

function replaceChild() {
  return function _replaceChild(element, stack) {
    top(stack).replaceChild(element);
    return element;
  };
}

export default {
  appendChild,
  enqueueOnRender,
  createElement,
  createTextNode,
  popElement,
  pushElement,
  removeAttribute,
  removeChild,
  removeClassName,
  removeHandler,
  replaceChild,
  setAttribute,
  setClassName,
  setHandler,
  setRenderFunction,
  updateTextContent,
};
