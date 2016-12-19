const assert = require('chai').assert;
const generateId = require('../').generateId;

describe('Nomplate ID', () => {
  it('is callable', () => {
    const id = generateId();
    assert(id);
    assert.equal(id.length, 13);
  });

  it('does not collide', () => {
    // NOTE(lbayes): Set timeout when experimenting with higher counts.
    // this.timeout(1000000);
    // NOTE(lbayes): Verified no collisions at 10,000,000 ids and more
    // than that causes a segfault. Leaving a much smaller count in place
    // because these are relatively slow operations.
    const count = 1000;
    const ids = {};
    // const startTime = Date.now();

    for (let i = 0; i < count; i += 1) {
      const id = generateId();
      if (ids[id]) {
        assert(false, `Collision at: ${id}`);
      }
      ids[id] = true;
    }
    // const endTime = Date.now();
    // NOTE(lbayes): Log the duration when experimenting.
    // console.log('Duration:', (endTime - startTime) + 'ms');
  });
});
