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
function scheduler(externalNextFrame) {
  const pending = [];

  let responseIsPending = false;
  function onNextFrame(executeHandler) {
    if (!responseIsPending) {
      responseIsPending = true;
      externalNextFrame(() => {
        responseIsPending = false;
        executeHandler();
      });
    }
  }

  function execute() {
    const filtered = [];
    // clone the currently pending update calls list so that we can learn about
    // any additional calls to update from this render pass.
    const pendingCopy = pending.slice();
    pending.length = 0;

    function filterChildren(entries) {
      return entries.filter((entry, index) => {
        let parent = entry.element.parent;
        while (parent) {
          if (elementIsPending(entries, parent)) {
            filtered.push(entry);
            return false;
          }
          parent = parent.parent;
        }

        return true;
      });
    }

    filterChildren(pendingCopy).forEach((entry) => {
      entry.handler();
    });

    // Ensure that onRender handlers are called for skipped children.
    filtered.forEach((entry) => {
      if (entry.handler.onSkipped) {
        entry.handler.onSkipped();
      }
    });

    if (pending.length > 0) {
      onNextFrame(execute);
    }
  }

  // Schedule a handler to be called on the next animation frame
  function schedule(element, handler) {
    // NOTE(lbayes): These are nomElement instances and the handler body is
    // created from within builder.getUpdateScheduler, but ultimately calls
    // element.render().
    pending.push({element, handler});
    onNextFrame(execute);
  }

  schedule.forceUpdate = execute;
  return schedule;
}

function elementIsPending(entries, nomElement) {
  return entries.some((entry) => { return entry.element === nomElement; });
}


module.exports = scheduler;

