const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add cjs extension for compatibility with some npm packages
config.resolver.sourceExts.push('cjs');

module.exports = config;
