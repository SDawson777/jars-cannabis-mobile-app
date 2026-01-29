import React from 'react';
import { render } from '@testing-library/react-native';

import ForYouTodayCard from '../components/ForYouTodayCard';
import type { ForYouTodayPayload } from '../@types/personalization';

jest.mock('../components/ProductCardMini', () => {
  const { Text } = require('react-native');
  return function ProductCardMini({ item, onPress }: any) {
    return (
      <Text testID={`product-${item.id}`} onPress={onPress}>
        {item.name}
      </Text>
    );
  };
});

describe('ForYouTodayCard', () => {
  const mockData: ForYouTodayPayload = {
    greeting: 'Good Morning!',
    message: 'Based on your preferences, we recommend:',
    products: [
      { id: 'prod1', name: 'Blue Dream', image: 'url1', category: 'Flower' },
      { id: 'prod2', name: 'Sour Diesel', image: 'url2', category: 'Flower' },
    ],
    ctaText: 'View All Recommendations',
  };

  const mockOnSelectProduct = jest.fn();
  const mockOnSeeAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders greeting and message', () => {
    const { getByText } = render(
      <ForYouTodayCard data={mockData} onSelectProduct={mockOnSelectProduct} />
    );

    expect(getByText('Good Morning!')).toBeTruthy();
    expect(getByText('Based on your preferences, we recommend:')).toBeTruthy();
  });

  it('renders product cards', () => {
    const { getByTestId } = render(
      <ForYouTodayCard data={mockData} onSelectProduct={mockOnSelectProduct} />
    );

    expect(getByTestId('product-prod1')).toBeTruthy();
    expect(getByTestId('product-prod2')).toBeTruthy();
  });

  it('renders CTA text when provided', () => {
    const { getByText } = render(
      <ForYouTodayCard
        data={mockData}
        onSelectProduct={mockOnSelectProduct}
        onSeeAll={mockOnSeeAll}
      />
    );

    expect(getByText('View All Recommendations')).toBeTruthy();
  });

  it('does not render CTA when ctaText is not provided', () => {
    const dataWithoutCta = { ...mockData, ctaText: undefined };
    const { queryByText } = render(
      <ForYouTodayCard data={dataWithoutCta} onSelectProduct={mockOnSelectProduct} />
    );

    expect(queryByText('View All Recommendations')).toBeNull();
  });

  it('has correct testID', () => {
    const { getByTestId } = render(
      <ForYouTodayCard data={mockData} onSelectProduct={mockOnSelectProduct} />
    );

    expect(getByTestId('for-you-today-card')).toBeTruthy();
  });
});
