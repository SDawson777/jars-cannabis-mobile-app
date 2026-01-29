import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ScreenTransition from '../components/ScreenTransition';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: {
      View: (props: any) => React.createElement(View, props, props.children),
    },
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

describe('ScreenTransition', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <ScreenTransition>
        <Text>Test Content</Text>
      </ScreenTransition>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('renders with default duration', () => {
    const { getByText } = render(
      <ScreenTransition>
        <Text>Default Duration</Text>
      </ScreenTransition>
    );

    expect(getByText('Default Duration')).toBeTruthy();
  });

  it('renders with custom duration', () => {
    const { getByText } = render(
      <ScreenTransition duration={500}>
        <Text>Custom Duration</Text>
      </ScreenTransition>
    );

    expect(getByText('Custom Duration')).toBeTruthy();
  });

  it('accepts multiple children', () => {
    const { getByText } = render(
      <ScreenTransition>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </ScreenTransition>
    );

    expect(getByText('First Child')).toBeTruthy();
    expect(getByText('Second Child')).toBeTruthy();
  });

  it('renders with very short duration', () => {
    const { getByText } = render(
      <ScreenTransition duration={100}>
        <Text>Quick Transition</Text>
      </ScreenTransition>
    );

    expect(getByText('Quick Transition')).toBeTruthy();
  });

  it('renders with long duration', () => {
    const { getByText } = render(
      <ScreenTransition duration={1000}>
        <Text>Slow Transition</Text>
      </ScreenTransition>
    );

    expect(getByText('Slow Transition')).toBeTruthy();
  });

  it('handles zero duration', () => {
    const { getByText } = render(
      <ScreenTransition duration={0}>
        <Text>Zero Duration</Text>
      </ScreenTransition>
    );

    expect(getByText('Zero Duration')).toBeTruthy();
  });

  it('wraps complex child components', () => {
    const ComplexChild = () => (
      <>
        <Text>Header</Text>
        <Text>Body</Text>
        <Text>Footer</Text>
      </>
    );

    const { getByText } = render(
      <ScreenTransition>
        <ComplexChild />
      </ScreenTransition>
    );

    expect(getByText('Header')).toBeTruthy();
    expect(getByText('Body')).toBeTruthy();
    expect(getByText('Footer')).toBeTruthy();
  });
});
