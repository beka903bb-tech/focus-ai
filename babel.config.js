module.exports = function (api) {
  api.cache(true);
  return {
    // unstable_transformImportMeta: zustand's ESM middleware uses `import.meta`, which
    // crashes the web bundle ("Cannot use 'import.meta' outside a module") without it.
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    // react-native-reanimated/plugin MUST be listed last.
    plugins: ['react-native-reanimated/plugin'],
  };
};
