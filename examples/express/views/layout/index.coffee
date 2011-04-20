
navElement = (name) ->
  li { class: 'nav' }, ->
    anchor "/" + name, name

html ->
  head ->
    title "Hello World"
    stylesheet "/app.css"
    javascript "https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"
    javascript ->
      alert 'Hello World'

  body ->
    div { id: 'header' }, ->
      ul ->
        navElement 'home'
        navElement 'blog'
        navElement 'about'

    div { id: 'content' }, rendered_view
    div { id: 'footer' }, ->
      ul ->
        navElement 'contact'
        navElement 'privacy'
        navElement 'terms'

