// Lightweight mock of react-native used only for Jest unit tests.
// Export the minimal surface area used by tests to avoid parsing Flow/TS in the
// upstream package. Expand as needed when tests require more APIs.
const React = require('react');

module.exports = {
  View: ({ children, ...props }) => React.createElement('View', props, children),
  Text: ({ children, ...props }) => React.createElement('Text', props, children),
  TextInput: props => React.createElement('TextInput', props),
  Image: props => React.createElement('Image', props),
  Pressable: ({ children, ...props }) => React.createElement('Pressable', props, children),
  StyleSheet: {
    create: styles => styles,
    // flatten should accept an object or array of objects
    flatten: style => {
      if (!style) return {};
      if (Array.isArray(style)) return Object.assign({}, ...style.filter(Boolean));
      return style;
    },
  },
  Animated: {
    Value: class {
      constructor(v) {
        this._v = v;
      }
    },
    timing: (_value, _config) => ({ start: () => {}, stop: () => {} }),
    // createAnimatedComponent should return the wrapped component in tests
    createAnimatedComponent: Component => Component,
    // common animated components
    View: props => React.createElement('AnimatedView', props, props.children),
    Image: props => React.createElement('AnimatedImage', props),
    loop: anim => ({ start: () => {}, stop: () => {} }),
  },
  Easing: {
    linear: v => v,
  },
  Platform: { OS: 'android', select: obj => obj.android },
  I18nManager: {
    getConstants: () => ({ isRTL: false }),
  },
  Dimensions: {
    get: key => {
      // provide a reasonable default for window dimensions used in tests
      if (key === 'window') return { width: 1024, height: 768 };
      return { width: 1024, height: 768 };
    },
  },
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(),
  },
  SafeAreaView: ({ children, ...props }) => React.createElement('SafeAreaView', props, children),
  ActivityIndicator: ({ size = 'small', color }) =>
    React.createElement('ActivityIndicator', { size, color }),
  FlatList: ({ data = [], renderItem }) =>
    React.createElement(
      'View',
      null,
      data.map((item, index) =>
        React.createElement(
          'View',
          { key: (item && item.id) || index },
          renderItem({ item, index })
        )
      )
    ),
  // Modal should be a component so nested JSX renders correctly
  Modal: ({ children, visible, ...props }) =>
    visible ? React.createElement('Modal', props, children) : null,
  RefreshControl: ({ refreshing, onRefresh, ...props }) =>
    React.createElement('RefreshControl', { refreshing, onRefresh, ...props }),
  ScrollView: ({ children, ...props }) => React.createElement('ScrollView', props, children),
  TouchableOpacity: ({ children, ...props }) =>
    React.createElement('TouchableOpacity', props, children),
  Button: ({ title, onPress, ...props }) =>
    React.createElement('Button', { ...props, title, onPress }),
  // Linking used by deep link handler
  Linking: {
    addEventListener: jest.fn((type, cb) => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },
  Alert: {
    alert: jest.fn(),
  },
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  UIManager: {
    // setLayoutAnimationEnabledExperimental is commonly checked on Android
    setLayoutAnimationEnabledExperimental: () => {},
    // Provide getViewManagerConfig used by react-navigation elements in tests
    getViewManagerConfig: () => undefined,
  },
  LayoutAnimation: {
    configureNext: () => {},
    Presets: {
      easeInEaseOut: {},
    },
  },
  // add other pieces lazily when tests fail and require them
};

// Minimal NativeModules/PlatformConstants used by some navigation/ui components
module.exports.NativeModules = {
  PlatformConstants: { reactNativeVersion: { major: 0, minor: 0, patch: 0 } },
};

module.exports.PlatformConstants = module.exports.NativeModules.PlatformConstants;
