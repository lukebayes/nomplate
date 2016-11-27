
let getTitle = () => 'Hello World';

html(function() {
  head(function() {
    title(getTitle());
    stylesheet('/stylesheets/application.css');
    return javascript('/javascripts/application.js');
  });

  return body(function() {
    div({class: 'content'}, 'Whatever');
    return div({class: 'footer'}, function() {
      a({href: '/foo.html'}, 'Foo');
      return a({href: '/bar.html'}, 'Bar');
    });
  });
});
      

