// src/screens/__tests__/SavedAddressesScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SavedAddressesScreen from '../SavedAddressesScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { getAddresses } from '../../api/phase4Client';

// Mock dependencies
jest.mock('../../api/phase4Client', () => ({
  getAddresses: jest.fn(),
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

const mockAddresses = [
  {
    id: 'addr-1',
    fullName: 'John Doe',
    phone: '555-123-4567',
    line1: '123 Main St',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    country: 'US',
    isDefault: true,
  },
  {
    id: 'addr-2',
    fullName: 'Jane Smith',
    phone: '555-987-6543',
    line1: '456 Oak Ave',
    city: 'Boulder',
    state: 'CO',
    zipCode: '80301',
    country: 'US',
    isDefault: false,
  },
];

const mockGetAddresses = getAddresses as jest.MockedFunction<typeof getAddresses>;

describe('SavedAddressesScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockGetAddresses.mockResolvedValue(mockAddresses);
  });

  const renderScreen = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={mockThemeContext}>
          <SavedAddressesScreen />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('renders address list after loading', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });
    });

    it('renders multiple addresses', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
      });
    });

    it('renders address details', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('123 Main St, Denver')).toBeTruthy();
        expect(getByText('456 Oak Ave, Boulder')).toBeTruthy();
      });
    });

    it('shows default badge for default address', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Default')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to EditAddress when address is pressed', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      fireEvent.press(getByText('John Doe'));

      expect(mockNavigate).toHaveBeenCalledWith('EditAddress', {
        address: mockAddresses[0],
      });
    });

    it('navigates to edit second address when pressed', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Jane Smith')).toBeTruthy();
      });

      fireEvent.press(getByText('Jane Smith'));

      expect(mockNavigate).toHaveBeenCalledWith('EditAddress', {
        address: mockAddresses[1],
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
            <SavedAddressesScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
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
            <SavedAddressesScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });
    });
  });
});
