
/**
 * Render scheduler (stub for now).
 */
function scheduler(animationFrame) {
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
        animationFrame(execute);
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

