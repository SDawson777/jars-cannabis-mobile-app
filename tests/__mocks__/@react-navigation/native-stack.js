const React = require('react');

// Minimal mock of createNativeStackNavigator for unit tests. Returns simple
// Navigator and Screen components that render children and accept options.
function createNativeStackNavigator() {
  function Navigator({ children }) {
    return React.createElement(React.Fragment, null, children);
  }

  function Screen(props) {
    const { children, options, component: Component } = props;
    const elems = [];
    if (options && options.title) {
      elems.push(React.createElement('Text', { key: 'header' }, options.title));
    }
    if (Component) {
      elems.push(React.createElement(Component, null));
    } else if (children) {
      elems.push(children);
    }
    return React.createElement(React.Fragment, null, ...elems);
  }

  return { Navigator, Screen };
}

module.exports = { createNativeStackNavigator };
