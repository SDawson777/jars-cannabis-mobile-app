import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import OrderCard from '../../components/OrderCard';

const mockOrder = {
  id: '12345',
  createdAt: '2024-01-15T10:30:00Z',
  store: 'Downtown Location',
  total: 89.99,
  status: 'delivered',
};

describe('OrderCard component', () => {
  it('should render order ID', () => {
    const { getByText } = render(
      <OrderCard order={mockOrder} onPress={jest.fn()} primaryColor="#000" secondaryColor="#666" />
    );

    expect(getByText('Order #12345')).toBeTruthy();
  });

  it('should render store name', () => {
    const { getByText } = render(
      <OrderCard order={mockOrder} onPress={jest.fn()} primaryColor="#000" secondaryColor="#666" />
    );

    expect(getByText(/Downtown Location/)).toBeTruthy();
  });

  it('should render order total', () => {
    const { getByText } = render(
      <OrderCard order={mockOrder} onPress={jest.fn()} primaryColor="#000" secondaryColor="#666" />
    );

    expect(getByText('$89.99')).toBeTruthy();
  });

  it('should render order status', () => {
    const { getByText } = render(
      <OrderCard order={mockOrder} onPress={jest.fn()} primaryColor="#000" secondaryColor="#666" />
    );

    expect(getByText('delivered')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <OrderCard order={mockOrder} onPress={onPress} primaryColor="#000" secondaryColor="#666" />
    );

    fireEvent.press(getByLabelText(/Order 12345/));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should have accessible label', () => {
    const { getByLabelText } = render(
      <OrderCard order={mockOrder} onPress={jest.fn()} primaryColor="#000" secondaryColor="#666" />
    );

    expect(getByLabelText(/Order 12345/)).toBeTruthy();
  });
});
