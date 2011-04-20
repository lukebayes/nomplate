
navElement = (name) ->
  li { class: 'nav' }, ->
    anchor "/" + name, name

html ->
  head ->
    title "Hello World"
    stylesheet "/app.css"
    javascript "https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"

  body ->
    div { id: 'header' }, ->
      h3 "Header: "
      ul ->
        navElement 'home'
        navElement 'blog'
        navElement 'about'

    div { id: 'content' }, ->
      h3 "Content: "
      div rendered_view

    div { id: 'footer' }, ->
      h3 "Footer: "
      ul ->
        navElement 'contact'
        navElement 'privacy'
        navElement 'terms'

  javascript ->
    $(document).ready ->
      $('#content').show 'fast'
