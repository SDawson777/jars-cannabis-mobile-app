// Mock for expo-image
const React = require('react');
const { View } = require('react-native');

const Image = props => {
  return React.createElement(View, {
    testID: props.testID,
    accessibilityLabel: props.alt,
    style: props.style,
  });
};

Image.prefetch = jest.fn().mockResolvedValue(true);
Image.clearDiskCache = jest.fn().mockResolvedValue(undefined);
Image.clearMemoryCache = jest.fn().mockResolvedValue(undefined);
Image.getCachePathAsync = jest.fn().mockResolvedValue(null);

module.exports = {
  Image,
};
