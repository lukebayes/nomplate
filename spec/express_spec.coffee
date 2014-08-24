express = require '../src/express'
Nomtml = require '../src/nomtml'

describe 'Express compiler', ->

  render = (source, options) ->
    express.render(source, options)()

  it 'renders ugly', ->
    result = render 'html()', { pretty: false }
    expect(result).toEqual '<html></html>'

  it 'renders pretty', ->
    result = render 'div()', { pretty: true }
    expect(result).toEqual '<div></div>\n'

  it 'renders without options', ->
    result = render 'span(foo)', { foo: 'hello' }
    expect(result).toEqual '<span>hello</span>\n'

  it 'renders with custom nomplate entity', ->
    class Custom extends Nomtml
      # Custom Node type:
      foo: (str) ->
        this.node 'foo', str

    result = render 'foo(bar)', { bar: 'world', nomplate: new Custom() }
    expect(result).toEqual '<foo>world</foo>\n'

