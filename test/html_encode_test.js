const assert = require('chai').assert;
const htmlEncode = require('../').htmlEncode;

describe('HTMLEncode', () => {
  it('encodes ampersand', () => {
    assert.equal(htmlEncode('foo&bar'), 'foo&amp;bar');
  });

  it('encodes greater than', () => {
    assert.equal(htmlEncode('>'), '&gt;');
  });

  it('encodes less than', () => {
    assert.equal(htmlEncode('<'), '&lt;');
  });

  it('encodes double quote', () => {
    assert.equal(htmlEncode('"'), '&quot;');
  });

  it('encodes single quote', () => {
    assert.equal(htmlEncode('\''), '&#39;');
  });

  it('encodes null', () => {
    assert.equal(htmlEncode(null), '');
  });

  it('encodes undefined', () => {
    assert.equal(htmlEncode(undefined), '');
  });

  it('encodes unknown object', () => {
    assert.equal(htmlEncode({abcd: 1234, efgh: 'cee'}), '');
  });
});

