import React from 'react';
import { render } from '@testing-library/react-native';
import StockAlert from '../components/StockAlert';

jest.mock('react-native-animatable', () => ({
  View: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

describe('StockAlert', () => {
  it('should render alert message', () => {
    const { getByText } = render(<StockAlert message="Only 3 items left in stock" />);
    expect(getByText('Only 3 items left in stock')).toBeTruthy();
  });

  it('should render low stock message', () => {
    const { getByText } = render(<StockAlert message="Low stock" />);
    expect(getByText('Low stock')).toBeTruthy();
  });

  it('should render out of stock message', () => {
    const { getByText } = render(<StockAlert message="Out of stock" />);
    expect(getByText('Out of stock')).toBeTruthy();
  });

  it('should handle empty message', () => {
    const { getByText } = render(<StockAlert message="" />);
    expect(getByText('')).toBeTruthy();
  });

  it('should render correctly', () => {
    const { toJSON } = render(<StockAlert message="Limited availability" />);
    expect(toJSON()).toBeTruthy();
  });
});
