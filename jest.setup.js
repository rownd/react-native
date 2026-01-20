// Fix for Node.js 18+ where performance is read-only on global object
// This must run before react-native's jest/setup.js
if (typeof performance !== 'undefined') {
  Object.defineProperty(global, 'performance', {
    configurable: true,
    writable: true,
    // eslint-disable-next-line no-undef
    value: performance,
  });
}
