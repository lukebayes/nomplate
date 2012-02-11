
util = require 'util'
assert = require 'assert'
Compiler = require('nomplate/express')

Nomtml = require('nomplate/nomtml').Nomtml
passedMessage = ''
passed = ->
  passedMessage += '.'

compile = (source, options) ->
  handler = Compiler.compile source, options
  handler.call()

(testCompileUgly = ->
  result = compile "html()", { pretty: false }
  assert.equal '<html></html>', result
  passed()
)()

(testCompilePretty = ->
  result = compile "div()"
  assert.equal '<div></div>\n', result
  passed()
)()

(testCompileWithOptions = ->
  result = compile "span(foo)", { foo: 'hello' }
  assert.equal '<span>hello</span>\n', result
  passed()
)()

(testCompileWithCustomNomplateEntity = ->

  class Custom extends Nomtml
    # Custom Node type:
    foo: (str) ->
      this.node 'foo', str

  result = compile "foo(bar)", { bar: 'world', nomplate: new Custom() }
  assert.equal '<foo>world</foo>\n', result
  passed()
)()

util.log 'express-test: ' + passedMessage
