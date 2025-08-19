const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for SVG files as assets
config.resolver.assetExts.push('svg');

module.exports = config;