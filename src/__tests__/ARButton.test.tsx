import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import ARButton from '../components/ARButton';
import { API_BASE_URL } from '../utils/apiConfig';

// Mock expo-linking
jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));

describe('ARButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with correct title prop', () => {
    const { UNSAFE_getByType } = render(<ARButton productId="test-product-123" />);

    const button = UNSAFE_getByType('Button' as any);
    expect(button.props.title).toBe('See it in your space');
  });

  it('opens AR model URL when pressed', () => {
    const productId = 'product-456';
    const { UNSAFE_getByType } = render(<ARButton productId={productId} />);

    fireEvent.press(UNSAFE_getByType('Button' as any));

    expect(Linking.openURL).toHaveBeenCalledWith(`${API_BASE_URL}/ar/models/${productId}`);
  });

  it('constructs correct URL for different product IDs', () => {
    const productId = 'blue-dream-xyz';
    const { UNSAFE_getByType } = render(<ARButton productId={productId} />);

    fireEvent.press(UNSAFE_getByType('Button' as any));

    expect(Linking.openURL).toHaveBeenCalledWith(`${API_BASE_URL}/ar/models/${productId}`);
  });

  it('calls Linking.openURL only once per press', () => {
    const { UNSAFE_getByType } = render(<ARButton productId="test-123" />);

    fireEvent.press(UNSAFE_getByType('Button' as any));

    expect(Linking.openURL).toHaveBeenCalledTimes(1);
  });

  it('handles multiple presses correctly', () => {
    const productId = 'multi-press-test';
    const { UNSAFE_getByType } = render(<ARButton productId={productId} />);

    const button = UNSAFE_getByType('Button' as any);
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(Linking.openURL).toHaveBeenCalledTimes(3);
    expect(Linking.openURL).toHaveBeenCalledWith(`${API_BASE_URL}/ar/models/${productId}`);
  });

  it('works with product IDs containing special characters', () => {
    const productId = 'product-with-dashes_and_underscores';
    const { UNSAFE_getByType } = render(<ARButton productId={productId} />);

    fireEvent.press(UNSAFE_getByType('Button' as any));

    expect(Linking.openURL).toHaveBeenCalledWith(`${API_BASE_URL}/ar/models/${productId}`);
  });

  it('renders as a React Native Button component', () => {
    const { UNSAFE_getByType } = render(<ARButton productId="test" />);
    const button = UNSAFE_getByType('Button' as any);

    expect(button).toBeTruthy();
    expect(button.props.title).toBe('See it in your space');
  });
});
