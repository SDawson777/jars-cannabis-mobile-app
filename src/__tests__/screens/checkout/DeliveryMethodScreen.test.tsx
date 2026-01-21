import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import DeliveryMethodScreen from '../../../screens/checkout/DeliveryMethodScreen';

describe('DeliveryMethodScreen', () => {
  const mockOnNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pickup and delivery options', () => {
    const { getByText } = render(<DeliveryMethodScreen onNext={mockOnNext} />);

    expect(getByText('Pickup')).toBeTruthy();
    expect(getByText('Delivery')).toBeTruthy();
    expect(getByText('Next')).toBeTruthy();
  });

  it('should default to pickup method', () => {
    const { getByText } = render(<DeliveryMethodScreen onNext={mockOnNext} />);

    fireEvent.press(getByText('Next'));

    expect(mockOnNext).toHaveBeenCalledWith({ type: 'pickup', address: '' });
  });

  it('should switch to delivery method and show address input', () => {
    const { getByText, getByPlaceholderText, queryByPlaceholderText } = render(
      <DeliveryMethodScreen onNext={mockOnNext} />
    );

    // Address input should not be visible initially
    expect(queryByPlaceholderText('Address')).toBeNull();

    // Select delivery
    fireEvent.press(getByText('Delivery'));

    // Address input should now be visible
    expect(getByPlaceholderText('Address')).toBeTruthy();
  });

  it('should pass address when delivery is selected', () => {
    const { getByText, getByPlaceholderText } = render(
      <DeliveryMethodScreen onNext={mockOnNext} />
    );

    // Select delivery
    fireEvent.press(getByText('Delivery'));

    // Enter address
    fireEvent.changeText(getByPlaceholderText('Address'), '123 Main St');

    // Press Next
    fireEvent.press(getByText('Next'));

    expect(mockOnNext).toHaveBeenCalledWith({
      type: 'delivery',
      address: '123 Main St',
    });
  });

  it('should switch back to pickup and hide address input', () => {
    const { getByText, queryByPlaceholderText } = render(
      <DeliveryMethodScreen onNext={mockOnNext} />
    );

    // Select delivery
    fireEvent.press(getByText('Delivery'));

    // Select pickup again
    fireEvent.press(getByText('Pickup'));

    // Address input should be hidden
    expect(queryByPlaceholderText('Address')).toBeNull();

    fireEvent.press(getByText('Next'));

    expect(mockOnNext).toHaveBeenCalledWith({ type: 'pickup', address: '' });
  });
});
