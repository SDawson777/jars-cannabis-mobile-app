import React from 'react';
import { render } from '@testing-library/react-native';
import ProductCardSkeleton from '../ProductCardSkeleton';

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

describe('ProductCardSkeleton', () => {
  it('renders with specified width', () => {
    const { UNSAFE_root } = render(<ProductCardSkeleton width={200} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders skeleton loader animation', () => {
    const { UNSAFE_root } = render(<ProductCardSkeleton width={150} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with different widths', () => {
    const { UNSAFE_root: root1 } = render(<ProductCardSkeleton width={100} />);
    const { UNSAFE_root: root2 } = render(<ProductCardSkeleton width={250} />);
    expect(root1).toBeTruthy();
    expect(root2).toBeTruthy();
  });
});
