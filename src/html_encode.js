
let sharedTextArea = null;

function getTextArea(document) {
  if (!sharedTextArea) {
    sharedTextArea = document.createElement('textarea');
  }
  return sharedTextArea;
}

/**
 * Encode HTML entities.
 *
 * Performance tips found here:
 * http://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
 */
function htmlEncode(str, optDocument) {
  const type = typeof str;
  // Bail and return if we receive content like: {_isUnsafe: true, content: 'abcd'};
  if (type === 'object' && str && str._isUnsafe && str.content) {
    return str.content;
  }

  if (type === 'number' || type === 'boolean') {
    return String(str);
  } else if (str === null || type === 'undefined' || !str.replace) {
    return '';
  }

  if (optDocument) {
    // If we have a document object, use the much faster textArea encoding scheme.
    const textArea = getTextArea(optDocument);
    textArea.textContent = str;
    return textArea.innerHTML;
  } else {
    // It looks like we're on the server, use the slower string  replace. The
    // scheme below is slightly faster than repeated replace calls.
    var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;" // ' -> &apos; for XML only
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
}

module.exports = htmlEncode;

