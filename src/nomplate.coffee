
class Nomplate

  constructor: ->
    @output = ''

  node: (name, args...) ->
    [attributes, value, handler] = this.processArgs(args)
    
    this.writeOpener name, attributes
    if value
      this.write value
    this.writeCloser name

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

  writeOpener: (name, attributes) ->
    this.write '<' + name
    this.writeAttributes attributes
    this.write '>'

  writeCloser: (name) ->
    this.write '</' + name + '>'

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
