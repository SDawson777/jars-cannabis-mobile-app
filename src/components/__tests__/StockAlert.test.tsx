import React from 'react';
import { render } from '@testing-library/react-native';
import StockAlert from '../StockAlert';

jest.mock('react-native-animatable', () => {
  const { View } = require('react-native');
  return {
    View: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

describe('StockAlert', () => {
  it('renders message text', () => {
    const { getByText } = render(<StockAlert message="Low stock" />);
    expect(getByText('Low stock')).toBeTruthy();
  });

  it('renders different message', () => {
    const { getByText } = render(<StockAlert message="Only 2 left!" />);
    expect(getByText('Only 2 left!')).toBeTruthy();
  });

  it('renders out of stock message', () => {
    const { getByText } = render(<StockAlert message="Out of stock" />);
    expect(getByText('Out of stock')).toBeTruthy();
  });
});
