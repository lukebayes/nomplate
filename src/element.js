const camelToDash = require('./camel_to_dash');
const constants = require('./constants');

/**
 * Element struct
 */
class Element {
  constructor(nodeName, args, parent, optNamespace) {
    this.nodeName = nodeName || constants.DEFAULT_NODE_NAME;
    this.domElement = null;
    this.attrs = (args && args.attrs) || constants.EMPTY_ATTRS;
    this.parent = parent;
    this.namespace = optNamespace;

    this._children = null;
    this._textContent = null;
    this._textValue = this.attrs && this.attrs.textValue || null;
    this.childNodes = [];
    this.isCollapsible = false;
    this.selectors = null;
    this.keyframes = null;

    // Handler that should be overridden by renderElement if there is an
    // updateable handler present.
    this.render = null;
    this.hasUpdateableHandler = false;

    // Append #text child if provided
    if (args && args.inlineTextChild) {
      // Used by render_element:
      this.childNodes.push(new Element('text', {attrs: {textValue: args.inlineTextChild}}, this));
      // Used by render_string:
      this._textValue = args.inlineTextChild;
    }
  }

  addSelector(selector, rules) {
    if (this.nodeName !== constants.STYLE_NODE_NAME) {
      throw new Error('Selectors can only be added to style nodes');
    }

    if (this.selectors === null) {
      this.selectors = [];
    }
    this.selectors.push({
      selector,
      rules
    });
  }

  renderSelectorRules(entries, rules) {
    Object.keys(rules).forEach((key) => {
      entries.push(`${camelToDash(key)}:${rules[key]};`);
    });
  }

  renderSelectors() {
    const entries = [];
    this.selectors.forEach((selector) => {
      const name = selector.selector;
      entries.push(`${name}{`);
      const rules = selector.rules;
      if (name.indexOf('@') === 0) {
        Object.keys(rules).forEach((key) => {
          entries.push(`${key} {`);
          this.renderSelectorRules(entries, rules[key]);
          entries.push(`} `);
        });
      } else {
        this.renderSelectorRules(entries, selector.rules);
      }
      entries.push('}');
    });

    return entries.join('');
  }

  replaceChild(newChild, oldChild) {
    const kids = this.childNodes;
    for (var i = 0, len = kids.length; i < len; ++i) {
      if (kids[i] === oldChild) {
        kids[i].parent = null;
        kids[i] = newChild;
        break;
      }
    }
  }

  getAttribute(key) {
    return this.attrs && this.attrs[key];
  }

  get id() {
    return this.attrs && this.attrs.id;;
  }

  get className() {
    return this.attrs && this.attrs.className;
  }

  get textValue() {
    return this._textValue;
  }

  get textContent() {
    if (!this._textContent) {
      const str = this.childNodes
        .map(node => (node.textContent || node.textValue))
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
