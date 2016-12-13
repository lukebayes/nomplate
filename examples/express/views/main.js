import {dom} from '../../../';

function main(options, renderPartial) {
  return dom.html(() => {
    dom.head(() => {
      dom.title('Nomplate Example');
    });

    dom.body(() => {
      dom.h1('This is the outer layout');
      dom.div({className: 'content'}, () => {
        dom.div('View goes below!');
        renderPartial();
      });
    });
  });
}

export default main;
