const camelToDash = require('./camel_to_dash');
const constants = require('./constants');
const dom = require('./dom');
const htmlEncode = require('./html_encode');

function renderString() {
  const carriageReturn = '\n';
  const indentation = '  ';

  let output = [];
  let pretty = false;
  let indents = 0;
  let stream = null;

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
    if (attributes) {
      let key, value;
      const keys = Object.keys(attributes);
      const len = keys.length;
      const parts = [];

      for (var i = 0; i < len; ++i) {
        key = keys[i];
        value = attributes[key];

        if (key === constants.CLASS_NAME) {
          key = 'class';
        } else if (key === 'key') {
          key = constants.NOM_ATTR_KEY;
        } else if (key.indexOf('data') === 0) {
          key = camelToDash(key);
        }

        if (typeof value !== 'function' && value !== null && value !== undefined && value !== false) {
          write(` ${key}="${htmlEncode(value)}"`);
        }
      }
    }
  }

  function writeOpener(nodeName, attributes) {
    if (nodeName === 'html') {
      write('<!DOCTYPE html>');
    }
    write(`<${nodeName}`);
    writeAttributes(attributes);
  }

  function writeCloser(nodeName) {
    write(`</${nodeName}>`);
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
      for (let i = 0; i < indents; i += 1) {
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
    // Do not render external (non-nomplate) elements into strings.
    if (element.nodeName === 'external') {
      // In general, the external tag is not useful on a server (or as a string), so we can
      // just ignore it here. There could be a use for some work happening if a server is
      // rendering a shared template, and the client needs a place to hang it's external
      // elements.
      return;
    }
    const attributes = element.attrs;
    const children = element.children;
    const nodeName = element.nodeName;
    // NOTE(lbayes): textContent will derive from children, textValue is explicitly set by
    // the builder.
    const textValue = element.textValue;
    const unsafeContent = element.unsafeContent;

    writeIndentation();
    writeOpener(nodeName, attributes);

    const collapsed = isCollapsible(nodeName, textValue, children.length);

    if (!collapsed) {
      write('>');
    }

    if (nodeName === 'style' && element.selectors && element.selectors.length > 0) {
      write(element.renderSelectors());
    } else if (textValue) {
      write(htmlEncode(textValue));
    } else if (unsafeContent) {
      write(unsafeContent);
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

  function processChildren(children) {
    children.forEach((child) => {
      renderNode(child);
    });
  }

  /**
   * Render the provided element as a string result and if a stream is provided,
   * write output into it as elements are processed. This is how Nomplate can
   * stream large HTML definitions to the client.
   */
  return function render(element, optPrettyPrint, optStream) {
    pretty = optPrettyPrint;
    indents = 0;
    stream = optStream || null;

    renderNode(element);

    const result = output.join('');
    output = [];
    return result;
  };
}

module.exports = renderString;

