vm = require 'vm'
CoffeeScript = require 'coffee-script'
Nomtml = require('nomplate/nomtml').Nomtml

exports.compile = (source, options) ->
  context = new Nomtml()
  context.console = console
  compiled_js = CoffeeScript.compile source, context
  sandbox = {}

  Nomtml.htmlFiveNodes.forEach (node) ->
    sandbox[node] = (args...) ->
      context[node].apply(context, args)
    
  # Rename Poorly-named Express View:
  options.rendered_view = options.body
  delete options.body

  sandbox[key] = value for key,value of options

  sandbox.options = options

  vm.runInNewContext compiled_js, sandbox
  
  return ->
    context.output


