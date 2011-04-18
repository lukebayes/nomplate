vm = require 'vm'
CoffeeScript = require 'coffee-script'
Nomtml = require('nomplate/nomtml').Nomtml

exports.compile = (source, options) ->
  context = new Nomtml()
  context.console = console
  #context.content = options.content

  compiled_js = CoffeeScript.compile source, context

  sandbox = {}
  Nomtml.htmlFiveNodes.forEach (node) ->
    sandbox[node] = (args...) ->
      context[node].apply(context, args)
    
  console.log compiled_js
  vm.runInNewContext compiled_js, sandbox
  
  return ->
    context.output


