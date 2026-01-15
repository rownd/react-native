const rnPreset = require('react-native/jest-preset');

module.exports = {
  ...rnPreset,
  // Our setup must run BEFORE react-native's setup.js
  setupFiles: ['<rootDir>/jest.setup.js', ...rnPreset.setupFiles],
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
  ],
};
