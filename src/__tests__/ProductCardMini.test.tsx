import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCardMini from '../components/ProductCardMini';
import * as haptic from '../utils/haptic';

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

const mockItem = {
  id: 'prod-1',
  name: 'Blue Dream',
  price: 45.99,
  imageUrl: 'https://example.com/blue-dream.jpg',
  reason: 'Based on your preferences',
};

describe('ProductCardMini', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product name', () => {
    const { getByText } = render(<ProductCardMini item={mockItem} onPress={jest.fn()} />);
    expect(getByText('Blue Dream')).toBeTruthy();
  });

  it('should render product price', () => {
    const { getByText } = render(<ProductCardMini item={mockItem} onPress={jest.fn()} />);
    expect(getByText('$45.99')).toBeTruthy();
  });

  it('should render with testID', () => {
    const { getByTestId } = render(<ProductCardMini item={mockItem} onPress={jest.fn()} />);
    expect(getByTestId('product-card-mini')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<ProductCardMini item={mockItem} onPress={onPress} />);
    fireEvent.press(getByTestId('product-card-mini'));
    expect(onPress).toHaveBeenCalled();
  });

  it('should trigger haptic feedback on press', () => {
    const { getByTestId } = render(<ProductCardMini item={mockItem} onPress={jest.fn()} />);
    fireEvent.press(getByTestId('product-card-mini'));
    expect(haptic.hapticLight).toHaveBeenCalled();
  });

  it('should render product image when imageUrl provided', () => {
    const { UNSAFE_getByType } = render(<ProductCardMini item={mockItem} onPress={jest.fn()} />);
    const { Image } = require('react-native');
    expect(UNSAFE_getByType(Image)).toBeTruthy();
  });

  it('should handle item without image', () => {
    const itemNoImage = { ...mockItem, imageUrl: undefined };
    const { toJSON } = render(<ProductCardMini item={itemNoImage} onPress={jest.fn()} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should format price to 2 decimals', () => {
    const itemWithPrice = { ...mockItem, price: 50 };
    const { getByText } = render(<ProductCardMini item={itemWithPrice} onPress={jest.fn()} />);
    expect(getByText('$50.00')).toBeTruthy();
  });
});
