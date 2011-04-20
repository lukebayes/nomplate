
require('nomplate')

express = require('express')

app = express.createServer()
app.use(express.staticProvider(__dirname + '/public'))
app.register('.coffee', require('nomplate/express'))

app.get '/', (req, res) ->
  res.render 'index.coffee', content_from_render: 'Hello World'

console.log '>> Listening on 3000'
app.listen 3000
