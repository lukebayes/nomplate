Compiler = require '../src/express'
Nomtml = require '../src/nomtml'

describe 'Express compiler', ->

  compile = (source, options) ->
    Compiler.compile(source, options)()

  it 'compiles ugly', ->
    result = compile 'html()', { pretty: false }
    expect(result).toEqual '<html></html>'

  it 'compiles pretty', ->
    result = compile 'div()', { pretty: true }
    expect(result).toEqual '<div></div>\n'

  it 'compiles without options', ->
    result = compile 'span(foo)', { foo: 'hello' }
    expect(result).toEqual '<span>hello</span>\n'

  it 'compiles with custom nomplate entity', ->
    class Custom extends Nomtml
      # Custom Node type:
      foo: (str) ->
        this.node 'foo', str

    result = compile 'foo(bar)', { bar: 'world', nomplate: new Custom() }
    expect(result).toEqual '<foo>world</foo>\n'

