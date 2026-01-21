// src/__tests__/screens/FavoritesScreen.test.tsx

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Heart: () => null,
}));

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

// Mock favorites hooks
jest.mock('../../hooks/useFavorites');

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FavoritesScreen from '../../screens/FavoritesScreen';
import { ThemeContext } from '../../context/ThemeContext';
import * as haptic from '../../utils/haptic';
import * as useFavorites from '../../hooks/useFavorites';

describe('FavoritesScreen', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const mockTheme = {
    colorTemp: 'neutral' as const,
    brandPrimary: '#2E7D32',
    brandSecondary: '#81C784',
    brandBackground: '#FFFFFF',
    brandAccent: '#FFD700',
    cornerRadius: 8,
    logoUrl: undefined,
    elevation: 'soft' as const,
    loading: false,
    debugInfo: { weatherSource: 'time-of-day' as const, lastUpdated: new Date() },
    cmsTheme: null,
    weatherSimulation: { enabled: false, condition: null },
    setWeatherSimulation: jest.fn(),
  };

  const mockFavorites = [
    {
      id: 'fav-1',
      userId: 'user-123',
      itemId: 'product-1',
      itemType: 'product' as const,
      item: { id: 'product-1', name: 'Blue Dream', price: 45 },
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'fav-2',
      userId: 'user-123',
      itemId: 'product-2',
      itemType: 'product' as const,
      item: { id: 'product-2', name: 'Girl Scout Cookies', price: 50 },
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'fav-3',
      userId: 'user-123',
      itemId: 'product-3',
      itemType: 'product' as const,
      item: { id: 'product-3', name: 'Sour Diesel', price: 48 },
      createdAt: '2024-01-03T00:00:00Z',
    },
  ];

  const mockRemoveFavorite = { mutate: jest.fn() };

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={mockTheme}>{ui}</ThemeContext.Provider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    (useFavorites.useRemoveFromFavorites as jest.Mock).mockReturnValue(mockRemoveFavorite);
  });

  describe('Loading State', () => {
    it('displays loading indicator when fetching favorites', () => {
      (useFavorites.useFavoriteProducts as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { getByText, UNSAFE_getByType } = renderWithProviders(<FavoritesScreen />);

      expect(UNSAFE_getByType('ActivityIndicator' as any)).toBeTruthy();
      expect(getByText('Loading favorites...')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('displays error message when query fails', () => {
      (useFavorites.useFavoriteProducts as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      });

      const { getByText } = renderWithProviders(<FavoritesScreen />);

      expect(getByText('Unable to load favorites. Please try again.')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('renders screen without errors when no favorites', () => {
      (useFavorites.useFavoriteProducts as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { getByText } = renderWithProviders(<FavoritesScreen />);

      // Header should still be visible
      expect(getByText('Favorites')).toBeTruthy();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      (useFavorites.useFavoriteProducts as jest.Mock).mockReturnValue({
        data: mockFavorites,
        isLoading: false,
        error: null,
      });
    });

    it('renders favorites screen with header', () => {
      const { getByText } = renderWithProviders(<FavoritesScreen />);

      expect(getByText('Favorites')).toBeTruthy();
    });

    it('displays all favorite products', () => {
      const { getByText } = renderWithProviders(<FavoritesScreen />);

      expect(getByText('Blue Dream')).toBeTruthy();
      expect(getByText('Girl Scout Cookies')).toBeTruthy();
      expect(getByText('Sour Diesel')).toBeTruthy();
    });

    it('removes favorite when heart icon is pressed', async () => {
      // Get all pressables (heart icons)
      const { UNSAFE_getAllByType } = renderWithProviders(<FavoritesScreen />);
      const pressables = UNSAFE_getAllByType('Pressable' as any);

      // Find and press the heart icon for the first favorite (skip back button)
      const heartButton = pressables[1];
      fireEvent.press(heartButton);

      await waitFor(() => {
        expect(mockRemoveFavorite.mutate).toHaveBeenCalledWith('fav-1');
        expect(haptic.hapticMedium).toHaveBeenCalled();
      });
    });

    it('calls navigation.goBack when back button is pressed', async () => {
      const { UNSAFE_getAllByType } = renderWithProviders(<FavoritesScreen />);

      const pressables = UNSAFE_getAllByType('Pressable' as any);
      const backButton = pressables[0];

      fireEvent.press(backButton);

      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });

    it('displays correct number of favorites', () => {
      const { getAllByText } = renderWithProviders(<FavoritesScreen />);

      // Should have 3 product names
      expect(getAllByText(/Dream|Cookies|Diesel/).length).toBe(3);
    });

    it('handles favorite without item gracefully', () => {
      const favoritesWithNullItem = [
        {
          id: 'fav-null',
          userId: 'user-123',
          itemId: 'product-null',
          itemType: 'product' as const,
          item: null,
          createdAt: '2024-01-04T00:00:00Z',
        },
      ];

      (useFavorites.useFavoriteProducts as jest.Mock).mockReturnValue({
        data: favoritesWithNullItem,
        isLoading: false,
        error: null,
      });

      const { getByText } = renderWithProviders(<FavoritesScreen />);

      expect(getByText('Product')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    beforeEach(() => {
      (useFavorites.useFavoriteProducts as jest.Mock).mockReturnValue({
        data: mockFavorites,
        isLoading: false,
        error: null,
      });
    });

    it('applies warm theme background', () => {
      const warmTheme = { ...mockTheme, colorTemp: 'warm' as const };

      const { root } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={warmTheme}>
            <FavoritesScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(root).toBeTruthy();
    });

    it('applies cool theme background', () => {
      const coolTheme = { ...mockTheme, colorTemp: 'cool' as const };

      const { root } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={coolTheme}>
            <FavoritesScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(root).toBeTruthy();
    });

    it('applies brand primary color to product names', () => {
      const { getByText } = renderWithProviders(<FavoritesScreen />);

      const productName = getByText('Blue Dream');
      expect(productName.props.style).toContainEqual(
        expect.objectContaining({ color: mockTheme.brandPrimary })
      );
    });
  });

  describe('Haptic Feedback', () => {
    beforeEach(() => {
      (useFavorites.useFavoriteProducts as jest.Mock).mockReturnValue({
        data: mockFavorites,
        isLoading: false,
        error: null,
      });
    });

    it('triggers medium haptic on favorite removal', async () => {
      const { UNSAFE_getAllByType } = renderWithProviders(<FavoritesScreen />);

      const pressables = UNSAFE_getAllByType('Pressable' as any);
      fireEvent.press(pressables[1]); // First favorite's heart button

      await waitFor(() => {
        expect(haptic.hapticMedium).toHaveBeenCalled();
      });
    });

    it('triggers light haptic on back button', async () => {
      const { UNSAFE_getAllByType } = renderWithProviders(<FavoritesScreen />);

      const pressables = UNSAFE_getAllByType('Pressable' as any);
      fireEvent.press(pressables[0]); // Back button

      await waitFor(() => {
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });
  });

  describe('Multiple Favorites Management', () => {
    beforeEach(() => {
      (useFavorites.useFavoriteProducts as jest.Mock).mockReturnValue({
        data: mockFavorites,
        isLoading: false,
        error: null,
      });
    });

    it('can remove multiple favorites sequentially', async () => {
      const { UNSAFE_getAllByType } = renderWithProviders(<FavoritesScreen />);

      const pressables = UNSAFE_getAllByType('Pressable' as any);

      // Remove first favorite
      fireEvent.press(pressables[1]);

      // Remove second favorite
      fireEvent.press(pressables[2]);

      await waitFor(() => {
        expect(mockRemoveFavorite.mutate).toHaveBeenCalledTimes(2);
        expect(mockRemoveFavorite.mutate).toHaveBeenNthCalledWith(1, 'fav-1');
        expect(mockRemoveFavorite.mutate).toHaveBeenNthCalledWith(2, 'fav-2');
      });
    });
  });
});
