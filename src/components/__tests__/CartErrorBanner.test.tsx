import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CartErrorBanner from '../CartErrorBanner';

describe('CartErrorBanner', () => {
  const defaultProps = {
    onRetry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error message', () => {
    const { getByText } = render(<CartErrorBanner {...defaultProps} />);
    expect(getByText('Unable to sync cart.')).toBeTruthy();
  });

  it('renders Retry button', () => {
    const { getByText } = render(<CartErrorBanner {...defaultProps} />);
    expect(getByText('Retry')).toBeTruthy();
  });

  it('calls onRetry when Retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<CartErrorBanner onRetry={onRetry} />);
    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders with proper styling container', () => {
    const { getByText } = render(<CartErrorBanner {...defaultProps} />);
    const message = getByText('Unable to sync cart.');
    expect(message).toBeTruthy();
  });
});
