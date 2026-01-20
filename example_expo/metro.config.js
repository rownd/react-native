const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');
const modules = Object.keys({ ...pak.peerDependencies });

const config = getDefaultConfig(__dirname);

// Watch the library source directory (not the entire root which includes other examples)
config.watchFolders = [path.join(root, 'src')];

// Ensure we use the example's node_modules for peer dependencies
config.resolver.extraNodeModules = modules.reduce((acc, name) => {
  acc[name] = path.join(__dirname, 'node_modules', name);
  return acc;
}, {});

// Also resolve the library itself from the root
config.resolver.extraNodeModules[pak.name] = root;

// Block peer dependencies from root to avoid duplicates
config.resolver.blockList = [
  // Block root node_modules for peer deps
  ...modules.map(
    (m) =>
      new RegExp(`^${escapeRegex(path.join(root, 'node_modules', m))}\\/.*$`)
  ),
  // Block the other example directory
  new RegExp(`^${escapeRegex(path.join(root, 'example'))}\\/.*$`),
];

// Helper to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = config;
