
class Nomplate {

  constructor() {
    this.output = '';
    this.pretty = true;
    this.indents = 0;
    this.indentation = '  ';
    this.carriageReturn = '\n';
  }

  node(name, ...args) {
    let [attributes, value, handler] = this.processArgs(args);

    this.writeIndentation();
    
    this.writeOpener(name, attributes);

    let collapsed = __guardMethod__(this, 'collapsible', o => o.collapsible(name));

    if (!collapsed) {
      this.write('>');
    }

    if (!collapsed && this.pretty && !value && handler) {
      this.writeUnindentation();
    }

    if (value) {
      this.write(value);
    }

    if (handler) {
      this.processHandler(handler);
      this.afterHandler();
    }

    if (collapsed) {
      this.write(' />');
      return;
    }

    if (handler) {
      this.writeIndentation();
    }

    this.writeCloser(name);
    return this.afterCloser();
  }

  collapsible(name) {
    return this.collapsibleNodes && this.collapsibleNodes.indexOf(name) > -1;
  }

  processArgs(args) {
    let attributes = null;
    let value = null;
    let handler = null;

    let len = args.length;
    for (let item of args) {
      if (typeof(item) === 'string') {
        value = item;
      } else if (typeof(item) === 'function') {
        handler = item;
      } else {
        attributes = item;
      }
    }

    return [attributes, value, handler];
  }

  processHandler(handler) {
    return handler.call(this);
  }

  writeIndentation() {
    if (this.pretty) {
      return __range__(0, this.indents, false).map((num) => this.write(this.indentation));
    }
  }

  writeOpener(name, attributes) {
    this.write(`<${name}`);
    return this.writeAttributes(attributes);
  }

  writeCloser(name) {
    return this.write(`</${name}>`);
  }

  writeUnindentation() {
    if (this.pretty) {
      this.indents++;
      return this.write(this.carriageReturn);
    }
  }

  afterHandler() {
    return this.indents--;
  }

  afterCloser() {
    if (this.pretty) {
      return this.write('\n');
    }
  }

  writeAttributes(attributes) {
    let rendered = [];
    if (attributes) {
      this.write(' ');
      for (let key in attributes) {
        let value = attributes[key];
        rendered.push(key + '="' + attributes[key] + '"');
      }
      return this.write(rendered.join(' '));
    } else {
      return this.write('');
    }
  }

  write(message) {
    this.output += message;
    return this.writeToStream(message);
  }

  writeToStream(message) {
    if (this.stream) {
      return this.stream.write(message);
    }
  }
}

export default Nomplate;


function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}
function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}