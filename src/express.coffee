fs = require 'fs'
vm = require 'vm'
CoffeeScript = require 'coffee-script'
Nomtml = require './nomtml'

addFunction = (key, recipient, source) ->
  return if key == 'constructor' || key == 'pretty'

  if recipient[key] == undefined
    recipient[key] = (args...) ->
      source[key].apply(source, args)
  else
    console.log "view option '" + key + "' is blocking application of Nomtml attribute of same name"

renderLayout = (layout) ->
  console.log 'rendering layout now: ', layout

render = (source, options) ->
  console.log 'render: ', source
  options ||= {}
  sandbox = {}

  # Callers can send in a custom nomplate instance:
  context = options.nomplate || new Nomtml()

  # Rename Poorly-named Express View:
  sandbox.renderLayout = (layout) ->
    console.log 'RENDINER LAYOUT: ', layout

  delete options.body

  sandbox[key] = value for key,value of options
  addFunction(key, sandbox, context) for key of context
    
  if options.pretty != undefined
    context.pretty = options.pretty

  compiled_js = CoffeeScript.compile source, context
  vm.runInNewContext compiled_js, sandbox
  
  return ->
    context.output

renderFile = (path, options, callback) ->
  encoding = 'utf-8'
  console.log 'RENDER FILE WITH:', path, options, callback
  fs.readFile path, {encoding: encoding}, (err, data) ->
    callback err, render(data.toString(), options)()


module.exports = {
  render: render
  renderFile: renderFile
  renderLayout: renderLayout
}

