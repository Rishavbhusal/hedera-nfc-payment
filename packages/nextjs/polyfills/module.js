// Polyfill for Node.js 'module' package in browser
// Provides createRequire stub for packages like fflate that check for it

function createRequire(from) {
  // Return a stub require function that handles common cases
  // fflate uses this to check for Node.js environment
  const stubRequire = function require(id) {
    // If trying to require built-in modules, return empty object
    if (typeof id === "string" && (id.startsWith(".") || id.startsWith("/"))) {
      return {};
    }
    // For other cases, return empty object to prevent errors
    // This allows fflate to detect it's in browser and use alternative code paths
    return {};
  };
  
  // Add resolve method that fflate might use
  stubRequire.resolve = function(id) {
    return id;
  };
  
  return stubRequire;
}

// Export for both CJS and ESM (webpack will handle ESM transformation)
module.exports = { createRequire };
module.exports.createRequire = createRequire;

