const TextElement = require('./text_element');
const camelToDash = require('./camel_to_dash');

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
    this._textValue = null;
    this._id = this.attrs && this.attrs.id;
    this._className = this.attrs && this.attrs.className;
    this.childNodes = [];
    this.isCollapsible = false;
    this.selectors = null;

    // Handler that should be overridden by renderElement if there is an
    // updateable handler present.
    this.render = null;
    this.hasUpdateableHandler = false;

    // Append #text child if provided
    if (args && args.inlineTextChild) {
      this.childNodes.push(new TextElement(args.inlineTextChild, this));
      // Inserting textValue here as shortcut for string renderer.
      this._textValue = args.inlineTextChild;
    }
  }

  addSelector(selector, styles) {
    if (this.nodeName !== 'style') {
      throw new Error('Selectors can only be added to style nodes');
    }

    if (this.selectors === null) {
      this.selectors = [];
    }
    this.selectors.push({
      selector,
      styles
    });
  }

  renderSelectors() {
    const entries = [];
    this.selectors.forEach((selector) => {
      entries.push(`${selector.selector}{`);
      const styles = selector.styles;
      Object.keys(styles).forEach((key) => {
        entries.push(`${camelToDash(key)}:${styles[key]};`);
      });
      entries.push('}');
    });

    return entries.join('');
  }

  get id() {
    return this._id;
  }

  get className() {
    return this._className;
  }

  get textValue() {
    if (this.nodeName === 'style' && this.selectors) {
      return this.renderSelectors();
    }

    return this._textValue;
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
