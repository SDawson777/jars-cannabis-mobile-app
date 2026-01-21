import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorCard from '../ErrorCard';

describe('ErrorCard', () => {
  const defaultProps = {
    message: 'Something went wrong',
    onSwitchStore: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error message', () => {
    const { getByText } = render(<ErrorCard {...defaultProps} />);
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('renders Switch Store button', () => {
    const { getByText } = render(<ErrorCard {...defaultProps} />);
    expect(getByText('Switch Store')).toBeTruthy();
  });

  it('calls onSwitchStore when button is pressed', () => {
    const onSwitchStore = jest.fn();
    const { getByText } = render(<ErrorCard {...defaultProps} onSwitchStore={onSwitchStore} />);
    fireEvent.press(getByText('Switch Store'));
    expect(onSwitchStore).toHaveBeenCalledTimes(1);
  });

  it('displays custom error messages', () => {
    const { getByText } = render(<ErrorCard {...defaultProps} message="Store unavailable" />);
    expect(getByText('Store unavailable')).toBeTruthy();
  });

  it('renders with loading prop', () => {
    const { getByText } = render(<ErrorCard {...defaultProps} loading={true} />);
    expect(getByText('Something went wrong')).toBeTruthy();
  });
});
