const React = require('react');

function LinearGradient(props) {
  return React.createElement('View', props, props.children || null);
}

module.exports = LinearGradient;
