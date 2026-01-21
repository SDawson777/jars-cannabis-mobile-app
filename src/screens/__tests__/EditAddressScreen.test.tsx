// src/screens/__tests__/EditAddressScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditAddressScreen from '../EditAddressScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { clientPut } from '../../api/http';
import { toast } from '../../utils/toast';

// Mock dependencies
jest.mock('../../api/http', () => ({
  clientPut: jest.fn(),
}));

jest.mock('../../api/phase4Client', () => ({
  phase4Client: {},
}));

jest.mock('../../utils/toast', () => ({
  toast: jest.fn(),
}));

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
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

const mockGoBack = jest.fn();
const mockAddress = {
  id: 'addr-123',
  fullName: 'John Doe',
  phone: '555-123-4567',
  line1: '123 Main St',
  city: 'Denver',
  state: 'CO',
  zipCode: '80202',
  country: 'US',
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      address: mockAddress,
    },
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

const mockClientPut = clientPut as jest.MockedFunction<typeof clientPut>;

describe('EditAddressScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockClientPut.mockResolvedValue({ id: 'addr-123' });
  });

  const renderScreen = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={mockThemeContext}>
          <EditAddressScreen />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('renders the screen with header', () => {
      const { getByText } = renderScreen();
      expect(getByText('Edit Address')).toBeTruthy();
    });

    it('renders all form fields', () => {
      const { getByPlaceholderText } = renderScreen();
      expect(getByPlaceholderText('Full name')).toBeTruthy();
      expect(getByPlaceholderText('Phone')).toBeTruthy();
      expect(getByPlaceholderText('Street Address')).toBeTruthy();
      expect(getByPlaceholderText('City')).toBeTruthy();
      expect(getByPlaceholderText('State')).toBeTruthy();
      expect(getByPlaceholderText('ZIP Code')).toBeTruthy();
      expect(getByPlaceholderText('Country')).toBeTruthy();
    });

    it('renders save button', () => {
      const { getByText } = renderScreen();
      expect(getByText('Save Changes')).toBeTruthy();
    });

    it('pre-fills form with existing address data', () => {
      const { getByDisplayValue } = renderScreen();
      expect(getByDisplayValue('John Doe')).toBeTruthy();
      expect(getByDisplayValue('555-123-4567')).toBeTruthy();
      expect(getByDisplayValue('123 Main St')).toBeTruthy();
      expect(getByDisplayValue('Denver')).toBeTruthy();
      expect(getByDisplayValue('CO')).toBeTruthy();
      expect(getByDisplayValue('80202')).toBeTruthy();
      expect(getByDisplayValue('US')).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('updates full name on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const input = getByDisplayValue('John Doe');

      fireEvent.changeText(input, 'Jane Smith');

      expect(getByDisplayValue('Jane Smith')).toBeTruthy();
    });

    it('updates phone on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const input = getByDisplayValue('555-123-4567');

      fireEvent.changeText(input, '555-987-6543');

      expect(getByDisplayValue('555-987-6543')).toBeTruthy();
    });

    it('updates street address on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const input = getByDisplayValue('123 Main St');

      fireEvent.changeText(input, '456 Oak Ave');

      expect(getByDisplayValue('456 Oak Ave')).toBeTruthy();
    });

    it('updates city on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const input = getByDisplayValue('Denver');

      fireEvent.changeText(input, 'Boulder');

      expect(getByDisplayValue('Boulder')).toBeTruthy();
    });

    it('updates state on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const input = getByDisplayValue('CO');

      fireEvent.changeText(input, 'CA');

      expect(getByDisplayValue('CA')).toBeTruthy();
    });

    it('updates zip code on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const input = getByDisplayValue('80202');

      fireEvent.changeText(input, '90210');

      expect(getByDisplayValue('90210')).toBeTruthy();
    });

    it('updates country on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const input = getByDisplayValue('US');

      fireEvent.changeText(input, 'Canada');

      expect(getByDisplayValue('Canada')).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('submits the form when save is pressed', async () => {
      const { getByText } = renderScreen();
      const saveButton = getByText('Save Changes');

      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockClientPut).toHaveBeenCalled();
      });
    });

    it('shows success toast on successful save', async () => {
      const { getByText } = renderScreen();
      const saveButton = getByText('Save Changes');

      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Address saved');
      });
    });

    it('navigates back on successful save', async () => {
      const { getByText } = renderScreen();
      const saveButton = getByText('Save Changes');

      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
      });
    });

    it('shows error toast on save failure', async () => {
      mockClientPut.mockRejectedValue(new Error('Network error'));

      const { getByText } = renderScreen();
      const saveButton = getByText('Save Changes');

      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Network error');
      });
    });

    it('shows error from server response', async () => {
      mockClientPut.mockResolvedValue({ error: 'Invalid zip code' });

      const { getByText } = renderScreen();
      const saveButton = getByText('Save Changes');

      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Invalid zip code');
      });
    });

    it('submits with updated values', async () => {
      const { getByDisplayValue, getByText } = renderScreen();

      // Update some fields
      fireEvent.changeText(getByDisplayValue('John Doe'), 'Jane Smith');
      fireEvent.changeText(getByDisplayValue('Denver'), 'Boulder');

      const saveButton = getByText('Save Changes');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockClientPut).toHaveBeenCalledWith(
          expect.anything(),
          '/addresses/addr-123',
          expect.objectContaining({
            fullName: 'Jane Smith',
            city: 'Boulder',
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('form fields have accessibility labels', () => {
      const { getByLabelText } = renderScreen();
      expect(getByLabelText('Full name')).toBeTruthy();
      expect(getByLabelText('Phone')).toBeTruthy();
      expect(getByLabelText('Street Address')).toBeTruthy();
      expect(getByLabelText('City')).toBeTruthy();
      expect(getByLabelText('State')).toBeTruthy();
      expect(getByLabelText('ZIP Code')).toBeTruthy();
      expect(getByLabelText('Country')).toBeTruthy();
    });

    it('save button has accessibility label', () => {
      const { getByLabelText } = renderScreen();
      expect(getByLabelText('Save address')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('applies cool theme when colorTemp is cool', () => {
      const coolTheme = {
        ...mockThemeContext,
        colorTemp: 'cool' as const,
      };

      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={coolTheme}>
            <EditAddressScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(getByText('Edit Address')).toBeTruthy();
    });

    it('applies neutral theme when colorTemp is neutral', () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={neutralTheme}>
            <EditAddressScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(getByText('Edit Address')).toBeTruthy();
    });
  });
});
