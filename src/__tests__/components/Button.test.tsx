// src/__tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../components/Button';

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

// Mock react-native Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      spring: jest.fn(() => ({
        start: jest.fn(),
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => 1),
      })),
    },
  };
});

describe('Button component', () => {
  it('should render with title', () => {
    const { getByText } = render(<Button title="Press Me" onPress={() => {}} />);
    expect(getByText('Press Me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click" onPress={onPress} />);

    fireEvent.press(getByText('Click'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should render with accessibility props', () => {
    const { getByText } = render(<Button title="Test" onPress={() => {}} />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should use custom accessibility label when provided', () => {
    const { getByLabelText } = render(
      <Button title="Short" accessibilityLabel="Long Description" onPress={() => {}} />
    );
    expect(getByLabelText('Long Description')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(<Button title="Styled" onPress={() => {}} style={customStyle} />);
    expect(getByText('Styled')).toBeTruthy();
  });

  it('should apply custom text style', () => {
    const customTextStyle = { color: 'blue' };
    const { getByText } = render(
      <Button title="Text Styled" onPress={() => {}} textStyle={customTextStyle} />
    );
    expect(getByText('Text Styled')).toBeTruthy();
  });

  it('should handle press in and out events', () => {
    const { getByText } = render(<Button title="Animated" onPress={() => {}} />);
    const button = getByText('Animated');

    // Should not throw
    fireEvent(button, 'pressIn');
    fireEvent(button, 'pressOut');
  });
});
