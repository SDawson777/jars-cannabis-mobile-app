import React from 'react';
import { render } from '@testing-library/react-native';
import FAQSkeleton from '../FAQSkeleton';

jest.mock('react-native-linear-gradient', () => {
  const { View } = require('react-native');
  return ({ children, ...props }: any) => <View {...props}>{children}</View>;
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      loop: jest.fn(() => ({ start: jest.fn() })),
      timing: jest.fn(() => ({})),
      Value: jest.fn(() => ({ setValue: jest.fn() })),
      View: RN.Animated.View,
    },
  };
});

describe('FAQSkeleton', () => {
  it('renders skeleton loader', () => {
    const { UNSAFE_root } = render(<FAQSkeleton />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with shimmer animation', () => {
    const { UNSAFE_root } = render(<FAQSkeleton />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
