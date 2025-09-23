module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-flow'
    ],
    plugins: [
      'react-native-reanimated/plugin',
      // Strip Flow annotations during transformation so node_modules with Flow syntax parse cleanly in Jest
      '@babel/plugin-transform-flow-strip-types',
    ],
  };
};