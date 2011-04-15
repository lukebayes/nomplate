
app = require('express').createServer()
app.set 'view engine', 'nomplate'

app.get '/', (req, res) ->
  res.render 'index', content: 'Custom Content'

console.log '>> Listening on 3000'
app.listen 3000
