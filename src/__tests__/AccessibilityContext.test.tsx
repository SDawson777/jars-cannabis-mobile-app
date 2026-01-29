import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import { AccessibilityProvider, useAccessibility } from '../context/AccessibilityContext';

const TestComponent = () => {
  const { increaseContrast, toggleContrast } = useAccessibility();
  return (
    <>
      <Text testID="contrast-status">{increaseContrast ? 'high' : 'normal'}</Text>
      <Pressable testID="toggle" onPress={toggleContrast}>
        <Text>Toggle</Text>
      </Pressable>
    </>
  );
};

describe('AccessibilityContext', () => {
  it('should provide default contrast state', () => {
    const { getByTestId } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );
    expect(getByTestId('contrast-status').props.children).toBe('normal');
  });

  it('should toggle contrast when toggleContrast is called', () => {
    const { getByTestId } = render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.press(getByTestId('toggle'));
    expect(getByTestId('contrast-status').props.children).toBe('high');

    fireEvent.press(getByTestId('toggle'));
    expect(getByTestId('contrast-status').props.children).toBe('normal');
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAccessibility must be within AccessibilityProvider');

    consoleSpy.mockRestore();
  });
});
