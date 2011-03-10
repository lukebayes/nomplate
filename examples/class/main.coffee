
Nomtml = require('nomplate').Nomtml

class Main extends Nomtml

  ##
  # Custom helper to main navigation elements:
  navAnchor: (name) ->
    this.anchor '/' + name, name.toUpperCase(), class: name
  ##
  # Template method that will be called from renderer:
  content: ->
    this.html =>
      this.head =>
        this.title 'Main Title'
        this.javascript '/javascripts/main.js'
        this.stylesheet '/stylesheets/main.css'

      this.body =>
        this.div class: 'header', =>
          this.navAnchor 'home'
          this.navAnchor 'about'
          this.navAnchor 'contact'
        this.div class: 'middle'
        this.div class: 'footer'

