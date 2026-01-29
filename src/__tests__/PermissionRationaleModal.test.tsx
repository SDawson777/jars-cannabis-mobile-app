import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import PermissionRationaleModal from '../components/PermissionRationaleModal';

describe('PermissionRationaleModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnDeny = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isVisible is true', () => {
    const { getByText } = render(
      <PermissionRationaleModal isVisible={true} onConfirm={mockOnConfirm} onDeny={mockOnDeny} />
    );

    expect(getByText('We use your location to show nearby stores.')).toBeTruthy();
    expect(getByText('Enable')).toBeTruthy();
    expect(getByText('No Thanks')).toBeTruthy();
  });

  it('returns null when isVisible is false', () => {
    const { toJSON } = render(
      <PermissionRationaleModal isVisible={false} onConfirm={mockOnConfirm} onDeny={mockOnDeny} />
    );

    expect(toJSON()).toBeNull();
  });

  it('calls onConfirm when Enable button is pressed', () => {
    const { getByText } = render(
      <PermissionRationaleModal isVisible={true} onConfirm={mockOnConfirm} onDeny={mockOnDeny} />
    );

    const enableButton = getByText('Enable');
    fireEvent.press(enableButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnDeny).not.toHaveBeenCalled();
  });

  it('calls onDeny when No Thanks button is pressed', () => {
    const { getByText } = render(
      <PermissionRationaleModal isVisible={true} onConfirm={mockOnConfirm} onDeny={mockOnDeny} />
    );

    const denyButton = getByText('No Thanks');
    fireEvent.press(denyButton);

    expect(mockOnDeny).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('has correct accessibility labels for Enable button', () => {
    const { getByLabelText } = render(
      <PermissionRationaleModal isVisible={true} onConfirm={mockOnConfirm} onDeny={mockOnDeny} />
    );

    const enableButton = getByLabelText('Enable location');
    expect(enableButton).toBeTruthy();
    expect(enableButton.props.accessibilityHint).toBe('Allows the app to show nearby stores');
  });

  it('has correct accessibility labels for No Thanks button', () => {
    const { getByLabelText } = render(
      <PermissionRationaleModal isVisible={true} onConfirm={mockOnConfirm} onDeny={mockOnDeny} />
    );

    const denyButton = getByLabelText('No thanks');
    expect(denyButton).toBeTruthy();
    expect(denyButton.props.accessibilityHint).toBe('Dismisses this dialog');
  });

  it('renders buttons with correct text', () => {
    const { getByText } = render(
      <PermissionRationaleModal isVisible={true} onConfirm={mockOnConfirm} onDeny={mockOnDeny} />
    );

    expect(getByText('Enable')).toBeTruthy();
    expect(getByText('No Thanks')).toBeTruthy();
  });

  it('allows font scaling on text elements', () => {
    const { getByText } = render(
      <PermissionRationaleModal isVisible={true} onConfirm={mockOnConfirm} onDeny={mockOnDeny} />
    );

    const messageText = getByText('We use your location to show nearby stores.');
    expect(messageText.props.allowFontScaling).toBe(true);

    const enableText = getByText('Enable');
    expect(enableText.props.allowFontScaling).toBe(true);
  });

  it('renders modal with correct animation type', () => {
    const { UNSAFE_getByType } = render(
      <PermissionRationaleModal isVisible={true} onConfirm={mockOnConfirm} onDeny={mockOnDeny} />
    );

    const modal = UNSAFE_getByType('Modal');
    expect(modal.props.animationType).toBe('fade');
    expect(modal.props.transparent).toBe(true);
  });
});
