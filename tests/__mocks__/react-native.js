// Lightweight mock of react-native used only for Jest unit tests.
// Export the minimal surface area used by tests to avoid parsing Flow/TS in the
// upstream package. Expand as needed when tests require more APIs.
const React = require('react');

module.exports = {
  View: ({ children, ...props }) => React.createElement('View', props, children),
  Text: ({ children, ...props }) => React.createElement('Text', props, children),
  TextInput: (props) => React.createElement('TextInput', props),
  Pressable: ({ children, ...props }) => React.createElement('Pressable', props, children),
  StyleSheet: {
    create: (styles) => styles,
  },
  Animated: {
    Value: class { constructor(v){ this._v = v } },
    timing: () => ({ start: () => {}, stop: () => {} }),
  },
  Platform: { OS: 'android', select: (obj) => obj.android },
  SafeAreaView: ({ children, ...props }) => React.createElement('SafeAreaView', props, children),
  FlatList: ({ data = [], renderItem }) =>
    React.createElement(
      'View',
      null,
      data.map((item, index) =>
        React.createElement('View', { key: (item && item.id) || index }, renderItem({ item, index }))
      )
    ),
  // Modal should be a component so nested JSX renders correctly
  Modal: ({ children, visible, ...props }) => (visible ? React.createElement('Modal', props, children) : null),
  ScrollView: ({ children, ...props }) => React.createElement('ScrollView', props, children),
  TouchableOpacity: ({ children, ...props }) => React.createElement('TouchableOpacity', props, children),
  Button: ({ title, onPress, ...props }) => React.createElement('Button', { ...props, title, onPress }),
  // Linking used by deep link handler
  Linking: {
    addEventListener: jest.fn((type, cb) => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  // add other pieces lazily when tests fail and require them
};
