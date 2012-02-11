
vm = require 'vm'
CoffeeScript = require 'coffee-script'
Nomtml = require('nomplate/nomtml').Nomtml

addFunction = (key, recipient, source) ->
  return if key == 'constructor' || key == 'pretty'

  if recipient[key] == undefined
    recipient[key] = (args...) ->
      source[key].apply(source, args)
  else
    console.log "view option '" + key + "' is blocking application of Nomtml attribute of same name"

exports.compile = (source, options) ->
  options ||= {}
  sandbox = {}

  # Callers can send in a custom nomplate instance:
  context = options.nomplate || new Nomtml()

  # Rename Poorly-named Express View:
  sandbox.rendered_view = options.body
  delete options.body

  sandbox[key] = value for key,value of options
  addFunction(key, sandbox, context) for key of context
    
  if options.pretty != undefined
    context.pretty = options.pretty

  compiled_js = CoffeeScript.compile source, context
  vm.runInNewContext compiled_js, sandbox
  
  return ->
    context.output
