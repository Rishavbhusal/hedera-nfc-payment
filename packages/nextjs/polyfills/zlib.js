// Polyfill for Node.js 'zlib' package in browser
// Provides zlib constants and stubs for packages like axios

// Common zlib constants that packages might use
const Z_NO_FLUSH = 0;
const Z_PARTIAL_FLUSH = 1;
const Z_SYNC_FLUSH = 2;
const Z_FULL_FLUSH = 3;
const Z_FINISH = 4;
const Z_BLOCK = 5;
const Z_TREES = 6;

// Export constants and stub functions
module.exports = {
  Z_NO_FLUSH,
  Z_PARTIAL_FLUSH,
  Z_SYNC_FLUSH,
  Z_FULL_FLUSH,
  Z_FINISH,
  Z_BLOCK,
  Z_TREES,
  // Stub functions
  deflate: function() { return {}; },
  deflateRaw: function() { return {}; },
  gzip: function() { return {}; },
  gunzip: function() { return {}; },
  inflate: function() { return {}; },
  inflateRaw: function() { return {}; },
  unzip: function() { return {}; },
  createDeflate: function() { return {}; },
  createDeflateRaw: function() { return {}; },
  createGzip: function() { return {}; },
  createGunzip: function() { return {}; },
  createInflate: function() { return {}; },
  createInflateRaw: function() { return {}; },
  createUnzip: function() { return {}; },
};


