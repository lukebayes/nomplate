
util = require 'util'
assert = require 'assert'
Nomtml = require('nomplate').Nomtml

passedMessage = ''
passed = ->
  passedMessage += '.'

(instantiable = ->
  instance = new Nomtml()
  assert.ok instance
  passed()
)()

(emitsHtmlTag = ->
  instance = new Nomtml()
  instance.html()
  assert.equal '<html></html>', instance.output
  passed()
)()

(emitsScriptTag = ->
  instance = new Nomtml()
  instance.html ->
    instance.head ->
      instance.title 'Foo'
      instance.script src: '/foo.js'
  assert.equal '<html><head><title>Foo</title><script src="/foo.js"></script></head></html>', instance.output
  passed()
)()

(specialCaseJavaScriptTag = ->
  instance = new Nomtml()
  instance.javascript '/foo.js'
  assert.equal '<script src="/foo.js" type="text/javascript"></script>', instance.output
  passed()
)()

(specialCaseStyleSheetTag = ->
  instance = new Nomtml()
  instance.stylesheet '/bar.css'
  assert.equal '<link rel="/bar.css"></link>', instance.output
  passed()
)()

util.log 'html-test: ' + passedMessage

