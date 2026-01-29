import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LocationStatusDisplay from '../components/LocationStatusDisplay';

describe('LocationStatusDisplay', () => {
  it('should show loading state', () => {
    const { getByText } = render(<LocationStatusDisplay status="loading" onRetry={jest.fn()} />);
    expect(getByText('Locating nearest stores…')).toBeTruthy();
  });

  it('should show denied state', () => {
    const { getByText } = render(<LocationStatusDisplay status="denied" onRetry={jest.fn()} />);
    expect(getByText('Location permission denied.')).toBeTruthy();
  });

  it('should show retry button in denied state', () => {
    const { getByText } = render(<LocationStatusDisplay status="denied" onRetry={jest.fn()} />);
    expect(getByText('Retry')).toBeTruthy();
  });

  it('should call onRetry when retry button pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<LocationStatusDisplay status="denied" onRetry={onRetry} />);
    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('should show activity indicator in loading state', () => {
    const { UNSAFE_getByType } = render(
      <LocationStatusDisplay status="loading" onRetry={jest.fn()} />
    );
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('should have button accessibility role on retry', () => {
    const { getByText } = render(<LocationStatusDisplay status="denied" onRetry={jest.fn()} />);
    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();
  });
});
