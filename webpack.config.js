// Custom Expo Webpack config to alias native modules to web shims for demo.
const path = require('path');

const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'react-native-linear-gradient': path.resolve(__dirname, 'src/shims/linear-gradient.web.ts'),
    'react-native-sound': path.resolve(__dirname, 'src/shims/sound.web.ts'),
    '@react-native-firebase/auth': path.resolve(__dirname, 'src/shims/firebase-auth.web.ts'),
    '@react-native-firebase/messaging': path.resolve(
      __dirname,
      'src/shims/firebase-messaging.web.ts'
    ),
    'react-native-pager-view': path.resolve(__dirname, 'src/shims/pager-view.web.ts'),
    'react-native-haptic-feedback': path.resolve(__dirname, 'src/shims/haptics.web.ts'),
    '@stripe/stripe-react-native': path.resolve(__dirname, 'src/shims/stripe-react-native.web.ts'),
    'react-native-maps': path.resolve(__dirname, 'src/shims/react-native-maps.web.ts'),
  };

  return config;
};
