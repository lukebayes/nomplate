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
    this._unsafeContent = args && args.unsafeContent;
    this._textValue = this.attrs && this.attrs.textValue || null;
    this.childNodes = [];
    this.isCollapsible = false;
	this.atRules = null;
	this.atRuleStack = null;
    this.selectors = null;
    this.keyframes = null;

    // Handler that should be overridden by renderElement if there is an
    // updateable handler present.
    this.render = null;
    this.hasUpdateableHandler = false;

    // Append #text child if provided
    if (args) {
      // if (this.unsafeContent) {
        // this.childNodes.push(new Element('text', {attrs: {unsafeContent: this.unsafeContent}}, this));
      if (args.inlineTextChild) {
        // Used by render_element:
        this.childNodes.push(new Element('text', {attrs: {textValue: args.inlineTextChild}}, this));
        // Used by render_string:
        this._textValue = args.inlineTextChild;
      }
    }
  }

  addAtRule(statement, optHandler) {
	console.log('statement:', statement);
	if (this.nodeName !== constants.STYLE_NODE_NAME) {
      throw new Error('@rules can only be added to style nodes (or other @rules)');
	}

	if (this.atRules === null) {
	  this.atRules = [];
	  this.atRuleStack = [];
	}

	const rule = {
	  statement,
	  selectors: [],
	  children: [],
	  rule: null,
	};

	// NOTE(lbayes): Only add the atRule if we're not nested.
	if (this.atRuleStack.length > 0) {
	  this.atRuleStack[this.atRuleStack.length - 1].children.push(rule);
	} else {
	  console.log("PUSHING MAIN RULE");
	  this.atRules.push(rule);
	}
	if (optHandler) {
	  console.log("PUSHING STACK RULE");
	  this.atRuleStack.push(rule);
	  optHandler();
	  this.atRuleStack.pop();
	}
  }

  renderAtRules() {
	if (this.atRules) {
	  return atRulesToString(this.atRules);
	}
  }

  addSelector(selector, rules) {
    if (this.nodeName !== constants.STYLE_NODE_NAME) {
      throw new Error('Selectors can only be added to style nodes');
    }

	if (this.atRuleStack && this.atRuleStack.length > 0) {
	  this.atRuleStack[this.atRuleStack.length - 1].selectors.push({selector, rules});
	} else {
	  if (this.selectors === null) {
		this.selectors = [];
	  }
	  this.selectors.push({
		selector,
		rules
	  });
	}
  }

  renderSelectors() {
	const entries = [];
	const rules = this.renderAtRules();
	if (rules) {
	  entries.push(rules);
	}

	if (this.selectors) {
	  entries.push(selectorsToString(this.selectors));
	}

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

  get unsafeContent() {
    return this._unsafeContent;
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

function selectorsToString(selectors) {
  return selectors.reduce((entries, selector) => {
	const name = selector.selector;
	entries.push(`${name}{`);
	if (name.indexOf('@') === 0) {
	  Object.keys(selector.rules).forEach((key) => {
		entries.push(`${key} {`);
		entries.push(renderSelectorRules(selector.rules[key]));
		entries.push(`} `);
	  });
	} else {
	  entries.push(renderSelectorRules(selector.rules));
	}
	entries.push('}');
	return entries;
  }, []).join('');
}

function renderSelectorRules(rules) {
  return Object.keys(rules).map((key) => {
	return `${camelToDash(key)}:${rules[key]};`;
  }).join('');
}

function atRulesToString(rules) {
  return rules.map(atRuleToString).join('');
}

function atRuleToString(rule) {
  console.log('rule:', rule);
  if (rule.selectors.length) {
	const parts = [rule.statement, '{']
	parts.push(selectorsToString(rule.selectors));
	parts.push('}');
	return parts.join('');
  } else if (rule.children.length) {
	return atRulesToString(rule.children);
  } else {
	return rule.statement;
  }
}

module.exports = Element;

/* eslint-enable no-underscore-dangle */
