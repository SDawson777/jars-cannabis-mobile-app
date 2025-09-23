const React = require('react');
const { View, Text } = require('react-native');

// Minimal mock of react-native-reanimated used in unit tests.
const AnimatedMock = {
  // mimic createAnimatedComponent by returning the wrapped component
  createAnimatedComponent: C => C,
  // provide Text and View so Animated.Text / Animated.View work in JSX
  Text,
  View,
  // Hooks used by our code
  useSharedValue: initial => ({ value: initial }),
  useAnimatedStyle: fn => {
    try {
      return fn();
    } catch (e) {
      return {};
    }
  },
  withTiming: toValue => toValue,
  withSequence: (...args) => args[args.length - 1],
  Easing: {
    out: f => f,
    in: f => f,
    ease: v => v,
  },
};

// Export shape compatible with both CommonJS and ES module interop.
// Provide named exports and a default export so `import { useSharedValue }`
// and `import Animated from 'react-native-reanimated'` both work in tests.
module.exports = AnimatedMock;
module.exports.default = AnimatedMock;
