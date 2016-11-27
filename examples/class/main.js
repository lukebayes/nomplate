
import { Nomtml } from 'nomplate';

class Main extends Nomtml {

  //#
  // Custom helper to main navigation elements:
  navAnchor(name) {
    return this.anchor(`/${name}`, name.toUpperCase(), {class: name});
  }

  //#
  // Template method that will be called from renderer:
  content() {
    return this.html(function() {
      this.head(function() {
        this.title('Main Title');
        this.stylesheet('/stylesheets/main.css');
        this.javascript('/javascripts/main.js');
        return this.javascript(() => alert('Hello World'));
      });

      return this.body(function() {
        this.div({class: 'header'}, function() {
          this.navAnchor('home');
          this.navAnchor('about');
          return this.navAnchor('contact');
        });

        this.div({class: 'middle'});

        return this.div({class: 'footer'});
      });
    });
  }
}

export { Main };
