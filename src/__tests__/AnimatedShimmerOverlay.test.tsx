import React from 'react';
import { render } from '@testing-library/react-native';
import AnimatedShimmerOverlay from '../components/AnimatedShimmerOverlay';

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    default: {
      View: View,
    },
  };
});

describe('AnimatedShimmerOverlay', () => {
  it('should render shimmer overlay', () => {
    const { toJSON } = render(<AnimatedShimmerOverlay />);
    expect(toJSON()).toBeTruthy();
  });
});
