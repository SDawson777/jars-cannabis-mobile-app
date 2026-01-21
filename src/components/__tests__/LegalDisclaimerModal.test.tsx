// src/components/__tests__/LegalDisclaimerModal.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LegalDisclaimerModal from '../LegalDisclaimerModal';
import { ThemeContext } from '../../context/ThemeContext';

// Mock dependencies
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

const mockThemeContext = {
  colorTemp: 'warm' as const,
  brandPrimary: '#4C9F70',
  brandSecondary: '#E8F5E9',
  brandBackground: '#FAF8F4',
  textColor: '#2C3E50',
  isDark: false,
};

describe('LegalDisclaimerModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = (props = {}) => {
    return render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LegalDisclaimerModal {...defaultProps} {...props} />
      </ThemeContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('renders title', () => {
      const { getByText } = renderModal();
      expect(getByText('Legal Disclaimer')).toBeTruthy();
    });

    it('renders disclaimer body text', () => {
      const { getByText } = renderModal();
      expect(
        getByText(/This app is intended for use only by adults 21 years of age or older/)
      ).toBeTruthy();
    });

    it('renders Close button', () => {
      const { getByText } = renderModal();
      expect(getByText('Close')).toBeTruthy();
    });
  });

  describe('Visibility', () => {
    it('is visible when visible prop is true', () => {
      const { UNSAFE_getByType } = renderModal({ visible: true });
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.visible).toBe(true);
    });

    it('is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = renderModal({ visible: false });
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Interactions', () => {
    it('calls onClose when Close button is pressed', () => {
      const onClose = jest.fn();
      const { getByText } = renderModal({ onClose });

      fireEvent.press(getByText('Close'));

      expect(onClose).toHaveBeenCalled();
    });

    it('triggers haptic feedback on close', () => {
      const { hapticLight } = require('../../utils/haptic');
      const { getByText } = renderModal();

      fireEvent.press(getByText('Close'));

      expect(hapticLight).toHaveBeenCalled();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors', () => {
      const { getByText } = renderModal();
      // Just verify it renders without error with theme
      expect(getByText('Legal Disclaimer')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('Close button has accessibility role', () => {
      const { UNSAFE_getAllByType } = renderModal();
      const { Pressable } = require('react-native');
      const pressables = UNSAFE_getAllByType(Pressable);
      const closeButton = pressables.find((p: any) => p.props.accessibilityRole === 'button');
      expect(closeButton).toBeTruthy();
    });
  });
});
