const assert = require('chai').assert;
const createWindow = require('../test_helper').createWindow;
const dom = require('../').dom;
const renderElement = require('../').renderElement;
const renderString = require('../').renderString;
const svg = require('../').svg;

const render = renderString();

describe('svg', () => {
  let doc;

  beforeEach(() => {
    doc = createWindow().document;
  });

  it('is callable', () => {
    const element = dom.canvas(() => {
      svg();
    });

    const str = render(element);
    assert.equal(str, '<canvas><svg></svg></canvas>');
  });

  it('has some other children', () => {
    const element = dom.canvas(() => {
      svg({height: 100, width: 100}, () => {
        svg.circle({cx: 50, cy: 50, r: 40, stroke: 'black', 'stroke-width': 3, fill: 'red'});
        dom.text('Sorry, your browser does not support inline SVG.');
      });
    });

    const str = renderElement(element, doc);
  });
});
