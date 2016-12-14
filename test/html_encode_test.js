import {assert} from 'chai';

import {htmlEncode} from '../';

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
});

