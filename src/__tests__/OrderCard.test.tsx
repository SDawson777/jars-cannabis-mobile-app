import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OrderCard from '../components/OrderCard';

const mockOrder = {
  id: 'ORD123',
  createdAt: '2024-01-15T10:00:00Z',
  store: 'Downtown Store',
  total: 49.99,
  status: 'completed',
  items: [],
  subtotal: 45.0,
  taxes: 3.0,
  fees: 1.99,
};

describe('OrderCard', () => {
  it('should render order ID', () => {
    const { getByText } = render(
      <OrderCard
        order={mockOrder}
        onPress={jest.fn()}
        primaryColor="#2E5D46"
        secondaryColor="#666"
      />
    );
    expect(getByText('Order #ORD123')).toBeTruthy();
  });

  it('should render order total', () => {
    const { getByText } = render(
      <OrderCard
        order={mockOrder}
        onPress={jest.fn()}
        primaryColor="#2E5D46"
        secondaryColor="#666"
      />
    );
    expect(getByText('$49.99')).toBeTruthy();
  });

  it('should render order status', () => {
    const { getByText } = render(
      <OrderCard
        order={mockOrder}
        onPress={jest.fn()}
        primaryColor="#2E5D46"
        secondaryColor="#666"
      />
    );
    expect(getByText('completed')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <OrderCard order={mockOrder} onPress={onPress} primaryColor="#2E5D46" secondaryColor="#666" />
    );
    fireEvent.press(getByLabelText(/Order ORD123/));
    expect(onPress).toHaveBeenCalled();
  });

  it('should display store name', () => {
    const { getByText } = render(
      <OrderCard
        order={mockOrder}
        onPress={jest.fn()}
        primaryColor="#2E5D46"
        secondaryColor="#666"
      />
    );
    expect(getByText(/Downtown Store/)).toBeTruthy();
  });

  it('should have accessibility label with order details', () => {
    const { getByLabelText } = render(
      <OrderCard
        order={mockOrder}
        onPress={jest.fn()}
        primaryColor="#2E5D46"
        secondaryColor="#666"
      />
    );
    expect(getByLabelText(/Order ORD123.*totaling/)).toBeTruthy();
  });
});
