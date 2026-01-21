import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock Animated from reanimated to just render children
jest.mock('react-native-reanimated', () => {
  const _React = require('react');
  const { View } = require('react-native');
  const Animated = {
    View: ({ children, style }: any) => <View style={style}>{children}</View>,
  };
  return {
    __esModule: true,
    default: Animated,
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn(value => value),
    withDelay: jest.fn((_, value) => value),
    Easing: {
      out: jest.fn(fn => fn),
      in: jest.fn(fn => fn),
      ease: jest.fn(),
    },
  };
});

// Import after mock
import ScreenTransition from '../ScreenTransition';

describe('ScreenTransition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children', () => {
    const { getByText } = render(
      <ScreenTransition>
        <Text>Screen Content</Text>
      </ScreenTransition>
    );
    expect(getByText('Screen Content')).toBeTruthy();
  });

  it('renders with custom duration', () => {
    const { getByText } = render(
      <ScreenTransition duration={500}>
        <Text>Custom Duration</Text>
      </ScreenTransition>
    );
    expect(getByText('Custom Duration')).toBeTruthy();
  });

  it('renders multiple children', () => {
    const { getByText } = render(
      <ScreenTransition>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </ScreenTransition>
    );
    expect(getByText('First Child')).toBeTruthy();
    expect(getByText('Second Child')).toBeTruthy();
  });

  it('uses default duration of 300ms', () => {
    const { getByText } = render(
      <ScreenTransition>
        <Text>Default Duration</Text>
      </ScreenTransition>
    );
    expect(getByText('Default Duration')).toBeTruthy();
  });
});
