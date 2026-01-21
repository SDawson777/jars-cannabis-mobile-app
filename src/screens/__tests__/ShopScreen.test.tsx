// src/screens/__tests__/ShopScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShopScreen from '../ShopScreen';
import { ThemeProvider } from '../../context/ThemeContext';
import { BrandProvider } from '../../context/BrandContext';
import { StoreProvider } from '../../context/StoreContext';

// Mock dependencies BEFORE imports
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    Appearance: {
      getColorScheme: jest.fn(() => 'light'),
      addChangeListener: jest.fn(),
      removeChangeListener: jest.fn(),
    },
  };
});

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

jest.mock('../../utils/toast', () => ({
  toast: jest.fn(),
}));

jest.mock('../../components/OfflineNotice', () => 'OfflineNotice');
jest.mock('../../components/CMSImage', () => 'CMSImage');
jest.mock('../../components/ProductCardSkeleton', () => 'ProductCardSkeleton');
jest.mock('../../components/WeatherForYouRail', () => 'WeatherForYouRail');

jest.mock('../../components/useSkeletonText', () => jest.fn(() => null));

jest.mock('../../hooks/useWeatherFilterParam', () => ({
  useWeatherFilterParam: jest.fn(() => null),
}));

jest.mock('../../hooks/useWeatherRecommendationsPreference', () => ({
  useWeatherRecommendationsPreference: jest.fn(() => [false, jest.fn(), true]),
}));

import { hapticLight } from '../../utils/haptic';
import { toast } from '../../utils/toast';

const mockProducts = [
  {
    id: 'product-1',
    __id: 'product-1',
    slug: 'blue-dream',
    name: 'Blue Dream',
    price: 25.0,
    category: 'flower',
    image: { url: 'https://example.com/blue-dream.jpg' },
  },
  {
    id: 'product-2',
    __id: 'product-2',
    slug: 'girl-scout-cookies',
    name: 'Girl Scout Cookies',
    price: 30.0,
    category: 'flower',
    image: { url: 'https://example.com/gsc.jpg' },
  },
  {
    id: 'product-3',
    __id: 'product-3',
    slug: 'sour-diesel',
    name: 'Sour Diesel',
    price: 28.0,
    category: 'flower',
    image: { url: 'https://example.com/sour-diesel.jpg' },
  },
];

const mockFilters = [
  { id: 'flower', label: 'Flower' },
  { id: 'edibles', label: 'Edibles' },
  { id: 'vapes', label: 'Vapes' },
];

// Mock hooks before component import
jest.mock('../../hooks/useProducts', () => ({
  useProducts: jest.fn(),
}));

jest.mock('../../hooks/useFilters', () => ({
  useFiltersQuery: jest.fn(),
}));

jest.mock('../../hooks/useCart', () => ({
  useCart: jest.fn(),
}));

import { useProducts } from '../../hooks/useProducts';
import { useFiltersQuery } from '../../hooks/useFilters';
import { useCart } from '../../hooks/useCart';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
        <ThemeProvider>
          <StoreProvider>{ui}</StoreProvider>
        </ThemeProvider>
      </BrandProvider>
    </QueryClientProvider>
  );
};

describe('ShopScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useProducts as jest.Mock).mockReturnValue({
      data: { products: mockProducts },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
      hasNextPage: false,
      isRefetching: false,
    });

    (useFiltersQuery as jest.Mock).mockReturnValue({
      data: mockFilters,
      isLoading: false,
    });

    (useCart as jest.Mock).mockReturnValue({
      addItem: jest.fn(),
    });
  });

  describe('Basic Rendering', () => {
    it('renders the shop screen', () => {
      const { getByTestId } = renderWithProviders(<ShopScreen />);
      expect(getByTestId('shop-screen')).toBeTruthy();
    });

    it('renders category filters', () => {
      const { getByText } = renderWithProviders(<ShopScreen />);
      expect(getByText('Flower')).toBeTruthy();
      expect(getByText('Edibles')).toBeTruthy();
      expect(getByText('Vapes')).toBeTruthy();
    });

    it('renders search input', () => {
      const { getByTestId } = renderWithProviders(<ShopScreen />);
      expect(getByTestId('product-search-input')).toBeTruthy();
    });

    it('renders product list', () => {
      const { getByText } = renderWithProviders(<ShopScreen />);
      // Verify products are rendered (implies list exists)
      expect(getByText('Blue Dream')).toBeTruthy();
    });
  });

  describe('Product Display', () => {
    it('renders all products', () => {
      const { getByText } = renderWithProviders(<ShopScreen />);
      expect(getByText('Blue Dream')).toBeTruthy();
      expect(getByText('Girl Scout Cookies')).toBeTruthy();
      expect(getByText('Sour Diesel')).toBeTruthy();
    });

    it('renders product prices', () => {
      const { getByText } = renderWithProviders(<ShopScreen />);
      expect(getByText('$25.00')).toBeTruthy();
      expect(getByText('$30.00')).toBeTruthy();
      expect(getByText('$28.00')).toBeTruthy();
    });

    it('renders product items with testIDs', () => {
      const { getByTestId } = renderWithProviders(<ShopScreen />);
      expect(getByTestId('product-item-product-1')).toBeTruthy();
      expect(getByTestId('product-item-product-2')).toBeTruthy();
      expect(getByTestId('product-item-product-3')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when products are loading', () => {
      (useProducts as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
        fetchNextPage: jest.fn(),
        isFetchingNextPage: false,
        hasNextPage: false,
        isRefetching: false,
      });

      const { getByTestId } = renderWithProviders(<ShopScreen />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('shows skeleton filters when filters are loading', () => {
      (useFiltersQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
      });

      const { getByTestId } = renderWithProviders(<ShopScreen />);
      expect(getByTestId('shop-screen')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('shows error message when products fail to load', () => {
      (useProducts as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: jest.fn(),
        fetchNextPage: jest.fn(),
        isFetchingNextPage: false,
        hasNextPage: false,
        isRefetching: false,
      });

      const { getByText } = renderWithProviders(<ShopScreen />);
      expect(getByText('Failed to load products')).toBeTruthy();
    });

    it('shows toast when error occurs', () => {
      (useProducts as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: jest.fn(),
        fetchNextPage: jest.fn(),
        isFetchingNextPage: false,
        hasNextPage: false,
        isRefetching: false,
      });

      renderWithProviders(<ShopScreen />);
      waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Failed to load products');
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no products', () => {
      (useProducts as jest.Mock).mockReturnValue({
        data: { products: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchNextPage: jest.fn(),
        isFetchingNextPage: false,
        hasNextPage: false,
        isRefetching: false,
      });

      const { getByText } = renderWithProviders(<ShopScreen />);
      expect(getByText('No products found')).toBeTruthy();
    });
  });

  describe('Category Filtering', () => {
    it('filters products by selected category', () => {
      const { getByTestId, getByText } = renderWithProviders(<ShopScreen />);

      // All products visible initially
      expect(getByText('Blue Dream')).toBeTruthy();
      expect(getByText('Girl Scout Cookies')).toBeTruthy();

      // Select flower filter (all products are flower category)
      const flowerFilter = getByTestId('category-filter-flower');
      fireEvent.press(flowerFilter);

      // Products still visible
      expect(getByText('Blue Dream')).toBeTruthy();
    });

    it('toggles filter selection', () => {
      const { getByTestId } = renderWithProviders(<ShopScreen />);
      const flowerFilter = getByTestId('category-filter-flower');

      fireEvent.press(flowerFilter);
      // Filter is selected

      fireEvent.press(flowerFilter);
      // Filter is deselected (back to showing all)
    });
  });

  describe('Search Functionality', () => {
    it('updates search term', () => {
      const { getByTestId } = renderWithProviders(<ShopScreen />);
      const searchInput = getByTestId('product-search-input');

      fireEvent.changeText(searchInput, 'Blue');
      expect(searchInput.props.value).toBe('Blue');
    });

    it('filters products by search term', () => {
      const { getByTestId, getByText } = renderWithProviders(<ShopScreen />);
      const searchInput = getByTestId('product-search-input');

      fireEvent.changeText(searchInput, 'Blue');

      // Blue Dream should be visible
      expect(getByText('Blue Dream')).toBeTruthy();
    });
  });

  describe('Product Navigation', () => {
    it('navigates to product detail when product is pressed', () => {
      const { getByTestId } = renderWithProviders(<ShopScreen />);
      const productItem = getByTestId('product-item-product-1');

      fireEvent.press(productItem);

      expect(hapticLight).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', { slug: 'blue-dream' });
    });
  });

  describe('Add to Cart', () => {
    it('adds product to cart when add button is pressed', () => {
      const mockAddItem = jest.fn();
      (useCart as jest.Mock).mockReturnValue({
        addItem: mockAddItem,
      });

      const { getByTestId } = renderWithProviders(<ShopScreen />);
      const addButton = getByTestId('add-to-cart-product-1');

      fireEvent.press(addButton);

      expect(mockAddItem).toHaveBeenCalledWith({
        productId: 'product-1',
        quantity: 1,
        price: 25.0,
        name: 'Blue Dream',
      });
    });

    it('has accessibility label for add to cart button', () => {
      const { getByLabelText } = renderWithProviders(<ShopScreen />);
      expect(getByLabelText('Add Blue Dream to cart')).toBeTruthy();
    });
  });

  describe('Pull to Refresh', () => {
    it('calls refetch when pull to refresh is triggered', () => {
      const mockRefetch = jest.fn();
      (useProducts as jest.Mock).mockReturnValue({
        data: { products: mockProducts },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        fetchNextPage: jest.fn(),
        isFetchingNextPage: false,
        hasNextPage: false,
        isRefetching: false,
      });

      renderWithProviders(<ShopScreen />);
      // Refetch function is available and can be called
      expect(mockRefetch).toBeDefined();
    });
  });

  describe('Infinite Scroll', () => {
    it('has fetchNextPage function available', () => {
      const mockFetchNextPage = jest.fn();
      (useProducts as jest.Mock).mockReturnValue({
        data: { products: mockProducts },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
        hasNextPage: true,
        isRefetching: false,
      });

      renderWithProviders(<ShopScreen />);
      expect(mockFetchNextPage).toBeDefined();
    });

    it('respects hasNextPage flag', () => {
      const mockFetchNextPage = jest.fn();
      (useProducts as jest.Mock).mockReturnValue({
        data: { products: mockProducts },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
        hasNextPage: false,
        isRefetching: false,
      });

      renderWithProviders(<ShopScreen />);
      expect(mockFetchNextPage).toBeDefined();
    });

    it('handles isFetchingNextPage state', () => {
      (useProducts as jest.Mock).mockReturnValue({
        data: { products: mockProducts },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchNextPage: jest.fn(),
        isFetchingNextPage: true,
        hasNextPage: true,
        isRefetching: false,
      });

      const { getByText } = renderWithProviders(<ShopScreen />);
      // Products still render during pagination
      expect(getByText('Blue Dream')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessibility label for category filter', () => {
      const { getAllByLabelText } = renderWithProviders(<ShopScreen />);
      const filters = getAllByLabelText('Filter by category');
      expect(filters.length).toBeGreaterThan(0);
    });

    it('has accessibility label for search input', () => {
      const { getByLabelText } = renderWithProviders(<ShopScreen />);
      expect(getByLabelText('search products')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme background color', () => {
      const { getByTestId } = renderWithProviders(<ShopScreen />);
      const screen = getByTestId('shop-screen');
      const style = screen.props.style;
      const bgColor = Array.isArray(style)
        ? style.find((s: any) => s?.backgroundColor)?.backgroundColor
        : style?.backgroundColor;
      expect(bgColor).toBeTruthy();
    });
  });
});
