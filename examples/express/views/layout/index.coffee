
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

"""
Rendered as:

<html> 
  <head> 
    <title>Hello World</title> 
    <link rel="stylesheet" type="text/css" href="/app.css"></link> 
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js" type="text/javascript"></script> 
  </head> 
  <body> 
    <div id="header"> 
      <h3>Header: </h3> 
      <ul> 
        <li class="nav"> 
          <a href="/home" title="home">home</a> 
        </li> 
        <li class="nav"> 
          <a href="/blog" title="blog">blog</a> 
        </li> 
        <li class="nav"> 
          <a href="/about" title="about">about</a> 
        </li> 
      </ul> 
    </div> 
    <div id="content"> 
      <h3>Content: </h3> 
      <div><div class="view">Hello World</div> 
    </div> 
    </div> 
    <div id="footer"> 
      <h3>Footer: </h3> 
      <ul> 
        <li class="nav"> 
          <a href="/contact" title="contact">contact</a> 
        </li> 
        <li class="nav"> 
          <a href="/privacy" title="privacy">privacy</a> 
        </li> 
        <li class="nav"> 
          <a href="/terms" title="terms">terms</a> 
        </li> 
      </ul> 
    </div> 
  </body> 
<script type="text/javascript">
(function () {
  return $(document).ready(function() {
    return $('#content').show('fast');
  });
})()
</script></html>
"""
