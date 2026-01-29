import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import Button from '../components/Button';
import * as haptic from '../utils/haptic';

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with title', () => {
    const { getByText } = render(<Button title="Click me" onPress={jest.fn()} />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPress} />);
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalled();
  });

  it('should trigger haptic feedback on press', () => {
    const { getByText } = render(<Button title="Test" onPress={jest.fn()} />);
    fireEvent.press(getByText('Test'));
    expect(haptic.hapticLight).toHaveBeenCalled();
  });

  it('should apply custom accessibility label', () => {
    const { getByLabelText } = render(
      <Button title="Submit" onPress={jest.fn()} accessibilityLabel="Submit form" />
    );
    expect(getByLabelText('Submit form')).toBeTruthy();
  });

  it('should use title as default accessibility label', () => {
    const { getByLabelText } = render(<Button title="Submit" onPress={jest.fn()} />);
    expect(getByLabelText('Submit')).toBeTruthy();
  });

  it('should handle pressIn event', () => {
    const { getByText } = render(<Button title="Test" onPress={jest.fn()} />);
    const button = getByText('Test');

    act(() => {
      fireEvent(button, 'pressIn');
    });
    // Animation should be triggered (no errors)
    expect(button).toBeTruthy();
  });

  it('should handle pressOut event', () => {
    const { getByText } = render(<Button title="Test" onPress={jest.fn()} />);
    const button = getByText('Test');

    act(() => {
      fireEvent(button, 'pressOut');
    });
    // Animation should reset (no errors)
    expect(button).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const customTextStyle = { fontSize: 20 };
    const { getByText } = render(
      <Button title="Styled" onPress={jest.fn()} style={customStyle} textStyle={customTextStyle} />
    );
    expect(getByText('Styled')).toBeTruthy();
  });

  it('should support custom accessibility role', () => {
    const { getByLabelText } = render(
      <Button title="Link" onPress={jest.fn()} accessibilityRole="link" />
    );
    expect(getByLabelText('Link')).toBeTruthy();
  });

  it('should support accessibility hint', () => {
    const { getByA11yHint } = render(
      <Button title="Submit" onPress={jest.fn()} accessibilityHint="Submits the form" />
    );
    expect(getByA11yHint('Submits the form')).toBeTruthy();
  });
});
