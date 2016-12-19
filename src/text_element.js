const FROZEN_CHILD_NODES = Object.freeze([]);
const FROZEN_ATTRIBUTES = Object.freeze([]);

class TextElement {
  constructor(textContent, parentNode) {
    this.nodeName = 'text';
    this.textContent = textContent;
    this.parent = parentNode;
    this.attributes = FROZEN_ATTRIBUTES;
    this.childNodes = FROZEN_CHILD_NODES;
  }
}

module.exports = TextElement;

