const React = require('react');
const { View } = require('react-native');

function Icon(props) {
  const { children, ...rest } = props;
  return React.createElement(View, { ...rest, testID: props.testID || 'mock-icon' }, children || null);
}

module.exports = {
  Home: Icon,
  Menu: Icon,
  Heart: Icon,
  ShoppingCart: Icon,
  User: Icon,
  MapPin: Icon,
  ChevronDown: Icon,
  Search: Icon,
  ChevronLeft: Icon,
  Trash2: Icon,
  HelpCircle: Icon,
  ChevronRight: Icon,
  Send: Icon,
  Phone: Icon,
  Clock: Icon,
  Eye: Icon,
  EyeOff: Icon,
  Plus: Icon,
  List: Icon,
  // default export fallback
  default: Icon,
};
