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
  const pendingElements = [];
  const pendingHandlers = [];

  let responseIsPending = false;

  function filterChildren(elements) {
    return elements.filter((elem, index) => {
      let parent = elem.parent;
      while (parent) {
        if (elements.indexOf(parent) > -1) {
          pendingHandlers.splice(index, 1);
          return false;
        }
        parent = parent.parent;
      }

      return true;
    });
  }

  function execute() {
    filterChildren(pendingElements).forEach((elem, index) => {
      pendingHandlers[index]();
    });
    pendingElements.length = 0;
    pendingHandlers.length = 0;
    responseIsPending = false;
  }

  // Schedule a handler to be called on the next animation frame
  function schedule(nomElement, handler) {
    if (pendingElements.indexOf(nomElement) === -1) {
      pendingElements.push(nomElement);
      pendingHandlers.push(handler);

      if (!responseIsPending) {
        onNextFrame(execute);
        // config().requestAnimationFrame(execute);
        responseIsPending = true;
      }
    }
  }

  schedule.forceUpdate = () => {
    execute();
  };

  return schedule;
}

module.exports = scheduler;

