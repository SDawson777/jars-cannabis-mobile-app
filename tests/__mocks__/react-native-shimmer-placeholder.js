const React = require('react');

function ShimmerPlaceholder(props) {
  // Render a simple View-style placeholder using children or an empty View
  return React.createElement('View', props, props.children || null);
}

module.exports = ShimmerPlaceholder;
