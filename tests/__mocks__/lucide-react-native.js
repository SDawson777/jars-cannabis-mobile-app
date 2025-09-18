const React = require('react');
const { View } = require('react-native');

function Icon(props) {
  // Render a simple placeholder view for icon
  return React.createElement(View, { ...props, testID: props.testID || 'mock-icon' });
}

module.exports = {
  ChevronLeft: Icon,
  Trash2: Icon,
  HelpCircle: Icon,
  // fallback: export a default Icon factory
  default: Icon,
};
