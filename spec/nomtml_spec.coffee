Nomtml = require '../src/nomtml'

passedMessage = ''
passed = ->
  passedMessage += '.'

describe 'Nomtml', ->
  instance = null

  expectOutputToEqual = (value) ->
    expect(instance.output).toEqual(value)

  beforeEach ->
    instance = new Nomtml()
    instance.pretty = false

  it 'is instantiable', ->
    expect(instance).toBeTruthy()

  it 'emits HTML tag', ->
    instance.html()
    expectOutputToEqual '<html></html>'

  it 'emits script tag', ->
    instance.html ->
      instance.head ->
        instance.title 'Foo'
        instance.script src: '/foo.js'
    expectOutputToEqual '<html><head><title>Foo</title><script src="/foo.js"></script></head></html>'

  it 'special cases stylesheet tag', ->
    instance.stylesheet '/bar.css'
    expectOutputToEqual '<link rel="stylesheet" type="text/css" href="/bar.css"></link>'

  it 'collapses br', ->
    instance.br()
    expectOutputToEqual '<br />'

  it 'collapses img', ->
    instance.image '/foo.png', 'Foo'
    expectOutputToEqual '<img src="/foo.png" title="Foo" alt="Foo" />'

  it 'supports explicit anchor', ->
    instance.anchor '/bar.html', 'Bar', 'Bar Title'
    expectOutputToEqual '<a href="/bar.html" title="Bar Title">Bar</a>'

  it 'supports anchor tag', ->
    instance.anchor '/bar.html', 'Bar'
    expectOutputToEqual '<a href="/bar.html" title="Bar">Bar</a>'

  it 'supports special JavaScript tag', ->
    instance.javascript '/foo.js'
    expectOutputToEqual '<script src="/foo.js" type="text/javascript"></script>'

  it 'supports special CoffeeScript tag', ->
    instance.javascript '/foo.coffee'
    expectOutputToEqual '<script src="/foo.js" type="text/javascript"></script>'

  it 'supports JavaScript expansion', ->
    instance.javascript ->
      window.open "http://google.com"
    expectOutputToEqual '<script type="text/javascript">(function () {\n        return window.open("http://google.com");\n      })()</script>'

