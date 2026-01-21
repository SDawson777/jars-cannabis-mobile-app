import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCardMini from '../ProductCardMini';
import * as haptic from '../../utils/haptic';

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

describe('ProductCardMini', () => {
  const mockItem = {
    id: 'product-1',
    name: 'Blue Dream',
    price: 29.99,
    imageUrl: 'https://example.com/image.jpg',
  };

  const defaultProps = {
    item: mockItem,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product name', () => {
    const { getByText } = render(<ProductCardMini {...defaultProps} />);
    expect(getByText('Blue Dream')).toBeTruthy();
  });

  it('renders formatted price', () => {
    const { getByText } = render(<ProductCardMini {...defaultProps} />);
    expect(getByText('$29.99')).toBeTruthy();
  });

  it('has testID', () => {
    const { getByTestId } = render(<ProductCardMini {...defaultProps} />);
    expect(getByTestId('product-card-mini')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<ProductCardMini {...defaultProps} onPress={onPress} />);
    fireEvent.press(getByTestId('product-card-mini'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic feedback on press', () => {
    const { getByTestId } = render(<ProductCardMini {...defaultProps} />);
    fireEvent.press(getByTestId('product-card-mini'));
    expect(haptic.hapticLight).toHaveBeenCalledTimes(1);
  });

  it('formats price with two decimal places', () => {
    const item = { ...mockItem, price: 10 };
    const { getByText } = render(<ProductCardMini item={item} onPress={jest.fn()} />);
    expect(getByText('$10.00')).toBeTruthy();
  });

  it('renders without image when imageUrl is not provided', () => {
    const item = { ...mockItem, imageUrl: undefined };
    const { getByText } = render(<ProductCardMini item={item as any} onPress={jest.fn()} />);
    expect(getByText('Blue Dream')).toBeTruthy();
  });

  it('truncates long product names', () => {
    const item = { ...mockItem, name: 'Very Long Product Name That Should Be Truncated' };
    const { getByText } = render(<ProductCardMini item={item} onPress={jest.fn()} />);
    expect(getByText('Very Long Product Name That Should Be Truncated')).toBeTruthy();
  });
});
