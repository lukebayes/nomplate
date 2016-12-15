import {dom} from '../../';

function view(options) {
  return dom.div(() => {
    dom.h1('hello world: ' + options.foo);
    dom.div('from inside');
  });
}

export default view;

