# Nomplate
(pronounced, Gnome-plate)

Nomplate is a microscopic (< 5kb), insanely fast (<80ms to interactive client) client and server side template engine and component system that makes it dead simple to create, compose, _test_ and deploy visual components using Plain Old JavaScript wherever it runs.

![Gnome Plate](https://raw.githubusercontent.com/lukebayes/nomplate/master/Gnomplate.jpg "Gnome Plate")

## What does it look like?
/src/key_presses.js
```javascript
import {dom} from 'nomplate';

const keysPressed = [];

// Define the render function.
function keyPresses() {

  // Return a nomplate element with zero or more children.
  return dom.div((update) => {
    function onKeyUp(event) {
      console.log('onKeyUp with:', event.keyCode);
      keysPressed.push(event.keyCode);
      // Schedule a re-render from the outer div in.
      update();
    }

    dom.input({type: 'text', onkeyup: onKeyUp});
    dom.ul({className: 'my-list'}, () => {
      keysPressed.forEach((keyCode) => {
        dom.li(keyCode);
      });
    });
  })
};

export default keyPresses;
```
Every HTML node name is available on the `dom` object as a method (e.g., div, span, li, ul, section, header, footer, etc.).

The method signature can accept attributes, text content or a handler that itself calls more methods on `dom`. These arguments are optional, starting on the left in order to make callers more succinct.

If nested handlers declare a parameter, they will be sent a method that, when called will schedule a re-render of the associated component and it's children.

```javascript
// Attributes and children
dom.div({className: 'abcd'}, () => {
  // Just text content
  dom.div('Some Text Content');
  // Just attributes
  dom.div({className: 'fake-attr'});
  // Just children
  dom.div((update) => {
    dom.span('Now: ' + Date.now());
    // Re-render every second
    setTimeout(update, 1000);
  });
});
```

## Configure your [Express](https://expressjs.com) server:
```javascript
import express from 'express';
import nomplateExpress from 'nomplate/express';

const app = express();

// Configure static files from dist
app.use('/static', express.static('dist'));

// Configure Nomplate
app.engine('.js', nomplateExpress);
app.set('view engine', 'js');
// Configure the default layout (/views/main.js)
app.set('view options', {layout: 'main', pretty: process.env.NODE_ENV !== 'production'});
app.set('views', path.resolve(__dirname + '/views'));

// Create a route and return a named template at /views/app.js
app.get('/', (req, res) => {
  res.render('app');
});

app.listen(8080, () => {
  console.log('Listening on localhost:8080');
});
```

## The /views/main.js layout:
```javascript
import {dom} from 'nomplate';

function main(options, renderView) {
  return dom.html({lang: 'en'}, () => {
    dom.head(() => {
      dom.meta({charset: 'utf8'});
      dom.title('Nomplate Test');
      dom.link({rel: 'stylesheet', href: 'static/some-styles.css'});
      dom.script({src: '/static/some-bundle.js', type: 'text/javascript'});
    });
    dom.body(() => {
      // This call will render the selected view.
      renderView();
    });
  });
};

export default main;
```

## The /views/app.js template
```javascript
import {dom} from 'nomplate';

function app(options) {
  return dom.section({id: 'my-app'});
};

export default app;
```

## Configure the client
```javascript
import keyPresses from './src/key_presses';
import {renderElement} from 'nomplate';

window.onload = function() {
  const parent = document.getElementById('my-app');
  const element = renderElement(keyPresses(), document);
  parent.appendChild(element);
};
```
# TODO MVC?
[Here's an early prototype](https://github.com/lukebayes/todomvc-app-template/tree/nomplate) of the famous TODOMVC application implemented as a fully client side Nomplate application.

Here are some highlights:
* 6kb minified and gzipped for the entire library AND application
* < 80ms time to fully rendered and interactive application
* Fully unit tested with tests that finish in around 100ms
* [Components](https://github.com/lukebayes/todomvc-app-template/tree/nomplate/js/components) are composable and easily comprehensible

# Contributing
The build system is only proven to work on Linux and OS X, though it may work on Windows if your path and Node are configured properly.

```bash
mkdir nomplate
cd nomplate
git clone https://github.com/lukebayes/nomplate.git .
source setup-env.sh
make dev-install
# Wait for node and npm modules to be installed
source setup-env.sh # Yeah, do it again...
make test
```

Watch files for changes and run tests on change:
```bash
make test-w
```

Lint all files:
```bash
make lint
```

Build a distributable library into "dist" folder:
```bash
make build
```

Remove all artifacts
```bash
make clean
```
