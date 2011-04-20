
util = require 'util'
assert = require 'assert'
Compiler = require('nomplate/express')

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
  result = compile "html()"
  assert.equal '<html></html>\n', result
  passed()
)()

util.log 'express-test: ' + passedMessage
