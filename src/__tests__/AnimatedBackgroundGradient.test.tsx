import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import AnimatedBackgroundGradient from '../components/AnimatedBackgroundGradient';

jest.mock('react-native-linear-gradient', () => {
  const { View } = require('react-native');
  return ({ children, colors: _colors, style }: any) => (
    <View testID="linear-gradient" style={style}>
      {children}
    </View>
  );
});

describe('AnimatedBackgroundGradient', () => {
  it('should render children', () => {
    const { getByText } = render(
      <AnimatedBackgroundGradient>
        <Text>Child Content</Text>
      </AnimatedBackgroundGradient>
    );
    expect(getByText('Child Content')).toBeTruthy();
  });

  it('should render LinearGradient wrapper', () => {
    const { getByTestId } = render(
      <AnimatedBackgroundGradient>
        <View />
      </AnimatedBackgroundGradient>
    );
    expect(getByTestId('linear-gradient')).toBeTruthy();
  });

  it('should have flex style', () => {
    const { getByTestId } = render(
      <AnimatedBackgroundGradient>
        <View />
      </AnimatedBackgroundGradient>
    );
    const gradient = getByTestId('linear-gradient');
    expect(gradient.props.style).toEqual({ flex: 1 });
  });

  it('should render multiple children', () => {
    const { getByText } = render(
      <AnimatedBackgroundGradient>
        <Text>First</Text>
        <Text>Second</Text>
      </AnimatedBackgroundGradient>
    );
    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
  });
});
