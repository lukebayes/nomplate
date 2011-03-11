
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

(worksWithSubclassTemplate = ->

  class MyTemplate extends Nomtml
    content: ->
      this.html =>
        this.head =>
          this.title 'My Template'
          this.javascript '/javascripts/mine.js'
          this.stylesheet '/stylesheets/mine.css'
        this.body =>
          this.div class: 'header'
          this.div class: 'content'
          this.div class: 'footer'

  instance = new MyTemplate()
  instance.pretty = true
  instance.content()
  expected = '<html>\n  <head>\n    <title>My Template</title>\n    <script src="/javascripts/mine.js" type="text/javascript"></script>\n    <link rel="stylesheet" type="text/css" href="/stylesheets/mine.css"></link>\n  </head>\n  <body>\n    <div class="header"></div>\n    <div class="content"></div>\n    <div class="footer"></div>\n  </body>\n</html>\n'

  #console.log instance.output
  assert.equal expected, instance.output
  passed()
)()

util.log 'pretty-test: ' + passedMessage

