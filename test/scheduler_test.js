const Element = require('../').Element;
const assert = require('chai').assert;
const scheduler = require('../').scheduler;
const sinon = require('sinon');

describe('Nomplate scheduler', () => {
  let schedule;
  let execute;

  beforeEach(() => {
    function fakeAnimationFrame(handler) {
      execute = handler;
    }
    schedule = scheduler(fakeAnimationFrame);
  });

  it('is instantiable', () => {
    assert(typeof schedule === 'function');
  });

  it('schedules an update', () => {
    const element = new Element('div');
    const render = sinon.spy();

    schedule(element, render);
    execute();
    assert.equal(render.callCount, 1);
  });

  it('clears pending after render', () => {
    const element = new Element('div');
    const render = sinon.spy();
    schedule(element, render);
    execute();
    assert.equal(render.callCount, 1);
    execute();
    assert.equal(render.callCount, 1);
  });

  // NOTE(lbayes): This optimization is impacting the correctness of the
  // rendering pipeline. Disabling this test while I focus on correctness and
  // will re-enable if/when performance makes it's way to the top of the list
  // again.
  it.skip('filters duplicates', () => {
    const root = new Element('div');
    const render = sinon.spy();
    schedule(root, render);
    schedule(root, render);
    execute();

    assert.equal(render.callCount, 1);
  });

  it('calls completeHandler for skipped elements', () => {
    const root = new Element('div');
    const child = new Element('div');
    const renderRoot = sinon.spy();
    const renderChild = sinon.spy();
    renderChild.onSkipped = sinon.spy();
    child.parent = root;

    schedule(root, renderRoot);
    schedule(child, renderChild);
    execute();
    assert.equal(renderChild.onSkipped.callCount, 1);
  });

  it('skips element children', () => {
    const root = new Element('ul');
    const rootRender = sinon.spy();
    const child = new Element('li');
    const childRender = sinon.spy();
    child.parent = root;

    schedule(root, rootRender);
    schedule(child, childRender);

    execute();
    assert.equal(rootRender.callCount, 1);
    assert.equal(childRender.callCount, 0);
  });

  it('skips children', () => {
    const root = new Element('aye');
    const rootRender = sinon.spy();

    const one = new Element('bee');
    const oneRender = sinon.spy();
    one.parent = root;
    const two = new Element('cee');
    const twoRender = sinon.spy();
    two.parent = one;
    const three = new Element('dee');
    const threeRender = sinon.spy();
    three.parent = two;
    const four = new Element('eee');
    const fourRender = sinon.spy();
    four.parent = three;

    // NOTE(lbayes): Order does not matter.
    schedule(four, fourRender);
    schedule(one, oneRender);

    execute();

    assert.equal(rootRender.callCount, 0);
    assert.equal(oneRender.callCount, 1);
    assert.equal(twoRender.callCount, 0);
    assert.equal(threeRender.callCount, 0);
    assert.equal(fourRender.callCount, 0);
  });
});

