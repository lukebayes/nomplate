
util = require 'util'
assert = require 'assert'
Nomtml = require('nomplate').Nomtml

passedMessage = ''
passed = ->
  passedMessage += '.'

createInstance = ->
  instance = new Nomtml()
  instance.pretty = false
  instance

(instantiable = ->
  instance = createInstance()
  assert.ok instance
  passed()
)()

(emitsHtmlTag = ->
  instance = createInstance()
  instance.html()
  assert.equal '<html></html>', instance.output
  passed()
)()

(emitsScriptTag = ->
  instance = createInstance()
  instance.html ->
    instance.head ->
      instance.title 'Foo'
      instance.script src: '/foo.js'
  assert.equal '<html><head><title>Foo</title><script src="/foo.js"></script></head></html>', instance.output
  passed()
)()

(specialCaseStyleSheetTag = ->
  instance = createInstance()
  instance.stylesheet '/bar.css'
  assert.equal '<link rel="stylesheet" type="text/css" href="/bar.css"></link>', instance.output
  passed()
)()

(collapsibleNode = ->
  instance = createInstance()
  instance.br()
  assert.equal '<br />', instance.output
  passed()
)()

(collapseImageTag = ->
  instance = createInstance()
  instance.image '/foo.png', 'Foo'
  assert.equal '<img src="/foo.png" title="Foo" alt="Foo" />', instance.output
  passed()
)()

(anchorTagExplicit = ->
  instance = createInstance()
  instance.anchor '/bar.html', 'Bar', 'Bar Title'
  assert.equal '<a href="/bar.html" title="Bar Title">Bar</a>', instance.output
  passed()
)()

(anchorTag = ->
  instance = createInstance()
  instance.anchor '/bar.html', 'Bar'
  assert.equal '<a href="/bar.html" title="Bar">Bar</a>', instance.output
  passed()
)()

(specialJavaScriptTagWithSrc = ->
  instance = createInstance()
  instance.javascript '/foo.js'
  assert.equal '<script src="/foo.js" type="text/javascript"></script>', instance.output
  passed()
)()

(specialJavaScriptTagWithCoffeeSrc = ->
  instance = createInstance()
  instance.javascript '/foo.coffee'
  assert.equal '<script src="/foo.js" type="text/javascript"></script>', instance.output
  passed()
)()

(specialJavaScriptTagWithCoffeeBody = ->
  instance = createInstance()
  instance.javascript ->
    window.open "http://google.com"
  assert.equal '<script type=\"text/javascript\">(function () {\n      return window.open(\"http://google.com\");\n    })()</script>', instance.output
)()

util.log 'html-test: ' + passedMessage
