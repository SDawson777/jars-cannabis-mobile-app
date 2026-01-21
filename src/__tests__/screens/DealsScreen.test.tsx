// src/__tests__/screens/DealsScreen.test.tsx

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Tag: () => null,
  Clock: () => null,
}));

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
    }),
    useFocusEffect: (callback: () => void) => {
      React.useEffect(() => {
        callback();
      }, []);
    },
  };
});

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

// Mock analytics
jest.mock('../../utils/analytics', () => ({
  trackScreenView: jest.fn(),
  trackContentView: jest.fn(),
  trackContentClick: jest.fn(),
}));

// Mock useDeals hook
jest.mock('../../hooks/useDeals');

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DealsScreen from '../../screens/DealsScreen';
import { ThemeContext } from '../../context/ThemeContext';
import * as haptic from '../../utils/haptic';
import * as analytics from '../../utils/analytics';
import * as useDeals from '../../hooks/useDeals';
import type { CMSDeal } from '../../types/cmsExtra';

describe('DealsScreen', () => {
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

  const mockDeals: CMSDeal[] = [
    {
      id: 'deal1',
      title: '20% Off Edibles',
      description: 'Get 20% off all edible products this week',
      discountType: 'percent' as const,
      discountValue: 20,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      imageUrl: 'https://example.com/deal1.jpg',
    },
    {
      id: 'deal2',
      title: '$10 Off Your Order',
      description: 'Save $10 on orders over $50',
      discountType: 'fixed' as const,
      discountValue: 10,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      imageUrl: 'https://example.com/deal2.jpg',
    },
    {
      id: 'deal3',
      title: 'Buy One Get One Free',
      description: 'BOGO on selected strains',
      discountType: 'bogo' as const,
      startDate: '2024-01-20',
      endDate: '2024-01-27',
    },
  ];

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
  });

  describe('Loading State', () => {
    it('renders loading indicator when fetching deals', () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: jest.fn(),
      });

      const { UNSAFE_getByType } = renderWithProviders(<DealsScreen />);

      expect(UNSAFE_getByType('ActivityIndicator' as any)).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('renders error message when query fails', () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: jest.fn(),
      });

      const { getByText } = renderWithProviders(<DealsScreen />);

      expect(getByText('Unable to load deals.')).toBeTruthy();
      expect(getByText('Retry')).toBeTruthy();
    });

    it('calls refetch when retry button is pressed', () => {
      const mockRefetch = jest.fn();
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      });

      const { getByText } = renderWithProviders(<DealsScreen />);

      fireEvent.press(getByText('Retry'));

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Success State - Empty Deals', () => {
    it('renders empty state when no deals available', () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      const { getByText, getByTestId } = renderWithProviders(<DealsScreen />);

      expect(getByTestId('deals-screen')).toBeTruthy();
      expect(getByText('No Active Deals')).toBeTruthy();
      expect(getByText('Check back soon for new promotions!')).toBeTruthy();
    });
  });

  describe('Success State - With Deals', () => {
    beforeEach(() => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: mockDeals,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });
    });

    it('renders deals screen with header', () => {
      const { getByText, getByTestId } = renderWithProviders(<DealsScreen />);

      expect(getByTestId('deals-screen')).toBeTruthy();
      expect(getByText('Deals & Promotions')).toBeTruthy();
    });

    it('renders all deals', () => {
      const { getByText } = renderWithProviders(<DealsScreen />);

      expect(getByText('20% Off Edibles')).toBeTruthy();
      expect(getByText('$10 Off Your Order')).toBeTruthy();
      expect(getByText('Buy One Get One Free')).toBeTruthy();
    });

    it('displays deal descriptions', () => {
      const { getByText } = renderWithProviders(<DealsScreen />);

      expect(getByText('Get 20% off all edible products this week')).toBeTruthy();
      expect(getByText('Save $10 on orders over $50')).toBeTruthy();
      expect(getByText('BOGO on selected strains')).toBeTruthy();
    });

    it('displays correct discount badge for percent discount', () => {
      const { getByText } = renderWithProviders(<DealsScreen />);

      expect(getByText('20% OFF')).toBeTruthy();
    });

    it('displays correct discount badge for fixed discount', () => {
      const { getByText } = renderWithProviders(<DealsScreen />);

      expect(getByText('$10 OFF')).toBeTruthy();
    });

    it('displays correct discount badge for BOGO', () => {
      const { getByText } = renderWithProviders(<DealsScreen />);

      expect(getByText('BOGO')).toBeTruthy();
    });

    it('navigates to shop screen when deal is pressed', async () => {
      const { getByText } = renderWithProviders(<DealsScreen />);

      const dealCard = getByText('20% Off Edibles');
      fireEvent.press(dealCard.parent!.parent!);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('ShopScreen', { dealId: 'deal1' });
      });
    });

    it('triggers haptic feedback when deal is pressed', async () => {
      const { getByText } = renderWithProviders(<DealsScreen />);

      const dealCard = getByText('20% Off Edibles');
      fireEvent.press(dealCard.parent!.parent!);

      await waitFor(() => {
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('calls navigation.goBack when back button is pressed', () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: mockDeals,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      const { UNSAFE_getAllByType } = renderWithProviders(<DealsScreen />);

      const pressables = UNSAFE_getAllByType('Pressable' as any);
      fireEvent.press(pressables[0]); // First pressable is back button

      expect(mockGoBack).toHaveBeenCalled();
      expect(haptic.hapticLight).toHaveBeenCalled();
    });
  });

  describe('Analytics', () => {
    it('tracks screen view on mount', () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: mockDeals,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithProviders(<DealsScreen />);

      expect(analytics.trackScreenView).toHaveBeenCalledWith('DealsScreen');
    });

    it('tracks content view when deals load', async () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: mockDeals,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithProviders(<DealsScreen />);

      await waitFor(() => {
        expect(analytics.trackContentView).toHaveBeenCalledWith('deals', 'deals_list', {
          count: 3,
        });
      });
    });

    it('tracks deal click with details', async () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: mockDeals,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      const { getByText } = renderWithProviders(<DealsScreen />);

      const dealCard = getByText('20% Off Edibles');
      fireEvent.press(dealCard.parent!.parent!);

      await waitFor(() => {
        expect(analytics.trackContentClick).toHaveBeenCalledWith('deal', 'deal1', {
          title: '20% Off Edibles',
        });
      });
    });

    it('does not track content view for empty deals', () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithProviders(<DealsScreen />);

      expect(analytics.trackContentView).not.toHaveBeenCalled();
    });
  });

  describe('Theme Integration', () => {
    it('applies warm theme background', () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: mockDeals,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      const warmTheme = { ...mockTheme, colorTemp: 'warm' as const };

      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={warmTheme}>
            <DealsScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(getByTestId('deals-screen')).toBeTruthy();
    });

    it('applies cool theme background', () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: mockDeals,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      const coolTheme = { ...mockTheme, colorTemp: 'cool' as const };

      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={coolTheme}>
            <DealsScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(getByTestId('deals-screen')).toBeTruthy();
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly', () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: mockDeals,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      const { getByText } = renderWithProviders(<DealsScreen />);

      // Dates should be formatted as "Jan 1 - Jan 31"
      const dateText = getByText(/Jan 1.*Jan 31/);
      expect(dateText).toBeTruthy();
    });
  });

  describe('Image Handling', () => {
    it('renders deal images when imageUrl is provided', () => {
      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: mockDeals,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      const { UNSAFE_getAllByType } = renderWithProviders(<DealsScreen />);

      const images = UNSAFE_getAllByType('Image' as any);
      expect(images.length).toBeGreaterThan(0);
    });

    it('handles deals without images', () => {
      const dealsWithoutImages: CMSDeal[] = [
        {
          id: 'deal1',
          title: 'No Image Deal',
          description: 'This deal has no image',
          discountType: 'percent' as const,
          discountValue: 15,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      ];

      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: dealsWithoutImages,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      const { getByText } = renderWithProviders(<DealsScreen />);

      expect(getByText('No Image Deal')).toBeTruthy();
    });
  });

  describe('Discount Label Edge Cases', () => {
    it('displays generic DEAL label when discount type is unknown', () => {
      const customDeals: CMSDeal[] = [
        {
          id: 'deal1',
          title: 'Mystery Deal',
          description: 'Special offer',
          discountType: 'other' as any,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      ];

      (useDeals.useDeals as jest.Mock).mockReturnValue({
        data: customDeals,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      const { getByText } = renderWithProviders(<DealsScreen />);

      expect(getByText('DEAL')).toBeTruthy();
    });
  });
});
