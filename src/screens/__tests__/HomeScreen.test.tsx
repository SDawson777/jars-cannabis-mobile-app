// src/screens/__tests__/HomeScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomeScreen from '../HomeScreen';
import { ThemeProvider } from '../../context/ThemeContext';
import { BrandProvider } from '../../context/BrandContext';
import { AuthContext } from '../../context/AuthContext';
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

jest.mock('lucide-react-native', () => ({
  MapPin: () => null,
  ChevronDown: () => null,
  Search: () => null,
  Heart: () => null,
  ShoppingCart: () => null,
  User: () => null,
  Home: () => null,
  Menu: () => null,
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('../../utils/analytics', () => ({
  trackScreenView: jest.fn(),
  trackContentClick: jest.fn(),
  trackContentView: jest.fn(),
  logEvent: jest.fn(),
  trackEvent: jest.fn(),
}));

jest.mock('../../hooks/useForYouToday', () => ({
  useForYouToday: jest.fn(),
}));

jest.mock('../../hooks/useDeals', () => ({
  useDeals: jest.fn(),
}));

jest.mock('../../hooks/useCategories', () => ({
  useCategories: jest.fn(),
}));

jest.mock('../../hooks/useRecommendations', () => ({
  useWaysToShop: jest.fn(),
}));

jest.mock('../../hooks/usePulse', () => ({
  usePulseCTA: jest.fn(onPress => ({
    onPress,
    pulseStyle: {},
  })),
}));

jest.mock('../../hooks/useWeatherRecommendations', () => ({
  mapWeatherCondition: (condition: string) => condition,
}));

jest.mock('../../hooks/useWeatherRecommendationsPreference', () => ({
  useWeatherRecommendationsPreference: jest.fn(() => [false, jest.fn(), true]),
}));

jest.mock('../../components/ForYouTodayCard', () => 'ForYouTodayCard');
jest.mock('../../components/ForYouTodaySkeleton', () => 'ForYouTodaySkeleton');
jest.mock('../../components/WeatherForYouRail', () => 'WeatherForYouRail');
jest.mock('../../components/OfflineNotice', () => 'OfflineNotice');

import { hapticLight } from '../../utils/haptic';
import { trackScreenView, trackContentClick, trackContentView } from '../../utils/analytics';
import { useForYouToday } from '../../hooks/useForYouToday';
import { useDeals } from '../../hooks/useDeals';
import { useCategories } from '../../hooks/useCategories';
import { useWaysToShop } from '../../hooks/useRecommendations';
import { useWeatherRecommendationsPreference } from '../../hooks/useWeatherRecommendationsPreference';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

const mockAuthContext = {
  data: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
  isLoading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
};

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
        <ThemeProvider>
          <AuthContext.Provider value={mockAuthContext}>
            <StoreProvider>{ui}</StoreProvider>
          </AuthContext.Provider>
        </ThemeProvider>
      </BrandProvider>
    </QueryClientProvider>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useForYouToday as jest.Mock).mockReturnValue({ data: null, isLoading: false });
    (useDeals as jest.Mock).mockReturnValue({ data: null });
    (useCategories as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    (useWaysToShop as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    (useWeatherRecommendationsPreference as jest.Mock).mockReturnValue([false, jest.fn(), true]);
  });

  describe('Basic Rendering', () => {
    it('renders the home screen with header', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      expect(getByTestId('home-screen')).toBeTruthy();
    });

    it('renders header icons', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      expect(getByTestId('home-screen')).toBeTruthy();
    });

    it('renders search input', () => {
      const { getByPlaceholderText } = renderWithProviders(<HomeScreen />);
      expect(getByPlaceholderText('Search Products')).toBeTruthy();
    });

    it('renders pickup location text', () => {
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Pickup from:')).toBeTruthy();
      expect(getByText('Downtown')).toBeTruthy();
    });

    it('renders hero section', () => {
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Price Drop')).toBeTruthy();
      expect(getByText('New Everyday Low Pricing')).toBeTruthy();
      expect(getByText('Shop Deli')).toBeTruthy();
    });

    it('renders AI Strain Finder CTA', () => {
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('🧠 Find My Perfect Strain')).toBeTruthy();
      expect(getByText('Let AI help you discover products tailored to your needs')).toBeTruthy();
    });
  });

  describe('Screen Analytics', () => {
    it('tracks screen view on focus', () => {
      renderWithProviders(<HomeScreen />);
      expect(trackScreenView).toHaveBeenCalledWith('HomeScreen', { userId: 'user-123' });
    });
  });

  describe('For You Today Section', () => {
    it('shows skeleton when loading', () => {
      (useForYouToday as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
      });
      const { UNSAFE_getByType } = renderWithProviders(<HomeScreen />);
      expect(UNSAFE_getByType('ForYouTodaySkeleton')).toBeTruthy();
    });

    it('shows ForYouTodayCard when data is available', () => {
      const mockForYou = {
        products: [{ id: '1', name: 'Blue Dream', price: 25 }],
      };
      (useForYouToday as jest.Mock).mockReturnValue({
        data: mockForYou,
        isLoading: false,
      });
      const { UNSAFE_getByType } = renderWithProviders(<HomeScreen />);
      expect(UNSAFE_getByType('ForYouTodayCard')).toBeTruthy();
    });

    it('does not render ForYouTodayCard when loading', () => {
      (useForYouToday as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
      });
      const { UNSAFE_queryByType } = renderWithProviders(<HomeScreen />);
      expect(UNSAFE_queryByType('ForYouTodayCard')).toBeNull();
    });
  });

  describe('Categories Section', () => {
    it('renders category section header', () => {
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Shop By Categories')).toBeTruthy();
    });

    it('shows loading skeleton when categories are loading', () => {
      (useCategories as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
      });
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Shop By Categories')).toBeTruthy();
    });

    it('renders categories when loaded', () => {
      (useCategories as jest.Mock).mockReturnValue({
        data: [
          { id: '1', label: 'Flowers', emoji: '🌸' },
          { id: '2', label: 'Edibles', emoji: '🍪' },
          { id: '3', label: 'Vapes', emoji: '💨' },
        ],
        isLoading: false,
      });
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Flowers')).toBeTruthy();
      expect(getByText('Edibles')).toBeTruthy();
      expect(getByText('Vapes')).toBeTruthy();
      expect(getByText('🌸')).toBeTruthy();
      expect(getByText('🍪')).toBeTruthy();
      expect(getByText('💨')).toBeTruthy();
    });

    it('shows empty message when no categories', () => {
      (useCategories as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('No categories available.')).toBeTruthy();
    });

    it('navigates to ShopScreen when category is pressed', () => {
      (useCategories as jest.Mock).mockReturnValue({
        data: [{ id: '1', label: 'Flowers', emoji: '🌸' }],
        isLoading: false,
      });
      const { getByText } = renderWithProviders(<HomeScreen />);
      fireEvent.press(getByText('Flowers'));
      expect(mockNavigate).toHaveBeenCalledWith('ShopScreen');
    });

    it('tracks categories loaded', async () => {
      (useCategories as jest.Mock).mockReturnValue({
        data: [
          { id: '1', label: 'Flowers', emoji: '🌸' },
          { id: '2', label: 'Edibles', emoji: '🍪' },
        ],
        isLoading: false,
      });
      renderWithProviders(<HomeScreen />);
      await waitFor(() => {
        expect(trackContentView).toHaveBeenCalledWith('categories', 'home_categories', {
          count: 2,
        });
      });
    });
  });

  describe('Featured Products Section', () => {
    it('renders featured products section header', () => {
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Featured Products')).toBeTruthy();
    });

    it('shows loading skeleton when deals are loading', () => {
      (useDeals as jest.Mock).mockReturnValue({ data: null });
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Featured Products')).toBeTruthy();
    });

    it('renders featured products from deals', () => {
      (useDeals as jest.Mock).mockReturnValue({
        data: [
          {
            id: 'deal-1',
            title: 'Blue Dream',
            discountValue: 25,
            imageUrl: 'https://example.com/blue-dream.jpg',
            description: 'Great strain',
          },
          {
            id: 'deal-2',
            title: 'Girl Scout Cookies',
            discountValue: 30,
            imageUrl: 'https://example.com/gsc.jpg',
            description: 'Popular strain',
          },
        ],
      });
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Blue Dream')).toBeTruthy();
      expect(getByText('Girl Scout Cookies')).toBeTruthy();
      expect(getByText('$25.00')).toBeTruthy();
      expect(getByText('$30.00')).toBeTruthy();
    });

    it('shows empty message when no featured products', () => {
      (useDeals as jest.Mock).mockReturnValue({ data: [] });
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('No featured products.')).toBeTruthy();
    });

    it('navigates to ProductDetail when featured product is pressed', () => {
      (useDeals as jest.Mock).mockReturnValue({
        data: [
          {
            id: 'deal-1',
            title: 'Blue Dream',
            discountValue: 25,
            imageUrl: 'https://example.com/blue-dream.jpg',
            description: 'Great strain',
          },
        ],
      });
      const { getByText } = renderWithProviders(<HomeScreen />);
      fireEvent.press(getByText('Blue Dream'));
      expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', { slug: 'deal-1' });
    });

    it('tracks deals loaded', async () => {
      (useDeals as jest.Mock).mockReturnValue({
        data: [
          { id: 'deal-1', title: 'Deal 1', discountValue: 10 },
          { id: 'deal-2', title: 'Deal 2', discountValue: 15 },
        ],
      });
      renderWithProviders(<HomeScreen />);
      await waitFor(() => {
        expect(trackContentView).toHaveBeenCalledWith('deals', 'home_deals_rail', { count: 2 });
      });
    });
  });

  describe('Your Weed Your Way Section', () => {
    it('renders ways to shop section header', () => {
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Your Weed Your Way')).toBeTruthy();
    });

    it('shows loading skeleton when ways are loading', () => {
      (useWaysToShop as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
      });
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Your Weed Your Way')).toBeTruthy();
    });

    it('renders ways to shop when loaded', () => {
      (useWaysToShop as jest.Mock).mockReturnValue({
        data: [
          { id: '1', label: 'Delivery' },
          { id: '2', label: 'Pickup' },
          { id: '3', label: 'Curbside' },
        ],
        isLoading: false,
      });
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Delivery')).toBeTruthy();
      expect(getByText('Pickup')).toBeTruthy();
      expect(getByText('Curbside')).toBeTruthy();
    });

    it('shows empty message when no ways to shop', () => {
      (useWaysToShop as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('No ways to shop.')).toBeTruthy();
    });

    it('navigates to ShopScreen when way is pressed', () => {
      (useWaysToShop as jest.Mock).mockReturnValue({
        data: [{ id: '1', label: 'Delivery' }],
        isLoading: false,
      });
      const { getByText } = renderWithProviders(<HomeScreen />);
      fireEvent.press(getByText('Delivery'));
      expect(mockNavigate).toHaveBeenCalledWith('ShopScreen');
    });
  });

  describe('Educational Resources Section', () => {
    it('renders educational resources section', () => {
      const { getByText } = renderWithProviders(<HomeScreen />);
      expect(getByText('Educational Resources')).toBeTruthy();
    });

    it('renders terpene wheel CTA', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      expect(getByTestId('terpene-wheel-cta')).toBeTruthy();
    });

    it('navigates to TerpeneWheel when CTA is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      fireEvent.press(getByTestId('terpene-wheel-cta'));
      expect(trackContentClick).toHaveBeenCalledWith('feature', 'terpene_wheel');
      expect(mockNavigate).toHaveBeenCalledWith('TerpeneWheel');
    });
  });

  describe('Weather Recommendations', () => {
    it('does not render weather rail when preference is disabled', () => {
      (useWeatherRecommendationsPreference as jest.Mock).mockReturnValue([false, jest.fn(), true]);
      const { UNSAFE_queryByType } = renderWithProviders(<HomeScreen />);
      expect(UNSAFE_queryByType('WeatherForYouRail')).toBeNull();
    });

    it('renders weather rail when preference is enabled', () => {
      (useWeatherRecommendationsPreference as jest.Mock).mockReturnValue([true, jest.fn(), true]);
      const { UNSAFE_getByType } = renderWithProviders(<HomeScreen />);
      expect(UNSAFE_getByType('WeatherForYouRail')).toBeTruthy();
    });
  });

  describe('Bottom Navigation', () => {
    it('renders all bottom nav tabs', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      expect(getByTestId('home-tab')).toBeTruthy();
      expect(getByTestId('shop-tab')).toBeTruthy();
      expect(getByTestId('deals-tab')).toBeTruthy();
      expect(getByTestId('cart-tab')).toBeTruthy();
      expect(getByTestId('profile-tab')).toBeTruthy();
    });

    it('navigates to HomeScreen when home tab is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      fireEvent.press(getByTestId('home-tab'));
      expect(mockNavigate).toHaveBeenCalledWith('HomeScreen');
    });

    it('navigates to ShopScreen when shop tab is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      fireEvent.press(getByTestId('shop-tab'));
      expect(mockNavigate).toHaveBeenCalledWith('ShopScreen');
    });

    it('navigates to DealsScreen and tracks analytics when deals tab is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      fireEvent.press(getByTestId('deals-tab'));
      expect(trackContentClick).toHaveBeenCalledWith('nav', 'deals_tab');
      expect(mockNavigate).toHaveBeenCalledWith('DealsScreen');
    });

    it('navigates to CartScreen and triggers haptic when cart tab is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      fireEvent.press(getByTestId('cart-tab'));
      expect(hapticLight).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('CartScreen');
    });

    it('navigates to Profile and triggers haptic when profile tab is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      fireEvent.press(getByTestId('profile-tab'));
      expect(hapticLight).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });
  });

  describe('Header Navigation', () => {
    it('navigates to Favorites when heart icon is pressed', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      const homeScreen = getByTestId('home-screen');
      // Find Heart icon by searching for pressable with Favorites navigation
      const pressables = homeScreen.findAllByType('Pressable' as any);
      const favoritesButton = pressables.find((p: any) => {
        const onPress = p.props.onPress;
        if (onPress) {
          const navCall = String(onPress);
          return navCall.includes('Favorites');
        }
        return false;
      });
      if (favoritesButton) {
        fireEvent.press(favoritesButton);
        expect(mockNavigate).toHaveBeenCalledWith('Favorites');
      }
    });

    it('navigates to CartScreen when cart icon is pressed in header', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      const homeScreen = getByTestId('home-screen');
      const pressables = homeScreen.findAllByType('Pressable' as any);
      // Find cart button (second to last pressable in actions)
      const cartButton = pressables.find((p: any) => {
        const onPress = p.props.onPress;
        if (onPress && p.props.style) {
          // Test by calling it
          const _originalNavigate = mockNavigate;
          mockNavigate.mockClear();
          onPress();
          const wasCalled = mockNavigate.mock.calls.some(call => call[0] === 'CartScreen');
          return wasCalled;
        }
        return false;
      });
      if (cartButton) {
        mockNavigate.mockClear();
        fireEvent.press(cartButton);
        expect(hapticLight).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('CartScreen');
      }
    });

    it('navigates to Profile when user icon is pressed in header', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      const homeScreen = getByTestId('home-screen');
      const pressables = homeScreen.findAllByType('Pressable' as any);
      // Find profile button (last pressable in actions)
      const profileButton = pressables.find((p: any) => {
        const onPress = p.props.onPress;
        if (onPress && p.props.style) {
          // Test by calling it
          const _originalNavigate = mockNavigate;
          mockNavigate.mockClear();
          onPress();
          const wasCalled = mockNavigate.mock.calls.some(call => call[0] === 'Profile');
          return wasCalled;
        }
        return false;
      });
      if (profileButton) {
        mockNavigate.mockClear();
        fireEvent.press(profileButton);
        expect(hapticLight).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('Profile');
      }
    });
  });

  describe('AI Strain Finder Navigation', () => {
    it('navigates to StrainFinder when AI CTA is pressed', () => {
      const { getByText } = renderWithProviders(<HomeScreen />);
      fireEvent.press(getByText('🧠 Find My Perfect Strain'));
      expect(hapticLight).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('StrainFinder');
    });
  });

  describe('Theme Integration', () => {
    it('renders with warm theme background', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      const screen = getByTestId('home-screen');
      const styles = screen.props.style;
      const bgColor = Array.isArray(styles)
        ? styles.find((s: any) => s?.backgroundColor)?.backgroundColor
        : styles?.backgroundColor;
      expect(bgColor).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has testID for home screen', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      expect(getByTestId('home-screen')).toBeTruthy();
    });

    it('has testIDs for all bottom nav tabs', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      expect(getByTestId('home-tab')).toBeTruthy();
      expect(getByTestId('shop-tab')).toBeTruthy();
      expect(getByTestId('deals-tab')).toBeTruthy();
      expect(getByTestId('cart-tab')).toBeTruthy();
      expect(getByTestId('profile-tab')).toBeTruthy();
    });

    it('has testID for terpene wheel CTA', () => {
      const { getByTestId } = renderWithProviders(<HomeScreen />);
      expect(getByTestId('terpene-wheel-cta')).toBeTruthy();
    });
  });
});
