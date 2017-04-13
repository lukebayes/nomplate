const express = require('express');
const nomplateExpress = require('../../express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.engine('.js', nomplateExpress);
app.set('view engine', 'js');
app.set('view options', {layout: 'main', pretty: true});

app.get('/', (req, res) => {
  // The provided hash will be available to the template and any rendered view.
  res.render('home', {title: 'Home', message: 'Check out home'});
});

app.get('/about', (req, res) => {
  // The provided hash will be available to the template and any rendered view.
  res.render('about', {title: 'About Us', message: 'Check out the about'});
});

/* eslint-disable no-console */
console.log('>> Listening on 3000');
/* eslint-enable no-console */
app.listen(3000);

