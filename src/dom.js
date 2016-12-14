import builder from './builder';

const dom = {};

function elementWrapper(nodeName) {
  return function _elementWrapper(optAttrs, optHandler, optContent) {
    return builder(nodeName, optAttrs, optHandler, optContent);
  };
}

dom.htmlFourNodes = [
  'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'b', 'base', 'basefont',
  'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'caption', 'center',
  'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'dfn', 'dir', 'div', 'dl',
  'dt', 'em', 'fieldset', 'font', 'form', 'frame', 'frameset', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'i', 'iframe', 'img', 'input',
  'ins', 'isindex', 'kbd', 'label', 'lengend', 'li', 'link', 'map', 'menu',
  'meta', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'p',
  'param', 'pre', 'q', 's', 'samp', 'script', 'select', 'small', 'span',
  'strike', 'strong', 'style', 'sub', 'sup', 'table', 'tbody', 'td',
  'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'tt', 'tu',
  'u', 'ul', 'var', 'xmp',
];

dom.htmlFiveNodes = dom.htmlFourNodes.concat([
  'article', 'aside', 'command', 'details', 'summary', 'figure', 'figcaption',
  'footer', 'header', 'hgroup', 'mark', 'meter', 'nav', 'progress', 'ruby',
  'rt', 'rp', 'section', 'time', 'wbr', 'audio', 'video', 'source', 'embed',
  'canvas', 'datalist', 'keygen', 'output', 'tel', 'search', 'url', 'email',
  'datetime', 'date', 'month', 'week', 'datetime-local', 'number',
  'ranger', 'color',
]);

// Enumerate all nodes that should be collapsed
// when they have no node value...
dom.collapsibleNodes = [
  'br', 'hr', 'img',
];

// Apply Each available node to the Html proto:
dom.htmlFiveNodes.forEach((nodeName) => {
  dom[nodeName] = elementWrapper(nodeName);
});

dom.collapsibleNodes.forEach((nodeName) => {
  // TODO(lbayes): Introduce support for callapsible annotations.
  dom[nodeName] = elementWrapper(nodeName);
});

// Enable creation of text nodes.
dom.text = elementWrapper('text');

export default dom;