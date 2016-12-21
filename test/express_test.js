const assert = require('chai').assert;
const dom = require('../').dom;
const path = require('path');
const renderFile = require('../express');

describe('Nomplate express', () => {
  let fixture;
  let options;

  beforeEach(() => {
    fixture = path.resolve(path.join(__dirname, 'fixtures/view.js'));
    options = {
      settings: {
        'view options': {
          layout: 'view'
        },
        views: path.resolve(path.join(__dirname, 'fixtures'))
      }
    };
  });

  it('is a funcction', () => {
    assert.isFunction(renderFile);
  });

  it('requires options.settings', (done) => {
    renderFile(fixture, {}, (err, text) => {
      try {
        assert(err);
        assert.match(err.message, /Nomplate requires options.settings/);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('renders a file', (done) => {
    renderFile(fixture, options, (err, text) => {
      done(err);
    });
  });
});

