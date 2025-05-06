const builder = require('./builder');

const dom = {};

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
  dom[nodeName] = builder.elementWrapper(nodeName);
});

dom.collapsibleNodes.forEach((nodeName) => {
  // TODO(lbayes): Introduce support for callapsible annotations.
  dom[nodeName] = builder.elementWrapper(nodeName);
});

// Enable creation of text nodes.
dom.text = builder.elementWrapper('text');

// Helper for external stylesheets.
dom.stylesheet = (href) => {
  return dom.link({type: 'text/css', rel: 'stylesheet', href: href});
};

// Helper for inserting long-lived existing DOM elements that may have
// been created from another environment (e.g., three.js).
dom.external = builder.externalElement;

// Helper for creating CSS selectors declaratively.
dom.selector = builder.addSelector;

// Helper for creating CSS @keyframes statements..
dom.keyframes = builder.addKeyframe;
dom.media = builder.addMedia;

// Helper to skip htmlEncode and support explicitly unsafe content.
dom.unsafe = builder.unsafeContent;

module.exports = dom;
