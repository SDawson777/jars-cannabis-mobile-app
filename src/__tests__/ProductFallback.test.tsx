import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductFallback from '../components/ProductFallback';

jest.mock('../lib/haptics', () => ({
  impactMedium: jest.fn(),
}));

describe('ProductFallback', () => {
  it('should render unavailable message', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ProductFallback onRetry={onRetry} />);
    expect(getByText('Product Unavailable')).toBeTruthy();
  });

  it('should render subtitle', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ProductFallback onRetry={onRetry} />);
    expect(getByText('Try switching stores or check back later.')).toBeTruthy();
  });

  it('should render retry button', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ProductFallback onRetry={onRetry} />);
    expect(getByText('Retry')).toBeTruthy();
  });

  it('should call onRetry when button pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ProductFallback onRetry={onRetry} />);
    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    const onRetry = jest.fn();
    const { queryByText } = render(<ProductFallback onRetry={onRetry} loading />);
    expect(queryByText('Retry')).toBeNull();
  });
});
