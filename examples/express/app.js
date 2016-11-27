import nomplate from 'nomplate';
import express from 'express';

console.log('nomplate: ', nomplate.__express);

let app = express();
app.use(express.static(__dirname + '/public'));
app.engine('.nomplate', nomplate.__express);
app.set('view engine', 'nomplate');
app.set('view options', {layout: 'main', pretty: true});

app.get('/', (req, res) => res.render('index', {message: 'Hello World', layout: 'main'}));

console.log('>> Listening on 3000');
app.listen(3000);

