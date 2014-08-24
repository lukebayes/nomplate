loam = require 'loam'
vm = require 'vm'
CoffeeScript = require 'coffee-script'
Nomtml = require './nomtml'

exports.compile = (source, options) ->
  options ||= {}

  # Callers can send in a custom nomplate instance:
  context = options.context || new Nomtml()
  compiledJs = CoffeeScript.compile source, context

  return (opt_scope) ->
    contextParents = [context]
    currentProto = context.__proto__
    while currentProto
      contextParents.push currentProto
      currentProto = currentProto.__proto__

    flatContext = loam.extend.apply null, contextParents
    nodeContext = vm.createContext flatContext

    # console.log 'nodecontext: ', nodeContext
    console.log 'compiled: ', compiledJs
    console.log 'nodeContext: ', nodeContext.node

    vm.runInContext compiledJs, nodeContext
    context.output

