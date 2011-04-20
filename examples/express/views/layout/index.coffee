
head ->
  title "Hello World"
  javascript "https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"
  javascript ->
    alert 'Hello World'

body ->
  div { class: 'head' }
  div { class: 'content' }, rendered_view
  div { class: 'foot' }

