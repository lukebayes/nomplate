const TextElement = require('./text_element');

/* eslint-disable no-underscore-dangle */
// Shared attribute object to avoid GC churn.
const DEFAULT_NODE_NAME = 'node';

/**
 * Element struct
 */
class Element {
  constructor(nodeName, args, parent, optNamespace) {
    this.nodeName = nodeName || DEFAULT_NODE_NAME;
    this.attrs = (args && args.attrs) || null;
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

  get id() {
    return this._id;
  }

  get className() {
    return this._className;
  }

  get textContent() {
    if (!this._textContent) {
      const str = this.childNodes
        .map(node => node.textContent)
        .join('');

      this._textContent = str !== '' ? str : null;
    }

    return this._textContent || '';
  }

  get children() {
    if (!this._children) {
      this._children = this.childNodes.filter(node => node.nodeName !== 'text');
    }
    return this._children;
  }

  get firstChild() {
    return (this.childNodes && this.childNodes[0]) || null;
  }
}

module.exports = Element;

/* eslint-enable no-underscore-dangle */
