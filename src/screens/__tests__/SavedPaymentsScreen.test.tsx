// src/screens/__tests__/SavedPaymentsScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SavedPaymentsScreen from '../SavedPaymentsScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { getPaymentMethods } from '../../clients/paymentClient';

// Mock dependencies
jest.mock('../../clients/paymentClient', () => ({
  getPaymentMethods: jest.fn(),
}));

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  Plus: () => null,
  ChevronRight: () => null,
}));

jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    LayoutAnimation: {
      configureNext: jest.fn(),
      Presets: { easeInEaseOut: {} },
    },
    UIManager: {
      setLayoutAnimationEnabledExperimental: jest.fn(),
    },
  };
});

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: mockNavigate,
  }),
}));

const mockThemeContext = {
  colorTemp: 'warm' as const,
  brandPrimary: '#4C9F70',
  brandSecondary: '#E8F5E9',
  brandBackground: '#FAF8F4',
  textColor: '#2C3E50',
  isDark: false,
};

const mockPaymentMethods = [
  {
    id: 'pm-1',
    cardBrand: 'Visa',
    cardLast4: '4242',
    holderName: 'John Doe',
    expiry: '12/25',
    isDefault: true,
  },
  {
    id: 'pm-2',
    cardBrand: 'Mastercard',
    cardLast4: '5678',
    holderName: 'John Doe',
    expiry: '06/26',
    isDefault: false,
  },
];

const mockGetPaymentMethods = getPaymentMethods as jest.MockedFunction<typeof getPaymentMethods>;

describe('SavedPaymentsScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockGetPaymentMethods.mockResolvedValue(mockPaymentMethods);
  });

  const renderScreen = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={mockThemeContext}>
          <SavedPaymentsScreen />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('renders payment methods list after loading', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Visa ****4242 (Default)')).toBeTruthy();
      });
    });

    it('renders multiple payment methods', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Visa ****4242 (Default)')).toBeTruthy();
        expect(getByText('Mastercard ****5678')).toBeTruthy();
      });
    });

    it('shows default indicator for default payment method', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Visa ****4242 (Default)')).toBeTruthy();
      });
    });

    it('does not show default indicator for non-default payment method', async () => {
      const { getByText, queryByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Mastercard ****5678')).toBeTruthy();
        expect(queryByText('Mastercard ****5678 (Default)')).toBeNull();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to EditPayment when payment is pressed', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Visa ****4242 (Default)')).toBeTruthy();
      });

      fireEvent.press(getByText('Visa ****4242 (Default)'));

      expect(mockNavigate).toHaveBeenCalledWith('EditPayment', {
        payment: mockPaymentMethods[0],
      });
    });

    it('navigates to edit second payment when pressed', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Mastercard ****5678')).toBeTruthy();
      });

      fireEvent.press(getByText('Mastercard ****5678'));

      expect(mockNavigate).toHaveBeenCalledWith('EditPayment', {
        payment: mockPaymentMethods[1],
      });
    });
  });

  describe('Card Display Format', () => {
    it('displays card brand and last 4 digits', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Visa ****4242 (Default)')).toBeTruthy();
      });
    });

    it('displays holder name when no card brand', async () => {
      mockGetPaymentMethods.mockResolvedValue([
        {
          id: 'pm-3',
          holderName: 'Jane Smith',
          isDefault: false,
        },
      ]);

      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Jane Smith')).toBeTruthy();
      });
    });
  });

  describe('Theme Integration', () => {
    it('applies cool theme when colorTemp is cool', async () => {
      const coolTheme = {
        ...mockThemeContext,
        colorTemp: 'cool' as const,
      };

      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={coolTheme}>
            <SavedPaymentsScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(getByText('Visa ****4242 (Default)')).toBeTruthy();
      });
    });

    it('applies neutral theme when colorTemp is neutral', async () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={neutralTheme}>
            <SavedPaymentsScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(getByText('Visa ****4242 (Default)')).toBeTruthy();
      });
    });
  });
});
