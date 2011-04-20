vm = require 'vm'
CoffeeScript = require 'coffee-script'
Nomtml = require('nomplate/nomtml').Nomtml

exports.compile = (source, options) ->
  options ||= {}
  context = new Nomtml()
  context.console = console
  sandbox = {}

  Nomtml.htmlFiveNodes.forEach (node) ->
    if sandbox[node] == undefined
      sandbox[node] = (args...) ->
        context[node].apply(context, args)
    
  if options.pretty != undefined
    context.pretty = options.pretty

  # Rename Poorly-named Express View:
  options.rendered_view = options.body
  delete options.body

  sandbox[key] = value for key,value of options

  sandbox.options = options

  compiled_js = CoffeeScript.compile source, sandbox
  vm.runInNewContext compiled_js, sandbox
  
  return ->
    context.output


