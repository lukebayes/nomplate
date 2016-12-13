import {dom} from '../';

dom.html(() => {
  dom.head(() => {
    dom.script({src: '/foo.js'});
    dom.stylesheet({src: '/foo.css'});
  });

  dom.body(() => {
    dom.div(() => {
      dom.form({action: 'POST', href: '/sign-in'}, () => {
        dom.input({id: 'username'});
        dom.input({id: 'password'});
        dom.button({label: 'Submit'});
      });
    });
  });
});

