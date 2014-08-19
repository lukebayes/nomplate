Nomplate = require '../src/nomplate'

describe 'Nomplate', ->
  instance = null

  expectOutputToEqual = (value) ->
    expect(instance.output).toEqual(value)

  beforeEach ->
    instance = new Nomplate()
    instance.pretty = false

  it 'is instantiable', ->
    expect(instance).toBeTruthy()

  it 'supports node', ->
    instance.node 'html'
    expectOutputToEqual '<html></html>'

  it 'supports attributes', ->
    instance.node 'div', class: 'foo'
    expectOutputToEqual '<div class="foo"></div>'

  it 'supports nested attributes', ->
    instance.node 'div', class: 'foo', other: 'else'
    expectOutputToEqual '<div class="foo" other="else"></div>'

  it 'supports string value', ->
    instance.node 'title', 'Hello World'
    expectOutputToEqual '<title>Hello World</title>'

  it 'supports handler', ->
    instance.node 'div', ->
      this.node 'b', 'Some Words'
    expectOutputToEqual '<div><b>Some Words</b></div>'

  it 'supports nested handlers', ->
    instance.node 'div', class: 'main', ->
      instance.node 'div', ->
        instance.node 'b', 'Other Words'
    expectOutputToEqual '<div class="main"><div><b>Other Words</b></div></div>'

