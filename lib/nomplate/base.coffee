
class Nomplate

  constructor: ->
    @output = ''
    @pretty = true
    @indents = 0
    @indentation = '  '
    @carriageReturn = '\n'

  node: (name, args...) ->
    [attributes, value, handler] = this.processArgs(args)

    this.writeIndentation()
    
    this.writeOpener name, attributes

    collapsed = this.collapsible? name

    if !collapsed
      this.write '>'

    if !collapsed && @pretty && !value && handler
      this.writeUnindentation()

    if value
      this.write value

    if handler
      this.processHandler handler
      this.afterHandler()

    if collapsed
      this.write ' />'
      return

    if handler
      this.writeIndentation() 

    this.writeCloser name
    this.afterCloser()

  collapsible: (name) ->
    @collapsibleNodes && @collapsibleNodes.indexOf(name) > -1

  processArgs: (args) ->
    attributes = null
    value = null
    handler = null

    len = args.length;
    for item in args
      if typeof(item) == 'string'
        value = item
      else if typeof(item) == 'function'
        handler = item
      else
        attributes = item

    return [attributes, value, handler]

  processHandler: (handler) ->
    handler.call(this)

  writeIndentation: ->
    if @pretty
      this.write @indentation for num in [0...@indents]

  writeOpener: (name, attributes) ->
    this.write '<' + name
    this.writeAttributes attributes

  writeCloser: (name) ->
    this.write '</' + name + '>'

  writeUnindentation: ->
    if @pretty
      @indents++
      this.write @carriageReturn

  afterHandler: ->
    @indents--

  afterCloser: ->
    if @pretty
      this.write '\n'

  writeAttributes: (attributes) ->
    rendered = []
    if attributes
      this.write ' '
      for key, value of attributes
        rendered.push key + '="' + attributes[key] + '"'
      this.write rendered.join(' ')
    else
      this.write ''

  write: (message) ->
    @output += message
    this.writeToStream message

  writeToStream: (message) ->
    if (@stream)
      @stream.write message

exports.Nomplate = Nomplate

