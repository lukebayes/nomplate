
util = require 'util'
assert = require 'assert'
Nomtml = require('nomplate').Nomtml

passedMessage = ''
passed = ->
  passedMessage += '.'

(emitsHtmlTag = ->
  instance = new Nomtml()
  instance.pretty = true
  instance.html()
  assert.equal '<html></html>\n', instance.output
  passed()
)()

(emitsScriptTag = ->
  instance = new Nomtml()
  instance.pretty = true
  instance.html ->
    instance.head ->
      instance.title 'Foo'
      instance.script src: '/foo.js'

  expected = '<html>\n  <head>\n    <title>Foo</title>\n    <script src="/foo.js"></script>\n  </head>\n</html>\n'
  assert.equal expected, instance.output
  passed()
)()

'''
(specialCaseJavaScriptTag = ->
  instance = new Nomtml()
  instance.javascript '/foo.js'
  assert.equal '<script src="/foo.js" type="text/javascript"></script>', instance.output
  passed()
)()

(specialCaseStyleSheetTag = ->
  instance = new Nomtml()
  instance.stylesheet '/bar.css'
  assert.equal '<link rel="stylesheet" type="text/css" href="/bar.css"></link>', instance.output
  passed()
)()

(collapsibleNode = ->
  instance = new Nomtml()
  instance.br()
  assert.equal '<br />', instance.output
  passed()
)()

(collapseImageTag = ->
  instance = new Nomtml()
  instance.image '/foo.png', 'Foo'
  assert.equal '<img src="/foo.png" title="Foo" alt="Foo" />', instance.output
  passed()
)()

(anchorTagExplicit = ->
  instance = new Nomtml()
  instance.anchor '/bar.html', 'Bar', 'Bar Title'
  assert.equal '<a href="/bar.html" title="Bar Title">Bar</a>', instance.output
  passed()
)()

(anchorTag = ->
  instance = new Nomtml()
  instance.anchor '/bar.html', 'Bar'
  assert.equal '<a href="/bar.html" title="Bar">Bar</a>', instance.output
  passed()
)()
'''

util.log 'pretty-test: ' + passedMessage

