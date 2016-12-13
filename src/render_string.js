import dom from './dom';

function renderString() {
  const carriageReturn = '\n';
  const indentation = '  ';

  let output = [];
  let pretty = false;
  let indents = 0;
  let stream = null;

  function escapeHTML(str) {
    return str.replace(/[^0-9A-Za-z ]/g, c => `&#${c.charCodeAt(0)};`);
  }

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
    const rendered = [];

    if (attributes) {
      write(' ');
      Object.keys(attributes).forEach((key) => {
        const updatedKey = key === 'className' ? 'class' : key;
        const value = attributes[key];
        if (typeof value !== 'function' && value !== false) {
          rendered.push(`${updatedKey}="${value}"`);
        }
      });

      write(rendered.join(' '));
    } else {
      write('');
    }
  }

  function writeOpener(nodeName, attributes) {
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

  function renderElement(element) {
    const attributes = element.attrs;
    const children = element.children;
    const nodeName = element.nodeName;
    // NOTE(lbayes): textContent will derive from children, textValue is explicitly set by
    // the builder.
    const textValue = element.textValue;

    writeIndentation();
    writeOpener(nodeName, attributes);

    const collapsed = isCollapsible(nodeName, textValue, children.length);

    if (!collapsed) {
      write('>');
    }

    if (textValue) {
      write(escapeHTML(textValue));
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
    childNodes.forEach((child) => {
      renderElement(child);
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

    renderElement(element);

    const result = output.join('');
    output = [];
    return result;
  };
}


export default renderString;

