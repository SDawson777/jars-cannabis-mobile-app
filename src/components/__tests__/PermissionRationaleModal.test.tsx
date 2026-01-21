import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PermissionRationaleModal from '../PermissionRationaleModal';

describe('PermissionRationaleModal', () => {
  const defaultProps = {
    isVisible: true,
    onConfirm: jest.fn(),
    onDeny: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible', () => {
    const { getByText } = render(<PermissionRationaleModal {...defaultProps} />);
    expect(getByText('We use your location to show nearby stores.')).toBeTruthy();
  });

  it('returns null when not visible', () => {
    const { queryByText } = render(
      <PermissionRationaleModal {...defaultProps} isVisible={false} />
    );
    expect(queryByText('We use your location to show nearby stores.')).toBeNull();
  });

  it('shows Enable button', () => {
    const { getByText } = render(<PermissionRationaleModal {...defaultProps} />);
    expect(getByText('Enable')).toBeTruthy();
  });

  it('shows No Thanks button', () => {
    const { getByText } = render(<PermissionRationaleModal {...defaultProps} />);
    expect(getByText('No Thanks')).toBeTruthy();
  });

  it('calls onConfirm when Enable is pressed', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <PermissionRationaleModal {...defaultProps} onConfirm={onConfirm} />
    );
    fireEvent.press(getByText('Enable'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onDeny when No Thanks is pressed', () => {
    const onDeny = jest.fn();
    const { getByText } = render(<PermissionRationaleModal {...defaultProps} onDeny={onDeny} />);
    fireEvent.press(getByText('No Thanks'));
    expect(onDeny).toHaveBeenCalledTimes(1);
  });

  it('has accessible Enable button with proper label', () => {
    const { getByLabelText } = render(<PermissionRationaleModal {...defaultProps} />);
    expect(getByLabelText('Enable location')).toBeTruthy();
  });

  it('has accessible No Thanks button with proper label', () => {
    const { getByLabelText } = render(<PermissionRationaleModal {...defaultProps} />);
    expect(getByLabelText('No thanks')).toBeTruthy();
  });

  it('has accessibility hints on buttons', () => {
    const { getByA11yHint } = render(<PermissionRationaleModal {...defaultProps} />);
    expect(getByA11yHint('Allows the app to show nearby stores')).toBeTruthy();
    expect(getByA11yHint('Dismisses this dialog')).toBeTruthy();
  });
});
