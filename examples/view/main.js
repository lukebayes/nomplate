
# Render the collection of things:
renderWhatevers = (cb) ->
  get '/whatever.json', (items) ->
    renderWhatever(item) for item in items
    cb.call(this)

# Render a single thing:
renderWhatever = (item) ->
  div class: 'item', ->
    addText "Item Value" + item.value

getTitle = ->
  "Hello World"

html ->
  head ->
    title getTitle()
    css "/stylesheets/application.css"
    script "/javascripts/application.js"

  div class: 'foo', ->
    addText "Whatever"

  renderWhatevers ->
    div class: 'footer'

