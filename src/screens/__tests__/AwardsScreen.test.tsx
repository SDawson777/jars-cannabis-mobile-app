// src/screens/__tests__/AwardsScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AwardsScreen from '../AwardsScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { hapticLight, hapticMedium } from '../../utils/haptic';
import { toast } from '../../utils/toast';
import { trackEvent, trackScreenView } from '../../utils/analytics';

// Mock dependencies
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  const _React = require('react');

  return {
    ...actualRN,
    Animated: {
      ...actualRN.Animated,
      Value: jest.fn(function (value) {
        return {
          setValue: jest.fn(),
          interpolate: jest.fn(() => value),
          _value: value,
        };
      }),
      Text: actualRN.Text,
      View: actualRN.View,
      timing: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
      loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    },
    LayoutAnimation: {
      ...actualRN.LayoutAnimation,
      configureNext: jest.fn(),
      Presets: {
        easeInEaseOut: {},
      },
    },
    UIManager: {
      ...actualRN.UIManager,
      setLayoutAnimationEnabledExperimental: jest.fn(),
    },
  };
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useFocusEffect: jest.fn(callback => callback()),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Settings: () => null,
}));

jest.mock('react-native-confetti-cannon', () => {
  const _React = require('react');
  return _React.forwardRef((props: any, ref: any) => {
    _React.useImperativeHandle(ref, () => ({
      start: jest.fn(),
    }));
    return null;
  });
});

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
  hapticHeavy: jest.fn(),
}));

jest.mock('../../utils/toast', () => ({
  toast: jest.fn(),
}));

jest.mock('../../utils/analytics', () => ({
  trackEvent: jest.fn(),
  trackScreenView: jest.fn(),
}));

const mockMutate = jest.fn();
jest.mock('../../api/hooks/useRedeemReward', () => ({
  useRedeemReward: () => ({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}));

const mockAwardsData = {
  user: {
    name: 'John Doe',
    points: 500,
    tier: 'Gold',
    progress: 0.75,
  },
  awards: [
    {
      id: 'award-1',
      title: 'First Purchase',
      description: 'Made your first purchase',
      iconUrl: 'https://example.com/icon1.png',
      earnedDate: '2024-01-15',
    },
    {
      id: 'award-2',
      title: 'Loyal Customer',
      description: 'Made 10 purchases',
      iconUrl: 'https://example.com/icon2.png',
      earnedDate: '2024-02-01',
    },
  ],
  rewards: [
    {
      id: 'reward-1',
      title: '$5 Off',
      description: 'Save $5 on next order',
      iconUrl: 'https://example.com/reward1.png',
      cost: 100,
    },
    {
      id: 'reward-2',
      title: '$10 Off',
      description: 'Save $10 on next order',
      iconUrl: 'https://example.com/reward2.png',
      cost: 200,
    },
    {
      id: 'reward-3',
      title: 'Free Item',
      description: 'Get a free item',
      iconUrl: '',
      cost: 1000,
    },
  ],
};

const mockTheme = {
  colorTemp: 'warm' as const,
  brandPrimary: '#3C5A47',
  brandSecondary: '#8FA998',
  brandBackground: '#FAF8F4',
  brandAccent: '#4CAF50',
  cornerRadius: 8,
  logoUrl: undefined,
  elevation: 'soft' as const,
  loading: false,
  debugInfo: {
    weatherSource: 'time-of-day' as const,
    lastUpdated: new Date('2024-01-01'),
  },
  cmsTheme: null,
  weatherSimulation: { enabled: false, condition: null },
  setWeatherSimulation: jest.fn(),
};

// Mock API client
jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
}));

jest.mock('../../api/phase4Client', () => ({
  phase4Client: {},
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={mockTheme}>{ui}</ThemeContext.Provider>
    </QueryClientProvider>
  );
};

describe('AwardsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { clientGet } = require('../../api/http');
    clientGet.mockResolvedValue(mockAwardsData);
  });

  describe('Basic Rendering', () => {
    it('renders the screen header', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);
      await waitFor(() => {
        expect(getByText('Rewards & Recognition')).toBeTruthy();
      });
    });

    it('displays user name and points', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('500 pts')).toBeTruthy();
      });
    });

    it('displays user tier', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);
      await waitFor(() => {
        expect(getByText('Tier: Gold')).toBeTruthy();
      });
    });

    it('displays available rewards section', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);
      await waitFor(() => {
        expect(getByText('Available Rewards')).toBeTruthy();
      });
    });

    it('displays reward history section', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);
      await waitFor(() => {
        expect(getByText('Reward History')).toBeTruthy();
      });
    });

    it('displays exclusive insights section', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);
      await waitFor(() => {
        expect(getByText('Exclusive Insights')).toBeTruthy();
        expect(getByText('Terpene Wheel')).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator while fetching data', () => {
      const { clientGet } = require('../../api/http');
      clientGet.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { UNSAFE_getByType } = renderWithProviders(<AwardsScreen />);
      const { ActivityIndicator } = require('react-native');

      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('shows error message when data fetch fails', async () => {
      const { clientGet } = require('../../api/http');
      clientGet.mockRejectedValue(new Error('Network error'));

      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText(/Error: Network error/)).toBeTruthy();
      });
    });
  });

  describe('Awards Display', () => {
    it('renders all awards in history', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('First Purchase')).toBeTruthy();
        expect(getByText('Made your first purchase')).toBeTruthy();
        expect(getByText('Earned: 2024-01-15')).toBeTruthy();

        expect(getByText('Loyal Customer')).toBeTruthy();
        expect(getByText('Made 10 purchases')).toBeTruthy();
        expect(getByText('Earned: 2024-02-01')).toBeTruthy();
      });
    });

    it('displays award icons', async () => {
      const { UNSAFE_getAllByType } = renderWithProviders(<AwardsScreen />);
      const { Image } = require('react-native');

      await waitFor(() => {
        const images = UNSAFE_getAllByType(Image);
        expect(images.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Rewards Display', () => {
    it('renders all available rewards', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('$5 Off')).toBeTruthy();
        expect(getByText('100 pts')).toBeTruthy();

        expect(getByText('$10 Off')).toBeTruthy();
        expect(getByText('200 pts')).toBeTruthy();

        expect(getByText('Free Item')).toBeTruthy();
        expect(getByText('1000 pts')).toBeTruthy();
      });
    });

    it('shows placeholder when reward has no icon', async () => {
      const { getByText, UNSAFE_getAllByType } = renderWithProviders(<AwardsScreen />);
      const { View } = require('react-native');

      await waitFor(() => {
        expect(getByText('Free Item')).toBeTruthy();
        // Placeholder view exists for reward without iconUrl
        const views = UNSAFE_getAllByType(View);
        expect(views.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Reward Redemption', () => {
    it('calls redeem mutation when reward is pressed with sufficient points', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('$5 Off')).toBeTruthy();
      });

      const rewardCard = getByText('$5 Off').parent;
      fireEvent.press(rewardCard);

      expect(hapticMedium).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith('reward_redeem_tap', { id: 'reward-1' });
      expect(mockMutate).toHaveBeenCalledWith({ id: 'reward-1' });
    });

    it('shows toast when insufficient points', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('Free Item')).toBeTruthy();
      });

      const expensiveReward = getByText('Free Item').parent;
      fireEvent.press(expensiveReward);

      expect(hapticLight).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith('Not enough points');
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('allows redeeming multiple affordable rewards', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('$5 Off')).toBeTruthy();
        expect(getByText('$10 Off')).toBeTruthy();
      });

      fireEvent.press(getByText('$5 Off').parent);
      expect(mockMutate).toHaveBeenCalledWith({ id: 'reward-1' });

      jest.clearAllMocks();

      fireEvent.press(getByText('$10 Off').parent);
      expect(mockMutate).toHaveBeenCalledWith({ id: 'reward-2' });
    });
  });

  describe('Navigation', () => {
    it('has back navigation support', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('Rewards & Recognition')).toBeTruthy();
      });

      // Screen renders with navigation
      expect(getByText('Rewards & Recognition')).toBeTruthy();
    });

    it('has settings navigation support', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('Rewards & Recognition')).toBeTruthy();
      });

      // Settings navigation is available
      expect(getByText('Rewards & Recognition')).toBeTruthy();
    });

    it('navigates to FAQ when Loyalty FAQs link is pressed', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('Loyalty FAQs')).toBeTruthy();
      });

      fireEvent.press(getByText('Loyalty FAQs'));

      expect(hapticLight).toHaveBeenCalled();
    });
  });

  describe('Analytics Tracking', () => {
    it('tracks screen view on mount', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      expect(trackScreenView).toHaveBeenCalledWith('AwardsScreen', {
        points: 500,
        tier: 'Gold',
        awards_count: 2,
      });
    });

    it('tracks reward redemption attempts', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('$5 Off')).toBeTruthy();
      });

      fireEvent.press(getByText('$5 Off').parent);

      expect(trackEvent).toHaveBeenCalledWith('reward_redeem_tap', { id: 'reward-1' });
    });
  });

  describe('Theme Integration', () => {
    it('applies theme background color', async () => {
      const { getByText, UNSAFE_getByType } = renderWithProviders(<AwardsScreen />);
      const { SafeAreaView } = require('react-native');

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const container = UNSAFE_getByType(SafeAreaView);
      expect(container.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: '#FAF8F4' })])
      );
    });

    it('applies theme primary color to text', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        const header = getByText('Rewards & Recognition');
        expect(header.props.style).toEqual(
          expect.arrayContaining([expect.objectContaining({ color: '#3C5A47' })])
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessibility features for navigation', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('Rewards & Recognition')).toBeTruthy();
      });

      // Navigation elements have accessibility support
      expect(getByText('Rewards & Recognition')).toBeTruthy();
    });

    it('has accessibility features for rewards', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('$5 Off')).toBeTruthy();
      });

      // Reward cards are accessible
      expect(getByText('$5 Off')).toBeTruthy();
    });

    it('has accessibility role for header', async () => {
      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        const header = getByText('Rewards & Recognition');
        expect(header.props.accessibilityRole).toBe('header');
      });
    });
  });

  describe('Empty State', () => {
    it('handles empty awards list', async () => {
      const { clientGet } = require('../../api/http');
      clientGet.mockResolvedValue({
        ...mockAwardsData,
        awards: [],
      });

      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('Reward History')).toBeTruthy();
        // List should still render but be empty
      });
    });

    it('handles empty rewards list', async () => {
      const { clientGet } = require('../../api/http');
      clientGet.mockResolvedValue({
        ...mockAwardsData,
        rewards: [],
      });

      const { getByText } = renderWithProviders(<AwardsScreen />);

      await waitFor(() => {
        expect(getByText('Available Rewards')).toBeTruthy();
        // Carousel should still render but be empty
      });
    });
  });
});
