
util = require 'util'
assert = require 'assert'
Nomplate = require('nomplate').Nomplate

passedMessage = ''
passed = -> passedMessage += '.'

class FakeStream

  constructor: ->
    @output = ''

  write: (message) ->
    @output += message

(instantiable = ->
  instance = new Nomplate()
  assert.ok instance
  passed()
)()

(acceptsNode = ->
  instance = new Nomplate()
  instance.node 'html'
  assert.equal '<html></html>', instance.output
  passed()
)()

(acceptsAttribute = ->
  instance = new Nomplate()
  instance.node 'div', class: 'foo'
  assert.equal '<div class="foo"></div>', instance.output
  passed()
)()

(acceptsAttributes = ->
  instance = new Nomplate()
  instance.node 'div', class: 'foo', other: 'else'
  assert.equal '<div class="foo" other="else"></div>', instance.output
  passed()
)()

(acceptsStringValue = ->
  instance = new Nomplate()
  instance.node 'title', 'Hello World'
  assert.equal '<title>Hello World</title>', instance.output
  passed()
)()

(acceptsHandler = ->
  instance = new Nomplate()
  instance.node 'div', null, null, ->
    instance.node 'b', null, 'Some Words'

  assert.equal '<div><b>Some Words</b></div>', instance.output
  passed()
)()
  
util.log 'nomplate-test: ' + passed

