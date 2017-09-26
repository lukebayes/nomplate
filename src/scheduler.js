/**
 * Render scheduler that provides scheduling and invalidation hooks for Nomplate
 * elements to mark themselves as needing to be rendered.
 *
 * After one or more elements have declared the need for a render, the scheduler
 * will wait until the next animation frame (or interval of zero milliseconds).
 * Once the delay is complete, the list of subscribed elements will be filtered
 * so that render is only triggered on the outermost unrelated elements in the
 * tree.
 *
 * This ensures we do not waste time rendering and diffing child elements only
 * to later render a parent or vice versa.
 *
 * There is a stinkleton module-global scheduler instance that is created
 * within config.js and all clients should access that instance directly like:
 *
 * ```javascript
 * config().schedule(nomElement);
 * ```
 */
function scheduler(onNextFrame) {
  const pending = [];

  let responseIsPending = false;

  function execute() {
    filterChildren(pending).forEach((entry) => {
      entry.handler();
    });
    pending.length = 0;
    responseIsPending = false;
  }

  // Schedule a handler to be called on the next animation frame
  function schedule(nomElement, handler) {
    if (!elementIsPending(pending, nomElement)) {
      pending.push({element: nomElement, handler: handler});

      if (!responseIsPending) {
        onNextFrame(execute);
        responseIsPending = true;
      }
    }
  }

  schedule.forceUpdate = execute;
  return schedule;
}

function elementIsPending(entries, nomElement) {
  return entries.some((entry) => { return entry.element === nomElement; });
}

function filterChildren(entries) {
  return entries.filter((entry, index) => {
    let parent = entry.element.parent;
    while (parent) {
      if (elementIsPending(entries, parent)) {
        return false;
      }
      parent = parent.parent;
    }

    return true;
  });
}


module.exports = scheduler;

