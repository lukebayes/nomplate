
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

util.log 'pretty-test: ' + passedMessage

