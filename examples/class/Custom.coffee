
Nomtml = require('nomplate').Nomtml

class Custom extends Nomtml

  navAnchor: (name) ->
    this.anchor '/' + name, name.toUpperCase(), class: name

  renderHeader: ->
    this.div class: 'header', =>
      this.navAnchor 'home'
      this.navAnchor 'about'
      this.navAnchor 'contact'

  renderFooter: ->
    this.div class: 'footer' =>
      this.navAnchor 'home'
      this.navAnchor 'about'
      this.navAnchor 'contact'

  renderMiddle: ->
    this.div class: 'middle'

  content: ->
    this.html =>
      this.head =>
        this.title 'Custom Title'
        this.javascript '/javascripts/custom.js'
        this.stylesheet '/stylesheets/custom.css'

      this.body =>
        this.renderHeader()
        this.renderMiddle()
        this.renderFooter()

