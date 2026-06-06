const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

/** @type {import('metro-config').MetroConfig} */
const metroConfig = {
  ...config,
  resolver: {
    ...config.resolver,
    alias: {
      ...config.resolver.alias,
      'dom-helpers/css': require.resolve('dom-helpers/css'),
      'dom-helpers/offset': require.resolve('dom-helpers/offset'),
      'dom-helpers/position': require.resolve('dom-helpers/position'),
      'dom-helpers/scrollLeft': require.resolve('dom-helpers/scrollLeft'),
      // Add other dom-helpers subpaths from the error stack if needed
    },
  }, 
};

module.exports = withNativeWind(metroConfig, { input: './global.css' });
