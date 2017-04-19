const assert = require('chai').assert;
const config = require('../').config;
const sinon = require('sinon');

describe('Config', () => {
  let result;


  it('is callable', () => {
    result = config();
    assert(result);
  });

  it('returns requestAnimationFrame', () => {
    result = config();
    assert.isFunction(result.requestAnimationFrame);
    assert.equal(result.requestAnimationFrame, global.setTimeout);
  });

  it('can clobber an existing key', () => {
    const spy = sinon.spy();
    config({requestAnimationFrame: spy});
    result = config();
    result.requestAnimationFrame();
    assert.equal(spy.callCount, 1);
  });

  it('can reset all globals', () => {
    config({requestAnimationFrame: 'fake'});
    config.reset();
    assert.equal(config().requestAnimationFrame, global.setTimeout);
  });
});

