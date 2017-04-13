/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, global) {'use strict';

	var dom = __webpack_require__(2).dom;
	var renderElement = __webpack_require__(2).renderElement;

	var DOM_CONTENT_LOADED = 'DOMContentLoaded';

	function client(doc) {
	  // Render the application immediately. This can begin before the DOM is fully ready.
	  var app = renderElement(dom.h1('HELLO WORLD 34343'), doc);

	  function contentLoadedHandler() {
	    // Get the element where we will attach the application.
	    var context = doc.getElementById('context');
	    // Attach the application.
	    context.appendChild(app);
	    // Clean up this dangling listener.
	    doc.removeEventListener(DOM_CONTENT_LOADED, contentLoadedHandler);
	  };

	  // Wait until the DOM is ready (works in IE9+ and all others?)
	  doc.addEventListener(DOM_CONTENT_LOADED, contentLoadedHandler);
	}

	module.exports = client;

	// If we're the entry point (e.g., not running in test environment), execute the
	// main client function.
	if (__webpack_require__.c[0] === module) {
	  client(global.document);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module), (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Element = __webpack_require__(3);
	var builder = __webpack_require__(5);
	var dom = __webpack_require__(7);
	var generateId = __webpack_require__(8);
	var htmlEncode = __webpack_require__(9);
	var operations = __webpack_require__(10);
	var renderElement = __webpack_require__(11);
	var renderString = __webpack_require__(12);
	var scheduler = __webpack_require__(6);
	var svg = __webpack_require__(13);

	// Expose the forceUpdate function.
	var forceUpdate = builder.forceUpdate;

	module.exports = {
	  Element: Element,
	  builder: builder,
	  dom: dom,
	  forceUpdate: forceUpdate,
	  generateId: generateId,
	  htmlEncode: htmlEncode,
	  operations: operations,
	  renderElement: renderElement,
	  renderString: renderString,
	  scheduler: scheduler,
	  svg: svg
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var TextElement = __webpack_require__(4);

	/* eslint-disable no-underscore-dangle */
	// Shared attribute object to avoid GC churn.
	var DEFAULT_NODE_NAME = 'node';

	/**
	 * Element struct
	 */

	var Element = function () {
	  function Element(nodeName, args, parent, optNamespace) {
	    _classCallCheck(this, Element);

	    this.nodeName = nodeName || DEFAULT_NODE_NAME;
	    this.attrs = args && args.attrs || null;
	    this.parent = parent;
	    this.namespace = optNamespace;

	    this._children = null;
	    this._textContent = null;
	    this._id = this.attrs && this.attrs.id;
	    this._className = this.attrs && this.attrs.className;
	    this.childNodes = [];
	    this.isCollapsible = false;
	    this.textValue = null;

	    // Handler that should be overridden by renderElement if there is an
	    // updateable handler present.
	    this.onRender = null;
	    this.hasUpdateableHandler = false;

	    // Append #text child if provided
	    if (args && args.inlineTextChild) {
	      this.childNodes.push(new TextElement(args.inlineTextChild, this));
	      // Inserting textValue here as shortcut for string renderer.
	      this.textValue = args.inlineTextChild;
	    }
	  }

	  _createClass(Element, [{
	    key: 'id',
	    get: function get() {
	      return this._id;
	    }
	  }, {
	    key: 'className',
	    get: function get() {
	      return this._className;
	    }
	  }, {
	    key: 'textContent',
	    get: function get() {
	      if (!this._textContent) {
	        var str = this.childNodes.map(function (node) {
	          return node.textContent;
	        }).join('');

	        this._textContent = str !== '' ? str : null;
	      }

	      return this._textContent || '';
	    }
	  }, {
	    key: 'children',
	    get: function get() {
	      if (!this._children) {
	        this._children = this.childNodes.filter(function (node) {
	          return node.nodeName !== 'text';
	        });
	      }
	      return this._children;
	    }
	  }, {
	    key: 'firstChild',
	    get: function get() {
	      return this.childNodes && this.childNodes[0] || null;
	    }
	  }]);

	  return Element;
	}();

	module.exports = Element;

	/* eslint-enable no-underscore-dangle */

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var FROZEN_CHILD_NODES = Object.freeze([]);
	var FROZEN_ATTRIBUTES = Object.freeze([]);

	var TextElement = function TextElement(textContent, parentNode) {
	  _classCallCheck(this, TextElement);

	  this.nodeName = 'text';
	  this.textContent = textContent;
	  this.parent = parentNode;
	  this.attributes = FROZEN_ATTRIBUTES;
	  this.childNodes = FROZEN_CHILD_NODES;
	};

	module.exports = TextElement;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var Element = __webpack_require__(3);
	var scheduler = __webpack_require__(6);

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
	var schedule = scheduler(global.requestAnimationFrame || global.setTimeout);

	var stack = [];

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
	    return value.filter(function (entry) {
	      return !!entry && entry !== -1;
	    }).join(' ');
	  } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
	    return Object.keys(value).filter(function (key) {
	      return !!value[key] && value[key] !== -1;
	    }).join(' ');
	  }
	  return value;
	}

	function getRenderScheduler(elem, handler) {
	  return function _getRenderScheduler(optCompleteHandler) {
	    if (elem.onRender) {
	      schedule(elem, function () {
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
	  if (attrs) {
	    if (attrs.className) {
	      /* eslint-disable no-param-reassign */
	      attrs.className = processClassName(attrs.className);
	      /* eslint-enable no-param-reassign */
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
	function processArgs() {
	  var attrs = void 0;
	  var inlineTextChild = void 0;
	  var handler = void 0;
	  var type = void 0;

	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }

	  args.forEach(function (value) {
	    type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
	    if (type !== 'undefined') {
	      if (type === 'string') {
	        inlineTextChild = value;
	      } else if (type === 'function') {
	        handler = value;
	      } else if (value) {
	        attrs = processAttrs(value);
	      }
	    }
	  });

	  return {
	    attrs: attrs,
	    inlineTextChild: inlineTextChild,
	    handler: handler
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
	    var parent = top();
	    var attrs = processArgs(optAttrs, optHandler, optContent);
	    var elem = new Element(nodeName, attrs, parent, optNamespace);

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
	builder.elementWrapper = function (nodeName, optNamespace) {
	  return function _elementWrapper(optAttrs, optHandler, optContent) {
	    return builder(nodeName, optAttrs, optHandler, optContent, optNamespace);
	  };
	};

	module.exports = builder;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Render scheduler (stub for now).
	 */
	function scheduler(animationFrame) {
	  var pendingElements = [];
	  var pendingHandlers = [];

	  var responseIsPending = false;

	  function filterChildren(elements) {
	    return elements.filter(function (elem, index) {
	      var parent = elem.parent;
	      while (parent) {
	        if (elements.indexOf(parent) > -1) {
	          pendingHandlers.splice(index, 1);
	          return false;
	        }
	        parent = parent.parent;
	      }

	      return true;
	    });
	  }

	  function execute() {
	    filterChildren(pendingElements).forEach(function (elem, index) {
	      pendingHandlers[index]();
	    });
	    pendingElements.length = 0;
	    pendingHandlers.length = 0;
	    responseIsPending = false;
	  }

	  // Schedule a handler to be called on the next animation frame
	  function schedule(nomElement, handler) {
	    if (pendingElements.indexOf(nomElement) === -1) {
	      pendingElements.push(nomElement);
	      pendingHandlers.push(handler);

	      if (!responseIsPending) {
	        animationFrame(execute);
	        responseIsPending = true;
	      }
	    }
	  }

	  schedule.forceUpdate = function () {
	    execute();
	  };

	  return schedule;
	}

	module.exports = scheduler;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var builder = __webpack_require__(5);

	var dom = {};

	dom.htmlFourNodes = ['a', 'abbr', 'acronym', 'address', 'applet', 'area', 'b', 'base', 'basefont', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'dfn', 'dir', 'div', 'dl', 'dt', 'em', 'fieldset', 'font', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'isindex', 'kbd', 'label', 'lengend', 'li', 'link', 'map', 'menu', 'meta', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'p', 'param', 'pre', 'q', 's', 'samp', 'script', 'select', 'small', 'span', 'strike', 'strong', 'style', 'sub', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'tt', 'tu', 'u', 'ul', 'var', 'xmp'];

	dom.htmlFiveNodes = dom.htmlFourNodes.concat(['article', 'aside', 'command', 'details', 'summary', 'figure', 'figcaption', 'footer', 'header', 'hgroup', 'mark', 'meter', 'nav', 'progress', 'ruby', 'rt', 'rp', 'section', 'time', 'wbr', 'audio', 'video', 'source', 'embed', 'canvas', 'datalist', 'keygen', 'output', 'tel', 'search', 'url', 'email', 'datetime', 'date', 'month', 'week', 'datetime-local', 'number', 'ranger', 'color']);

	// Enumerate all nodes that should be collapsed
	// when they have no node value...
	dom.collapsibleNodes = ['br', 'hr', 'img'];

	// Apply Each available node to the Html proto:
	dom.htmlFiveNodes.forEach(function (nodeName) {
	  dom[nodeName] = builder.elementWrapper(nodeName);
	});

	dom.collapsibleNodes.forEach(function (nodeName) {
	  // TODO(lbayes): Introduce support for callapsible annotations.
	  dom[nodeName] = builder.elementWrapper(nodeName);
	});

	// Enable creation of text nodes.
	dom.text = builder.elementWrapper('text');

	// Helper for stylesheets.
	dom.stylesheet = function (href) {
	  return dom.link({ type: 'text/css', rel: 'stylesheet', href: href });
	};

	module.exports = dom;

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Fast UUID generator, RFC4122 version 4 compliant.
	 * @author Jeff Ward (jcward.com).
	 * @license MIT license
	 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
	 *
	 * Modified for readability and shorter/faster ids by Luke Bayes.
	 */
	/* eslint-disable no-bitwise */
	/* eslint-disable no-mixed-operators */
	/* eslint-disable prefer-template */

	var lut = [];

	for (var i = 0; i < 256; i += 1) {
	  lut[i] = (i < 16 ? '0' : '') + i.toString(16);
	}

	function generateId() {
	  var d0 = Math.random() * 0xffffffff | 0;
	  var d1 = Math.random() * 0xffffffff | 0;

	  var id = lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff];

	  return id;
	}

	module.exports = generateId;

	/* eslint-enable no-bitwise */
	/* eslint-enable no-mixed-operators */
	/* eslint-enable prefer-template */

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var sharedTextArea = null;

	function getTextArea(document) {
	  if (!sharedTextArea) {
	    sharedTextArea = document.createElement('textarea');
	  }
	  return sharedTextArea;
	}

	/**
	 * Encode HTML entities.
	 *
	 * Performance tips found here:
	 * http://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
	 */
	function htmlEncode(str, optDocument) {
	  var type = typeof str === 'undefined' ? 'undefined' : _typeof(str);
	  if (type === 'number' || type === 'boolean') {
	    return String(str);
	  } else if (str === null || type === 'undefined' || !str.replace) {
	    return '';
	  }

	  if (optDocument) {
	    // If we have a document object, use the much faster textArea encoding scheme.
	    var textArea = getTextArea(optDocument);
	    textArea.textContent = str;
	    return textArea.innerHTML;
	  } else {
	    // It looks like we're on the server, use the slower string  replace. The
	    // scheme below is slightly faster than repeated replace calls.
	    var map = {
	      "&": "&amp;",
	      "<": "&lt;",
	      ">": "&gt;",
	      "\"": "&quot;",
	      "'": "&#39;" // ' -> &apos; for XML only
	    };
	    return str.replace(/[&<>"']/g, function (m) {
	      return map[m];
	    });
	  }
	}

	module.exports = htmlEncode;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var htmlEncode = __webpack_require__(9);

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
	    var handlersString = element.getAttribute('data-nomhandlers');
	    var handlers = handlersString ? handlersString.split(' ') : [];
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
	    var handlers = element.getAttribute('data-nomhandlers').split(' ');
	    var index = handlers.indexOf(key);
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
	    var elem = optDomElement || element;
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
	    var domElement = void 0;

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
	    var parent = top(stack);
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

	module.exports = {
	  appendChild: appendChild,
	  enqueueOnRender: enqueueOnRender,
	  createElement: createElement,
	  createTextNode: createTextNode,
	  popElement: popElement,
	  pushElement: pushElement,
	  removeAttribute: removeAttribute,
	  removeChild: removeChild,
	  removeClassName: removeClassName,
	  removeHandler: removeHandler,
	  replaceChild: replaceChild,
	  setAttribute: setAttribute,
	  setClassName: setClassName,
	  setHandler: setHandler,
	  setRenderFunction: setRenderFunction,
	  updateTextContent: updateTextContent
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var operations = __webpack_require__(10);

	var EMPTY_ATTRS = Object.freeze({});
	var KEY_UP = 'keyup';

	// TODO(lbayes): Provide the globals to the module.
	var localSetTimeout = global.setTimeout;

	function getUpdateElement(nomElement, document, optDomElement) {
	  return function _updateElement(builder, handler, optCompleteHandler) {
	    var parentNode = optDomElement.parentNode;
	    var newNomElement = builder(nomElement.nodeName, nomElement.attrs, handler);
	    localSetTimeout(function () {
	      var nullOrParentElement = parentNode ? null : optDomElement;

	      /* eslint-disable no-use-before-define */
	      var newDomElement = renderElement(newNomElement, document, nullOrParentElement);
	      /* eslint-enable no-use-before-define */

	      localSetTimeout(function () {
	        if (parentNode) {
	          parentNode.replaceChild(newDomElement, optDomElement);
	        }

	        if (optCompleteHandler && typeof optCompleteHandler === 'function') {
	          localSetTimeout(function () {
	            optCompleteHandler(newDomElement, newNomElement);
	          }, 0);
	        }
	      }, 0);
	    }, 0);
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
	  var stack = [];
	  var trailingActions = [];

	  var root = ops.reduce(function (lastElement, operation) {
	    var result = operation(lastElement, stack, document);
	    if (typeof result === 'function') {
	      trailingActions.push(result);
	      return lastElement;
	    }
	    return result;
	  }, optDomElement);

	  trailingActions.forEach(function (action) {
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
	  var key = origKey.toLowerCase();
	  if (key === 'onenter') {
	    // TODO(lbayes): Subscriptions to onEnter and onKeyup are mutually exclusive!
	    // Syntactic sugar for common usecase
	    ops.push(operations.setHandler(KEY_UP, onEnterHandler(value)));
	  } else {
	    ops.push(operations.setHandler(key, value));
	  }
	}

	function elementAttributesToOperations(ops, nomElement, optDomElement) {
	  var attrs = nomElement.attrs || EMPTY_ATTRS;
	  var modifiedKeys = {};

	  // Look for attributes that need to be set
	  Object.keys(attrs).forEach(function (key) {
	    var value = attrs[key];
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
	    var domAttrs = optDomElement.attributes;
	    for (var i = 0, len = domAttrs.length; i < len; i += 1) {
	      var key = domAttrs[i].name;
	      if (key === 'class') {
	        if (!modifiedKeys.className) {
	          ops.push(operations.removeClassName());
	        }
	      } else if (key === 'data-nomhandlers') {
	        var handlers = domAttrs[i].value.split(' ');
	        handlers.forEach(function (handlerName) {
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
	  var nomKids = nomElement.childNodes;
	  var domKids = Array.prototype.slice.call(optDomElement.childNodes);

	  if (nomElement.hasUpdateableHandler) {
	    ops.push(operations.setRenderFunction(getUpdateElement, nomElement, document));
	  }

	  var matchedKids = [];
	  var i = 0;
	  while (i < domKids.length) {
	    var domKid = domKids[i];
	    var nomKid = nomKids[i];
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
	  var kids = nomElement.childNodes || [];
	  if (kids.length > 0) {
	    // We're in a greenfield and need to create children.
	    kids.forEach(function (child) {
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
	  var ops = [];
	  elementToOperations(ops, nomElement, document, optDomElement);
	  return executeOperations(ops, nomElement, document, optDomElement);
	}

	module.exports = renderElement;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var dom = __webpack_require__(7);
	var htmlEncode = __webpack_require__(9);

	function renderString() {
	  var carriageReturn = '\n';
	  var indentation = '  ';

	  var output = [];
	  var pretty = false;
	  var indents = 0;
	  var stream = null;

	  function writeToStream(message) {
	    if (stream) {
	      stream.write(message);
	    }
	  }

	  function write(message) {
	    output.push(message);
	    writeToStream(message);
	  }

	  function writeAttributes(attributes) {
	    var rendered = [];

	    if (attributes) {
	      write(' ');
	      Object.keys(attributes).forEach(function (key) {
	        var updatedKey = key === 'className' ? 'class' : key;
	        var value = attributes[key];
	        if (typeof value !== 'function' && value !== false) {
	          rendered.push(updatedKey + '="' + htmlEncode(value) + '"');
	        }
	      });

	      write(rendered.join(' '));
	    } else {
	      write('');
	    }
	  }

	  function writeOpener(nodeName, attributes) {
	    write('<' + nodeName);
	    writeAttributes(attributes);
	  }

	  function writeCloser(nodeName) {
	    write('</' + nodeName + '>');
	  }

	  function indent() {
	    indents += 1;
	  }

	  function unindent() {
	    indents -= 1;
	  }

	  function writeCarriageReturn() {
	    if (pretty) {
	      write(carriageReturn);
	    }
	  }

	  function writeIndentation() {
	    if (pretty) {
	      for (var i = 0; i < indents; i += 1) {
	        write(indentation);
	      }
	    }
	  }

	  function isCollapsible(nodeName, textValue, childCount) {
	    return textValue === null && childCount === 0 && dom.collapsibleNodes.indexOf(nodeName) > -1;
	  }

	  function renderNode(element) {
	    if (!element) {
	      throw new Error('Cannot render falsy element.');
	    }
	    var attributes = element.attrs;
	    var children = element.children;
	    var nodeName = element.nodeName;
	    // NOTE(lbayes): textContent will derive from children, textValue is explicitly set by
	    // the builder.
	    var textValue = element.textValue;

	    writeIndentation();
	    writeOpener(nodeName, attributes);

	    var collapsed = isCollapsible(nodeName, textValue, children.length);

	    if (!collapsed) {
	      write('>');
	    }

	    if (textValue) {
	      write(htmlEncode(textValue));
	    }

	    if (children.length > 0) {
	      writeCarriageReturn();
	      indent();
	      /* eslint-disable no-use-before-define */
	      processChildren(children);
	      /* eslint-enable no-use-before-define */
	      unindent();
	      writeIndentation();
	    }

	    if (collapsed) {
	      write(' />');
	      return;
	    }

	    writeCloser(nodeName);
	    writeCarriageReturn();
	  }

	  function processChildren(childNodes) {
	    childNodes.forEach(function (child) {
	      renderNode(child);
	    });
	  }

	  /**
	   * Render the provided element as a string result and if a stream is provided,
	   * write output into it as elements are processed.
	   */
	  return function render(element, optPrettyPrint, optStream) {
	    pretty = optPrettyPrint;
	    indents = 0;
	    stream = optStream || null;

	    renderNode(element);

	    var result = output.join('');
	    output = [];
	    return result;
	  };
	}

	module.exports = renderString;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var builder = __webpack_require__(5);

	var namespace = 'http://www.w3.org/2000/svg';

	var svg = builder.elementWrapper('svg', namespace);

	var svgNodes = ['a', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'script', 'set', 'stop', 'style', 'svg', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref', 'tspan', 'use', 'view', 'vkern'];

	// Apply Each available node to the Html proto:
	svgNodes.forEach(function (nodeName) {
	  svg[nodeName] = builder.elementWrapper(nodeName, namespace);
	});

	module.exports = svg;

/***/ }
/******/ ]);