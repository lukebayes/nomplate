Nomtml = require '../src/nomtml'

describe 'Pretty print', ->
  instance = null

  expectOutputToEqual = (value) ->
    expect(instance.output).toEqual(value)

  beforeEach ->
    instance = new Nomtml()
    instance.pretty = true

  it 'emits HTML tag', ->
    instance.html()
    expectOutputToEqual '<html></html>\n'

  it 'formats script tag', ->
    instance.html ->
      instance.head ->
        instance.title 'Foo'
        instance.script src: '/foo.js'

    expectOutputToEqual '<html>\n  <head>\n    <title>Foo</title>\n    <script src="/foo.js"></script>\n  </head>\n</html>\n'

  it 'supports subclass', ->
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
    expectOutputToEqual '<html>\n  <head>\n    <title>My Template</title>\n    <script src="/javascripts/mine.js" type="text/javascript"></script>\n    <link rel="stylesheet" type="text/css" href="/stylesheets/mine.css"></link>\n  </head>\n  <body>\n    <div class="header"></div>\n    <div class="content"></div>\n    <div class="footer"></div>\n  </body>\n</html>\n'

