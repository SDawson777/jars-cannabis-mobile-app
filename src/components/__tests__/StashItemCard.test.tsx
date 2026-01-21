// src/components/__tests__/StashItemCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StashItemCard from '../StashItemCard';

// Mock dependencies
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  BookOpen: () => null,
  ShoppingCart: () => null,
}));

const mockItem = {
  id: 'item-1',
  name: 'Rainbow Rozay',
  strainType: 'Hybrid',
  purchaseDate: '2025-07-10',
  status: 'in_stock' as const,
  imageUrl: 'https://example.com/image.jpg',
};

describe('StashItemCard', () => {
  const defaultProps = {
    item: mockItem,
    onJournal: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders item name', () => {
      const { getByText } = render(<StashItemCard {...defaultProps} />);
      expect(getByText('Rainbow Rozay')).toBeTruthy();
    });

    it('renders strain type', () => {
      const { getByText } = render(<StashItemCard {...defaultProps} />);
      expect(getByText('Hybrid')).toBeTruthy();
    });

    it('renders purchase date', () => {
      const { getByText } = render(<StashItemCard {...defaultProps} />);
      expect(getByText('2025-07-10')).toBeTruthy();
    });

    it('renders Journal button', () => {
      const { getByText } = render(<StashItemCard {...defaultProps} />);
      expect(getByText('Journal')).toBeTruthy();
    });

    it('renders Reorder button when onReorder is provided', () => {
      const { getByText } = render(<StashItemCard {...defaultProps} onReorder={jest.fn()} />);
      expect(getByText('Reorder')).toBeTruthy();
    });

    it('does not render Reorder button when onReorder is not provided', () => {
      const { queryByText } = render(<StashItemCard {...defaultProps} />);
      expect(queryByText('Reorder')).toBeNull();
    });

    it('renders image when imageUrl is provided', () => {
      const { UNSAFE_getAllByType } = render(<StashItemCard {...defaultProps} />);
      const { Image } = require('react-native');
      const images = UNSAFE_getAllByType(Image);
      expect(images.length).toBe(1);
    });

    it('does not render image when imageUrl is not provided', () => {
      const itemWithoutImage = { ...mockItem, imageUrl: undefined };
      const { UNSAFE_queryAllByType } = render(
        <StashItemCard {...defaultProps} item={itemWithoutImage} />
      );
      const { Image } = require('react-native');
      const images = UNSAFE_queryAllByType(Image);
      expect(images.length).toBe(0);
    });
  });

  describe('Interactions', () => {
    it('calls onJournal when Journal button is pressed', () => {
      const onJournal = jest.fn();
      const { getByText } = render(<StashItemCard {...defaultProps} onJournal={onJournal} />);

      fireEvent.press(getByText('Journal'));

      expect(onJournal).toHaveBeenCalled();
    });

    it('calls onReorder when Reorder button is pressed', () => {
      const onReorder = jest.fn();
      const { getByText } = render(<StashItemCard {...defaultProps} onReorder={onReorder} />);

      fireEvent.press(getByText('Reorder'));

      expect(onReorder).toHaveBeenCalled();
    });
  });
});
