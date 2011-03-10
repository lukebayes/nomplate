
Nomplate = require('nomplate/base').Nomplate

class Nomtml extends Nomplate

  htmlFourNodes = [
    'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'b', 'base', 'basefont',
    'bdo', 'big', 'blockquote', 'body','br', 'button', 'caption', 'center', 
    'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'dfn', 'dir', 'div', 'dl', 
    'dt', 'em', 'fieldset', 'font', 'form', 'frame', 'frameset', 'h1', 'h2',
    'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'i', 'iframe', 'img', 'input',
    'ins', 'isindex', 'kbd', 'label', 'lengend', 'li', 'link', 'map', 'menu',
    'meta', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'p',
    'param', 'pre', 'q', 's', 'samp', 'script', 'select', 'small', 'span',
    'strike', 'strong', 'style', 'sub', 'sup', 'table', 'tbody', 'td',
    'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'tt', 'tu', 'thead',
    'title', 'tr', 'tt', 'u', 'ul', 'var', 'xmp',
  ]

  htmlFiveNodes = [
    'article', 'aside', 'command', 'details', 'summary', 'figure', 'figcaption',
    'footer', 'header', 'hgroup', 'mark', 'meter', 'nav', 'progress', 'ruby',
    'rt', 'rp', 'section', 'time', 'wbr', 'audio', 'video', 'source', 'embed',
    'canvas', 'datalist', 'keygen', 'output', 'tel', 'search', 'url', 'email',
    'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'number',
    'ranger', 'color',
  ]

  # Enumerate all nodes that should be collapsed
  # when they have no node value...
  this.prototype.collapsibleNodes = [
    'br', 'hr', 'img'
  ]

  # Apply Each available node to the Html proto:
  htmlFourNodes.concat(htmlFiveNodes).forEach (node) =>
    this.prototype[node] = (args...) ->
      args.unshift(node)
      this.node.apply(this, args)

  # Create Special helpers:

  # Write a JavaScript script tag:
  javascript: (src) ->
    this.node 'script', src: src, type: 'text/javascript'

  # Write a Standard Stylesheet tag:
  stylesheet: (href, type = 'text/css') ->
    this.node 'link', rel: 'stylesheet', type: type, href: href

  # Write a Standard Image tag:
  image: (src, title, alt) ->
    title ||= src
    alt ||= title
    this.node 'img', src: src, title: title, alt: alt

  anchor: (href, text, title = null) ->
    title ||= text
    this.node 'a', { href: href, title: title }, text

exports.Nomtml = Nomtml

