
util = require 'util'
assert = require 'assert'
Nomplate = require('nomplate').Nomplate

passedMessage = ''
passed = ->
  passedMessage += '.'

createInstance = ->
  instance = new Nomplate()
  instance.pretty = false
  instance

(instantiable = ->
  instance = createInstance()
  assert.ok instance
  passed()
)()

(acceptsNode = ->
  instance = createInstance()
  instance.node 'html'
  assert.equal '<html></html>', instance.output
  passed()
)()

(acceptsAttribute = ->
  instance = createInstance()
  instance.node 'div', class: 'foo'
  assert.equal '<div class="foo"></div>', instance.output
  passed()
)()

(acceptsAttributes = ->
  instance = createInstance()
  instance.node 'div', class: 'foo', other: 'else'
  assert.equal '<div class="foo" other="else"></div>', instance.output
  passed()
)()

(acceptsStringValue = ->
  instance = createInstance()
  instance.node 'title', 'Hello World'
  assert.equal '<title>Hello World</title>', instance.output
  passed()
)()

(acceptsHandler = ->
  instance = createInstance()
  instance.node 'div', ->
    this.node 'b', 'Some Words'

  assert.equal '<div><b>Some Words</b></div>', instance.output
  passed()
)()

(acceptsNestedHandlers = ->
  instance = createInstance()
  instance.node 'div', class: 'main', ->
    instance.node 'div', ->
      instance.node 'b', 'Other Words'

  assert.equal '<div class="main"><div><b>Other Words</b></div></div>', instance.output
  passed()
)()
  
util.log 'nomplate-test: ' + passedMessage

