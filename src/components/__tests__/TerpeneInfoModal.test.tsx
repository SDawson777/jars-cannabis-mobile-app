// src/components/__tests__/TerpeneInfoModal.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TerpeneInfoModal from '../TerpeneInfoModal';

const mockTerpene = {
  name: 'Myrcene',
  aromas: ['Earthy', 'Musky', 'Herbal'],
  effects: ['Relaxing', 'Sedating', 'Pain Relief'],
  strains: ['Blue Dream', 'OG Kush', 'Granddaddy Purple'],
};

describe('TerpeneInfoModal', () => {
  const defaultProps = {
    terpene: mockTerpene,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders terpene name', () => {
      const { getByText } = render(<TerpeneInfoModal {...defaultProps} />);
      expect(getByText('Myrcene')).toBeTruthy();
    });

    it('renders aromas section', () => {
      const { getByText } = render(<TerpeneInfoModal {...defaultProps} />);
      expect(getByText('Aromas: Earthy, Musky, Herbal')).toBeTruthy();
    });

    it('renders effects section', () => {
      const { getByText } = render(<TerpeneInfoModal {...defaultProps} />);
      expect(getByText('Effects: Relaxing, Sedating, Pain Relief')).toBeTruthy();
    });

    it('renders strains section', () => {
      const { getByText } = render(<TerpeneInfoModal {...defaultProps} />);
      expect(getByText('Strains: Blue Dream, OG Kush, Granddaddy Purple')).toBeTruthy();
    });

    it('renders Close button', () => {
      const { getByText } = render(<TerpeneInfoModal {...defaultProps} />);
      expect(getByText('Close')).toBeTruthy();
    });
  });

  describe('Visibility', () => {
    it('is visible when terpene is provided', () => {
      const { UNSAFE_getByType } = render(<TerpeneInfoModal {...defaultProps} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.visible).toBe(true);
    });

    it('is not visible when terpene is null', () => {
      const { UNSAFE_getByType } = render(<TerpeneInfoModal {...defaultProps} terpene={null} />);
      const { Modal } = require('react-native');
      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.visible).toBe(false);
    });
  });

  describe('Interactions', () => {
    it('calls onClose when Close button is pressed', () => {
      const onClose = jest.fn();
      const { getByText } = render(<TerpeneInfoModal {...defaultProps} onClose={onClose} />);

      fireEvent.press(getByText('Close'));

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when overlay is pressed', () => {
      const onClose = jest.fn();
      const { getByLabelText } = render(<TerpeneInfoModal {...defaultProps} onClose={onClose} />);

      fireEvent.press(getByLabelText('Close modal'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible overlay with label', () => {
      const { getByLabelText } = render(<TerpeneInfoModal {...defaultProps} />);
      expect(getByLabelText('Close modal')).toBeTruthy();
    });

    it('has accessible close button', () => {
      const { getByLabelText } = render(<TerpeneInfoModal {...defaultProps} />);
      expect(getByLabelText('Close')).toBeTruthy();
    });
  });
});
