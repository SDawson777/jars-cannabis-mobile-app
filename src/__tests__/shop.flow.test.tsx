import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import ShopScreen from '../screens/ShopScreen';
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
    price: 35.00,
    image: 'blue-dream.jpg',
    slug: 'blue-dream',
    inStock: true,
  },
  {
    id: '2', 
    name: 'Sour Diesel',
    category: 'flower',
    price: 40.00,
    image: 'sour-diesel.jpg',
    slug: 'sour-diesel',
    inStock: true,
  },
];

// Mock API hooks
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

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          {component}
        </NavigationContainer>
      </QueryClientProvider>
    );
  };

  describe('ShopScreen', () => {
    it('should render shop screen with products', async () => {
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

    it('should show empty state when no products match filter', () => {
      // Mock empty products
      jest.doMock('../hooks/useProducts', () => ({
        useProducts: () => ({
          data: { products: [], pagination: { total: 0 } },
          isLoading: false,
          error: null,
        }),
      }));

      const { getByText } = renderWithProviders(<ShopScreen />);
      
      expect(getByText(/no products found/i)).toBeTruthy();
    });

    it('should handle search functionality', async () => {
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
      jest.doMock('../hooks/useCart', () => ({
        useCart: () => ({
          data: { items: [], total: 0 },
          addItem: mockAddItem,
        }),
      }));

      const { getByTestId } = renderWithProviders(<ShopScreen />);
      
      // Find and press add to cart button
      const addToCartButton = getByTestId('add-to-cart-1');
      fireEvent.press(addToCartButton);

      expect(mockAddItem).toHaveBeenCalledWith({
        productId: '1',
        quantity: 1,
      });
    });

    it('should show loading state', () => {
      jest.doMock('../hooks/useProducts', () => ({
        useProducts: () => ({
          data: null,
          isLoading: true,
          error: null,
        }),
      }));

      const { getByTestId } = renderWithProviders(<ShopScreen />);
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should show error state', () => {
      jest.doMock('../hooks/useProducts', () => ({
        useProducts: () => ({
          data: null,
          isLoading: false,
          error: new Error('Failed to load products'),
        }),
      }));

      const { getByText } = renderWithProviders(<ShopScreen />);
      
      expect(getByText(/failed to load products/i)).toBeTruthy();
    });

    it('should handle accessibility labels correctly', async () => {
      const { getByLabelText } = renderWithProviders(<ShopScreen />);
      
      await waitFor(() => {
        expect(getByLabelText(/blue dream product/i)).toBeTruthy();
      });

      expect(getByLabelText(/search products/i)).toBeTruthy();
      expect(getByLabelText(/filter by category/i)).toBeTruthy();
    });
  });
});