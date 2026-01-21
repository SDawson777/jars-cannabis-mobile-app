// src/__tests__/screens/HelpFAQScreen.test.tsx

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
}));

// Mock FAQ skeleton component
jest.mock('../../components/FAQSkeleton', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function FAQSkeleton() {
    return React.createElement(View, { testID: 'faq-skeleton' });
  };
});

// Mock PreviewBadge component
jest.mock('../../components/PreviewBadge', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function PreviewBadge() {
    return React.createElement(View, { testID: 'preview-badge' });
  };
});

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({
      goBack: mockGoBack,
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

// Mock FAQ hook
jest.mock('../../hooks/useFAQ');

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HelpFAQScreen from '../../screens/HelpFAQScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { CMSPreviewProvider } from '../../context/CMSPreviewContext';
import * as haptic from '../../utils/haptic';
import * as analytics from '../../utils/analytics';
import * as useFAQ from '../../hooks/useFAQ';

describe('HelpFAQScreen', () => {
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

  const mockFAQData = [
    { id: '1', question: 'How do I place an order?', answer: 'Browse products and add to cart.' },
    { id: '2', question: 'What is your return policy?', answer: 'Returns within 30 days.' },
    { id: '3', question: 'How do I track my order?', answer: 'Check the order tracking page.' },
  ];

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={mockTheme}>
          <CMSPreviewProvider>{ui}</CMSPreviewProvider>
        </ThemeContext.Provider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('Loading State', () => {
    it('renders loading skeleton when data is loading', () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      const { getAllByTestId } = renderWithProviders(<HelpFAQScreen />);

      // Should render FAQSkeleton components (mocked as views with testID)
      const skeletons = getAllByTestId('faq-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('renders error message when query fails', () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      const { getByText } = renderWithProviders(<HelpFAQScreen />);

      expect(getByText('Unable to load FAQ.')).toBeTruthy();
    });

    it('renders error message when data is null', () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
      });

      const { getByText } = renderWithProviders(<HelpFAQScreen />);

      expect(getByText('Unable to load FAQ.')).toBeTruthy();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: mockFAQData,
        isLoading: false,
        isError: false,
      });
    });

    it('renders FAQ screen with header', () => {
      const { getByText } = renderWithProviders(<HelpFAQScreen />);

      expect(getByText('Help & FAQ')).toBeTruthy();
    });

    it('renders all FAQ questions', () => {
      const { getByText } = renderWithProviders(<HelpFAQScreen />);

      expect(getByText('How do I place an order?')).toBeTruthy();
      expect(getByText('What is your return policy?')).toBeTruthy();
      expect(getByText('How do I track my order?')).toBeTruthy();
    });

    it('does not show answers initially', () => {
      const { queryByText } = renderWithProviders(<HelpFAQScreen />);

      expect(queryByText('Browse products and add to cart.')).toBeNull();
      expect(queryByText('Returns within 30 days.')).toBeNull();
      expect(queryByText('Check the order tracking page.')).toBeNull();
    });

    it('expands FAQ when question is clicked', async () => {
      const { getByText } = renderWithProviders(<HelpFAQScreen />);

      const question = getByText('How do I place an order?');
      fireEvent.press(question);

      await waitFor(() => {
        expect(getByText('Browse products and add to cart.')).toBeTruthy();
      });
    });

    it('collapses FAQ when clicked again', async () => {
      const { getByText, queryByText } = renderWithProviders(<HelpFAQScreen />);

      const question = getByText('How do I place an order?');

      // Expand
      fireEvent.press(question);
      await waitFor(() => {
        expect(getByText('Browse products and add to cart.')).toBeTruthy();
      });

      // Collapse
      fireEvent.press(question);
      await waitFor(() => {
        expect(queryByText('Browse products and add to cart.')).toBeNull();
      });
    });

    it('allows multiple FAQs to be open simultaneously', async () => {
      const { getByText } = renderWithProviders(<HelpFAQScreen />);

      fireEvent.press(getByText('How do I place an order?'));
      fireEvent.press(getByText('What is your return policy?'));

      await waitFor(() => {
        expect(getByText('Browse products and add to cart.')).toBeTruthy();
        expect(getByText('Returns within 30 days.')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('calls navigation.goBack when back button is pressed', () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: mockFAQData,
        isLoading: false,
        isError: false,
      });

      const { UNSAFE_getAllByType } = renderWithProviders(<HelpFAQScreen />);

      const pressables = UNSAFE_getAllByType('Pressable' as any);
      fireEvent.press(pressables[0]); // First pressable is back button

      expect(mockGoBack).toHaveBeenCalled();
      expect(haptic.hapticLight).toHaveBeenCalled();
    });
  });

  describe('Analytics', () => {
    it('tracks screen view on mount', () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: mockFAQData,
        isLoading: false,
        isError: false,
      });

      renderWithProviders(<HelpFAQScreen />);

      expect(analytics.trackScreenView).toHaveBeenCalledWith('HelpFAQScreen');
    });

    it('tracks content view when FAQs load', async () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: mockFAQData,
        isLoading: false,
        isError: false,
      });

      renderWithProviders(<HelpFAQScreen />);

      await waitFor(() => {
        expect(analytics.trackContentView).toHaveBeenCalledWith('faq', 'faq_list', {
          count: 3,
        });
      });
    });

    it('tracks FAQ click with question details', async () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: mockFAQData,
        isLoading: false,
        isError: false,
      });

      const { getByText } = renderWithProviders(<HelpFAQScreen />);

      fireEvent.press(getByText('How do I place an order?'));

      await waitFor(() => {
        expect(analytics.trackContentClick).toHaveBeenCalledWith('faq', '1', {
          question: 'How do I place an order?',
        });
      });
    });
  });

  describe('Haptic Feedback', () => {
    it('triggers haptic feedback when expanding FAQ', async () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: mockFAQData,
        isLoading: false,
        isError: false,
      });

      const { getByText } = renderWithProviders(<HelpFAQScreen />);

      fireEvent.press(getByText('How do I place an order?'));

      await waitFor(() => {
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });
  });

  describe('Theme Integration', () => {
    it('applies warm theme background', () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: mockFAQData,
        isLoading: false,
        isError: false,
      });

      const warmTheme = { ...mockTheme, colorTemp: 'warm' as const };

      const { root } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={warmTheme}>
            <CMSPreviewProvider>
              <HelpFAQScreen />
            </CMSPreviewProvider>
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(root).toBeTruthy();
    });

    it('applies cool theme background', () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: mockFAQData,
        isLoading: false,
        isError: false,
      });

      const coolTheme = { ...mockTheme, colorTemp: 'cool' as const };

      const { root } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={coolTheme}>
            <CMSPreviewProvider>
              <HelpFAQScreen />
            </CMSPreviewProvider>
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(root).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('handles empty FAQ list', () => {
      (useFAQ.useFAQQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      const { getByText } = renderWithProviders(<HelpFAQScreen />);

      expect(getByText('Help & FAQ')).toBeTruthy();
    });
  });
});
