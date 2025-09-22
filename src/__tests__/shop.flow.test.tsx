import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

// Do not import ShopScreen at top-level. Tests will require it after installing per-test mocks
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// Mock useNavigation hook
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock products data
const mockProducts = [
  {
    id: '1',
    name: 'Blue Dream',
    category: 'flower',
    price: 35.0,
    image: 'blue-dream.jpg',
    slug: 'blue-dream',
    inStock: true,
  },
  {
    id: '2',
    name: 'Sour Diesel',
    category: 'flower',
    price: 40.0,
    image: 'sour-diesel.jpg',
    slug: 'sour-diesel',
    inStock: true,
  },
];

// We'll register default mocks in beforeEach using jest.doMock so tests can override per-test.

describe('Shop Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  // Default mocks for hooks (can be overridden in specific tests with jest.isolateModules + jest.doMock)
  jest.mock('../hooks/useProducts', () => ({
    useProducts: () => ({
      data: { products: mockProducts, pagination: { total: 2 } },
      isLoading: false,
      error: null,
    }),
  }));

  jest.mock('../hooks/useCart', () => ({
    useCart: () => ({
      data: { items: [], total: 0 },
      addItem: jest.fn(),
    }),
  }));

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>{component}</NavigationContainer>
      </QueryClientProvider>
    );
  };

  describe('ShopScreen', () => {
    const getShopScreen = () => {
      // require after default mocks are registered
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('../screens/ShopScreen').default;
    };

    it('should render shop screen with products', async () => {
      const ShopScreen = getShopScreen();
      const { getByText, getByTestId } = renderWithProviders(<ShopScreen />);

      // Check if products are displayed
      await waitFor(() => {
        expect(getByText('Blue Dream')).toBeTruthy();
        expect(getByText('Sour Diesel')).toBeTruthy();
      });

      // Check if prices are displayed
      expect(getByText('$35.00')).toBeTruthy();
      expect(getByText('$40.00')).toBeTruthy();
    });

    it('should navigate to product detail when product is pressed', async () => {
      const ShopScreen = getShopScreen();
      const { getByText } = renderWithProviders(<ShopScreen />);

      await waitFor(() => {
        expect(getByText('Blue Dream')).toBeTruthy();
      });

      // Press on product
      fireEvent.press(getByText('Blue Dream'));

      expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', {
        slug: 'blue-dream',
      });
    });

    it('should filter products by category', async () => {
      const ShopScreen = getShopScreen();
      const { getByText, getByTestId } = renderWithProviders(<ShopScreen />);

      await waitFor(() => {
        expect(getByText('Blue Dream')).toBeTruthy();
      });

      // Press filter button
      const filterButton = getByTestId('category-filter-flower');
      fireEvent.press(filterButton);

      // Products should still be visible (all are flower category)
      expect(getByText('Blue Dream')).toBeTruthy();
      expect(getByText('Sour Diesel')).toBeTruthy();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should show empty state when no products match filter', async () => {
      // Spy on the useProducts hook and return empty products for this test
      const prodModule = require('../hooks/useProducts');
      jest.spyOn(prodModule, 'useProducts').mockReturnValue({
        data: { products: [], pagination: { total: 0 } },
        isLoading: false,
        error: null,
      });

      const ShopScreen = getShopScreen();
      const { getByText } = renderWithProviders(<ShopScreen />);

      await waitFor(() => {
        expect(getByText(/no products found/i)).toBeTruthy();
      });
    });

    it('should handle search functionality', async () => {
      const ShopScreen = getShopScreen();
      const { getByTestId, getByText } = renderWithProviders(<ShopScreen />);

      await waitFor(() => {
        expect(getByText('Blue Dream')).toBeTruthy();
      });

      // Type in search box
      const searchInput = getByTestId('product-search-input');
      fireEvent.changeText(searchInput, 'Blue');

      // Should show filtered results
      expect(getByText('Blue Dream')).toBeTruthy();
    });

    it('should add product to cart from shop screen', async () => {
      const mockAddItem = jest.fn();
      const cartModule = require('../hooks/useCart');
      jest.spyOn(cartModule, 'useCart').mockReturnValue({
        data: { items: [], total: 0 },
        addItem: mockAddItem,
      });

      const ShopScreen = getShopScreen();
      const { getByTestId } = renderWithProviders(<ShopScreen />);

      // Find and press add to cart button
      const addToCartButton = getByTestId('add-to-cart-1');
      fireEvent.press(addToCartButton);

      // support either legacy signature addItem({ productId, quantity })
      // or new signature addItem({ items: [{ productId, quantity, price?, variantId? }] })
      const calledWith = mockAddItem.mock.calls[0][0];
      const legacyShape = calledWith && calledWith.productId === '1' && calledWith.quantity === 1;
      const newShape =
        calledWith && Array.isArray(calledWith.items) && calledWith.items[0].productId === '1' && calledWith.items[0].quantity === 1;
      expect(legacyShape || newShape).toBeTruthy();
    });

    it('should show loading state', async () => {
      const prodModule = require('../hooks/useProducts');
      jest.spyOn(prodModule, 'useProducts').mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const ShopScreen = getShopScreen();
      const { getByTestId } = renderWithProviders(<ShopScreen />);

      await waitFor(() => {
        expect(getByTestId('loading-indicator')).toBeTruthy();
      });
    });

    it('should show error state', () => {
      const prodModule = require('../hooks/useProducts');
      jest.spyOn(prodModule, 'useProducts').mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load products'),
      });

      const ShopScreen = getShopScreen();
      const { getByText } = renderWithProviders(<ShopScreen />);

      expect(getByText(/failed to load products/i)).toBeTruthy();
    });

    it('should handle accessibility labels correctly', async () => {
      const ShopScreen = getShopScreen();
      const { getByLabelText } = renderWithProviders(<ShopScreen />);

      await waitFor(() => {
        expect(getByLabelText(/blue dream product/i)).toBeTruthy();
      });

      expect(getByLabelText(/search products/i)).toBeTruthy();
      expect(getByLabelText(/filter by category/i)).toBeTruthy();
    });
  });
});
