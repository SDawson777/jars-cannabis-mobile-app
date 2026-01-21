/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CartErrorBanner from '../../components/CartErrorBanner';

describe('CartErrorBanner', () => {
  it('renders error message', () => {
    const { getByText } = render(<CartErrorBanner onRetry={() => {}} />);
    expect(getByText('Unable to sync cart.')).toBeTruthy();
  });

  it('renders retry button', () => {
    const { getByText } = render(<CartErrorBanner onRetry={() => {}} />);
    expect(getByText('Retry')).toBeTruthy();
  });

  it('calls onRetry when retry button pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<CartErrorBanner onRetry={onRetry} />);

    fireEvent.press(getByText('Retry'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('can be pressed multiple times', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<CartErrorBanner onRetry={onRetry} />);

    fireEvent.press(getByText('Retry'));
    fireEvent.press(getByText('Retry'));
    fireEvent.press(getByText('Retry'));

    expect(onRetry).toHaveBeenCalledTimes(3);
  });
});
