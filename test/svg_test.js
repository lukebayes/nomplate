import {assert} from 'chai';
import {jsdom} from 'jsdom';

import {dom, svg, renderElement, renderString} from '../';

const render = renderString();

describe('svg', () => {
  let document;

  beforeEach(() => {
    document = jsdom('<body></body>');
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

    const str = renderElement(element, document);
  });
});
