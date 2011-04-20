
require('nomplate')

app = require('express').createServer()
app.register('.coffee', require('nomplate/express'))

app.get '/', (req, res) ->
  res.render 'index.coffee', content_from_render: 'PROVIDED CONTENT'

console.log '>> Listening on 3000'
app.listen 3000
