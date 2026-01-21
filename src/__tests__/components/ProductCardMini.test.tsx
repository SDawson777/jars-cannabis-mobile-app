/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCardMini from '../../components/ProductCardMini';

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

import { hapticLight } from '../../utils/haptic';

describe('ProductCardMini', () => {
  const mockItem = {
    id: 'prod-1',
    name: 'Blue Dream',
    price: 45.99,
    imageUrl: 'https://example.com/blue-dream.jpg',
    category: 'flower',
    subcategory: 'sativa',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product name', () => {
    const { getByText } = render(<ProductCardMini item={mockItem} onPress={() => {}} />);
    expect(getByText('Blue Dream')).toBeTruthy();
  });

  it('renders formatted price', () => {
    const { getByText } = render(<ProductCardMini item={mockItem} onPress={() => {}} />);
    expect(getByText('$45.99')).toBeTruthy();
  });

  it('renders price with two decimals', () => {
    const item = { ...mockItem, price: 50 };
    const { getByText } = render(<ProductCardMini item={item} onPress={() => {}} />);
    expect(getByText('$50.00')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<ProductCardMini item={mockItem} onPress={onPress} />);

    fireEvent.press(getByTestId('product-card-mini'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic feedback on press', () => {
    const { getByTestId } = render(<ProductCardMini item={mockItem} onPress={() => {}} />);

    fireEvent.press(getByTestId('product-card-mini'));

    expect(hapticLight).toHaveBeenCalled();
  });

  it('renders without image when imageUrl is undefined', () => {
    const itemWithoutImage = { ...mockItem, imageUrl: undefined };
    const { getByText } = render(<ProductCardMini item={itemWithoutImage} onPress={() => {}} />);

    expect(getByText('Blue Dream')).toBeTruthy();
    // Component should still render without crashing
  });

  it('has testID for testing', () => {
    const { getByTestId } = render(<ProductCardMini item={mockItem} onPress={() => {}} />);
    expect(getByTestId('product-card-mini')).toBeTruthy();
  });
});
