import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

// We'll mock the hooks before requiring ShopScreen so the component picks up the mocked shape
jest.mock('../hooks/useProducts', () => ({
  useProducts: jest.fn(),
}));

jest.mock('../hooks/useFilters', () => ({
  useFiltersQuery: () => ({ data: [{ id: 'flower', label: 'Flower' }], isLoading: false }),
}));

jest.mock('../hooks/useCart', () => ({
  useCart: () => ({ addItem: jest.fn() }),
}));

const { useProducts } = require('../hooks/useProducts');

function makePage(page: number, count = 2) {
  const products = Array.from({ length: count }).map((_, i) => ({
    id: `p-${page}-${i}`,
    _id: `p-${page}-${i}`,
    name: `Product ${page}-${i}`,
    price: 1.5 + i,
  }));
  return { products, page, hasNextPage: false };
}

describe('useProducts + ShopScreen integration', () => {
  afterEach(() => jest.resetAllMocks());

  it('renders products from paginated pages', async () => {
    // mock hook to return two pages
    (useProducts as jest.Mock).mockReturnValue({
      data: { pages: [makePage(1, 2), makePage(2, 2)] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
      hasNextPage: false,
      isRefetching: false,
    });

    const ShopScreen = require('../screens/ShopScreen').default;
    const { getByText } = render(<ShopScreen />);

    await waitFor(() => {
      expect(getByText('Product 1-0')).toBeTruthy();
      expect(getByText('Product 2-0')).toBeTruthy();
    });
  });
});
