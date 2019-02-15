
/**
 * Transform camelCase style keys into dash-case style keys.
 */
function camelToDash(key) {
  return key.replace(/([A-Z])/g, "-$1").toLowerCase();
}

module.exports = camelToDash;
