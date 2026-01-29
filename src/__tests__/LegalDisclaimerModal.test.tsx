import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import LegalDisclaimerModal from '../components/LegalDisclaimerModal';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

describe('LegalDisclaimerModal', () => {
  const mockOnClose = jest.fn();

  const mockTheme = {
    brandBackground: '#FFFFFF',
    brandPrimary: '#2E5D46',
    brandSecondary: '#666666',
  };

  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeContext.Provider value={mockTheme as any}>{component}</ThemeContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible is true', () => {
    const { getByText } = renderWithTheme(
      <LegalDisclaimerModal visible={true} onClose={mockOnClose} />
    );

    expect(getByText('Legal Disclaimer')).toBeTruthy();
    expect(getByText(/This app is intended for use only by adults/)).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = renderWithTheme(
      <LegalDisclaimerModal visible={false} onClose={mockOnClose} />
    );

    expect(queryByText('Legal Disclaimer')).toBeNull();
  });

  it('displays full legal text', () => {
    const { getByText } = renderWithTheme(
      <LegalDisclaimerModal visible={true} onClose={mockOnClose} />
    );

    expect(getByText(/21 years of age or older/)).toBeTruthy();
    expect(getByText(/comply with applicable/)).toBeTruthy();
    expect(getByText(/consume responsibly/)).toBeTruthy();
  });

  it('calls onClose and triggers haptic when close button pressed', () => {
    const { getByText } = renderWithTheme(
      <LegalDisclaimerModal visible={true} onClose={mockOnClose} />
    );

    const closeButton = getByText('Close');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(hapticLight).toHaveBeenCalledTimes(1);
  });

  it('renders close button with correct text', () => {
    const { getByText } = renderWithTheme(
      <LegalDisclaimerModal visible={true} onClose={mockOnClose} />
    );

    expect(getByText('Close')).toBeTruthy();
  });

  it('applies theme colors correctly', () => {
    const { getByText } = renderWithTheme(
      <LegalDisclaimerModal visible={true} onClose={mockOnClose} />
    );

    const title = getByText('Legal Disclaimer');
    expect(title.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: mockTheme.brandPrimary })])
    );
  });

  it('supports modal dismissal via onRequestClose', () => {
    const { UNSAFE_getByType } = renderWithTheme(
      <LegalDisclaimerModal visible={true} onClose={mockOnClose} />
    );

    const modal = UNSAFE_getByType('Modal');
    modal.props.onRequestClose();

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
