const scheduler = require('./scheduler');

/**
 * Module-global state.
 */
let globalKeys;

/**
 * Return an object where module global values are stored.
 *
 * This object will build key values from the global environment the first time
 * it is requested. This should only happen when client code interacts with the
 * library which should be after module load time.
 *
 * If there are problems resolving these references, try calling
 * config.reset() before calling into any nomplate features.
 *
 * If there continue to be problems, features can be provided by calling config
 * with a hash of key values to replace. For example:
 * ```javascript
 * const config = require('nomplate').config;
 *
 * config({requestAnimationFrame: myAnimationImpl});
 * ```
 *
 * To reset the config object to the empty state:
 * ```javascript
 * config().reset();
 * ```
 *
 * Reset should never be called in product after anyone has called into the library.
 */
function getOrCreateGlobalKeys() {
  if (!globalKeys) {
    // Initialize the globalKeys hash only after the first request for it.
    globalKeys = {
      builderStack: null,
      schedule: null,
      setTimeout: null,
      requestAnimationFrame: null,
    };

    /**
     * Module global stack used by builder.js so that views can call into the
     * builder synchronously and build up state over multiple calls.
     */
    globalKeys.builderStack = [];

    /**
     * Global setTimeout implementation, can be faked in test environments.
     */
    globalKeys.setTimeout = global.setTimeout.bind(global);

    /**
     * Global requestAnimationFrame implementation.
     */
    globalKeys.requestAnimationFrame = (global.requestAnimationFrame ||
      globalKeys.setTimeout).bind(global);

    /**
     * Instantiated scheduler.
     */
    globalKeys.schedule = scheduler(globalKeys.requestAnimationFrame);
  }
  return globalKeys;
}

/**
 * Config function that returns the module globals object.
 *
 * If an object is provided to this function, any keys on that object will
 * replace existing references.
 */
function config(optKeys) {
  const existingKeys = getOrCreateGlobalKeys();

  if (optKeys) {
    Object.assign(existingKeys, optKeys);
  }

  return existingKeys;
}

/**
 * Reset all global keys to empty, default state.
 *
 * This should generally not be called in a production environment unless
 * the inferrences are failing.
 */
config.reset = function() {
  globalKeys = null;
};

module.exports = config;
