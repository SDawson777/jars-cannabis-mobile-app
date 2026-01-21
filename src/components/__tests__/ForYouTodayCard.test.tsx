// src/components/__tests__/ForYouTodayCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ForYouTodayCard from '../ForYouTodayCard';

// Mock ProductCardMini
jest.mock('../ProductCardMini', () => {
  const { Pressable, Text } = require('react-native');
  return ({ item, onPress }: any) => (
    <Pressable onPress={onPress} testID={`product-${item.id}`}>
      <Text>{item.name}</Text>
    </Pressable>
  );
});

const mockData = {
  greeting: 'Good morning, John!',
  message: 'Based on your preferences, here are some picks for you.',
  products: [
    { id: 'prod-1', name: 'Rainbow Rozay', price: 45 },
    { id: 'prod-2', name: 'Blue Dream', price: 40 },
    { id: 'prod-3', name: 'OG Kush', price: 50 },
  ],
  ctaText: 'See all recommendations',
};

describe('ForYouTodayCard', () => {
  const defaultProps = {
    data: mockData,
    onSelectProduct: jest.fn(),
    onSeeAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders greeting', () => {
      const { getByText } = render(<ForYouTodayCard {...defaultProps} />);
      expect(getByText('Good morning, John!')).toBeTruthy();
    });

    it('renders message', () => {
      const { getByText } = render(<ForYouTodayCard {...defaultProps} />);
      expect(getByText('Based on your preferences, here are some picks for you.')).toBeTruthy();
    });

    it('renders all product cards', () => {
      const { getByText } = render(<ForYouTodayCard {...defaultProps} />);
      expect(getByText('Rainbow Rozay')).toBeTruthy();
      expect(getByText('Blue Dream')).toBeTruthy();
      expect(getByText('OG Kush')).toBeTruthy();
    });

    it('renders CTA text when provided', () => {
      const { getByText } = render(<ForYouTodayCard {...defaultProps} />);
      expect(getByText('See all recommendations')).toBeTruthy();
    });

    it('does not render CTA when not provided', () => {
      const dataWithoutCta = { ...mockData, ctaText: undefined };
      const { queryByText } = render(<ForYouTodayCard {...defaultProps} data={dataWithoutCta} />);
      expect(queryByText('See all recommendations')).toBeNull();
    });

    it('has testID for the card', () => {
      const { getByTestId } = render(<ForYouTodayCard {...defaultProps} />);
      expect(getByTestId('for-you-today-card')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onSelectProduct when product is pressed', () => {
      const onSelectProduct = jest.fn();
      const { getByTestId } = render(
        <ForYouTodayCard {...defaultProps} onSelectProduct={onSelectProduct} />
      );

      fireEvent.press(getByTestId('product-prod-1'));

      expect(onSelectProduct).toHaveBeenCalledWith('prod-1');
    });

    it('calls onSelectProduct with correct product id', () => {
      const onSelectProduct = jest.fn();
      const { getByTestId } = render(
        <ForYouTodayCard {...defaultProps} onSelectProduct={onSelectProduct} />
      );

      fireEvent.press(getByTestId('product-prod-2'));

      expect(onSelectProduct).toHaveBeenCalledWith('prod-2');
    });

    it('calls onSeeAll when CTA is pressed', () => {
      const onSeeAll = jest.fn();
      const { getByText } = render(<ForYouTodayCard {...defaultProps} onSeeAll={onSeeAll} />);

      fireEvent.press(getByText('See all recommendations'));

      expect(onSeeAll).toHaveBeenCalled();
    });
  });
});
