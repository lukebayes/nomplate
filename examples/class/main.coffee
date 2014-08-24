
Nomtml = require('nomplate').Nomtml

class Main extends Nomtml

  ##
  # Custom helper to main navigation elements:
  navAnchor: (name) ->
    @anchor '/' + name, name.toUpperCase(), class: name

  ##
  # Template method that will be called from renderer:
  content: ->
    @html ->
      @head ->
        @title 'Main Title'
        @stylesheet '/stylesheets/main.css'
        @javascript '/javascripts/main.js'
        @javascript ->
          alert 'Hello World'

      @body ->
        @div class: 'header', ->
          @navAnchor 'home'
          @navAnchor 'about'
          @navAnchor 'contact'

        @div class: 'middle'

        @div class: 'footer'

exports.Main = Main
