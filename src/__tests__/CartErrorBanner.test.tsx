import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CartErrorBanner from '../components/CartErrorBanner';

describe('CartErrorBanner', () => {
  it('should render error message', () => {
    const { getByText } = render(<CartErrorBanner onRetry={jest.fn()} />);
    expect(getByText('Unable to sync cart.')).toBeTruthy();
  });

  it('should render retry button', () => {
    const { getByText } = render(<CartErrorBanner onRetry={jest.fn()} />);
    expect(getByText('Retry')).toBeTruthy();
  });

  it('should call onRetry when retry button pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<CartErrorBanner onRetry={onRetry} />);
    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('should render correctly', () => {
    const { toJSON } = render(<CartErrorBanner onRetry={jest.fn()} />);
    expect(toJSON()).toBeTruthy();
  });
});
