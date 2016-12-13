import express from 'express';
import path from 'path';

import nomplate from '../../';

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.engine('.js', nomplate.express.renderFile);
app.set('view engine', 'js');
app.set('view options', {layout: 'main', pretty: true});

app.get('/', (req, res) => res.render('app', {message: 'Hello World'}));

/* eslint-disable no-console */
console.log('>> Listening on 3000');
/* eslint-enable no-console */
app.listen(3000);

