import {dom} from '../../../';

function app(options) {
  return dom.div(() => {
    dom.h1('This is view content');
    dom.div(`Option keys: ${Object.keys(options)}`);
  });
}

export default app;

