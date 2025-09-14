const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude test files from the bundle
config.resolver.blacklistRE = /(.*\/__tests__\/.*|.*\.test\.(js|jsx|ts|tsx))$/;
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
