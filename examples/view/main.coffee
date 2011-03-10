
getTitle = ->
  'Hello World'

html ->
  head ->
    title getTitle()
    css '/stylesheets/application.css'
    script '/javascripts/application.js'

  body ->

    div class: 'content', 'Whatever'

    div class: 'footer', ->
      a href: '/foo.html', 'Foo'
      a href: '/bar.html', 'Bar'
      

