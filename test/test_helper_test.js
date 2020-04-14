const assert = require('chai').assert;
const testHelper = require('../test_helper');

describe('Test Helper', () => {

  describe('createWindow', () => {
    let win;

    beforeEach(() => {
      win = testHelper.createWindow();
    });

    it('creates a window', () => {
      assert(win, 'Expected window');
      assert(win.document, 'Expected document');
    });

    it('append setUrl to window', () => {
      win.setUrl('some_path?abcd=1234#efgh');
      const loc = win.location;
      assert.equal(loc.href, 'http://example.com/some_path?abcd=1234#efgh');
      assert.equal(loc.protocol, 'http:');
      assert.equal(loc.host, 'example.com');
      assert.equal(loc.hostname, 'example.com');
      assert.equal(loc.origin, 'http://example.com');
      assert.equal(loc.port, '');
      assert.equal(loc.pathname, '/some_path');
      assert.equal(loc.search, '?abcd=1234');
      assert.equal(loc.hash, '#efgh');
    });

    it('accepts port', () => {
      win.setUrl('https://example.com:3000');
      const loc = win.location;
      assert.equal(loc.href, 'https://example.com:3000/');
      assert.equal(loc.port, '3000');
    });

    it('does not double leading slashes', () => {
      win.setUrl('some_path');
      const loc = win.location;
      assert.equal(loc.href, 'http://example.com/some_path');
    });

    it('accepts full url', () => {
      win.setUrl('https://foo.com/some_path');
      const loc = win.location;
      assert.equal(loc.href, 'https://foo.com/some_path');
    });

    it('accepts no leading slash', () => {
      win.setUrl('some_path');
      const loc = win.location;
      assert.equal(loc.href, 'http://example.com/some_path');
    });
  });
});
