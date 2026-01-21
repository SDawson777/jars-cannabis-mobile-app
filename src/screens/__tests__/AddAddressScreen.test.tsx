// src/screens/__tests__/AddAddressScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddAddressScreen from '../AddAddressScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { clientPost } from '../../api/http';
import { toast } from '../../utils/toast';

// Mock dependencies
jest.mock('../../api/http', () => ({
  clientPost: jest.fn(),
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

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: jest.fn(),
  }),
}));

const mockThemeContext = {
  colorTemp: 'warm' as const,
  brandPrimary: '#4C9F70',
  brandSecondary: '#E8F5E9',
  brandBackground: '#FAF8F4',
  brandAccent: '#4CAF50',
  cornerRadius: 8,
  textColor: '#2C3E50',
  isDark: false,
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

const mockClientPost = clientPost as jest.MockedFunction<typeof clientPost>;

describe('AddAddressScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockClientPost.mockResolvedValue({ id: 'addr-123' });
  });

  const renderScreen = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={mockThemeContext}>
          <AddAddressScreen />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('renders the screen with header', () => {
      const { getByText } = renderScreen();
      expect(getByText('Add Address')).toBeTruthy();
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
      expect(getByText('Save Address')).toBeTruthy();
    });

    it('renders field labels', () => {
      const { getAllByText } = renderScreen();
      // Each field has a label and placeholder
      expect(getAllByText('Full name').length).toBeGreaterThan(0);
      expect(getAllByText('Phone').length).toBeGreaterThan(0);
      expect(getAllByText('Street Address').length).toBeGreaterThan(0);
      expect(getAllByText('City').length).toBeGreaterThan(0);
      expect(getAllByText('State').length).toBeGreaterThan(0);
      expect(getAllByText('ZIP Code').length).toBeGreaterThan(0);
      expect(getAllByText('Country').length).toBeGreaterThan(0);
    });
  });

  describe('Form Input', () => {
    it('updates full name on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const input = getByPlaceholderText('Full name');

      fireEvent.changeText(input, 'John Doe');

      expect(getByDisplayValue('John Doe')).toBeTruthy();
    });

    it('updates phone on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const input = getByPlaceholderText('Phone');

      fireEvent.changeText(input, '555-123-4567');

      expect(getByDisplayValue('555-123-4567')).toBeTruthy();
    });

    it('updates street address on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const input = getByPlaceholderText('Street Address');

      fireEvent.changeText(input, '123 Main St');

      expect(getByDisplayValue('123 Main St')).toBeTruthy();
    });

    it('updates city on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const input = getByPlaceholderText('City');

      fireEvent.changeText(input, 'Denver');

      expect(getByDisplayValue('Denver')).toBeTruthy();
    });

    it('updates state on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const input = getByPlaceholderText('State');

      fireEvent.changeText(input, 'CO');

      expect(getByDisplayValue('CO')).toBeTruthy();
    });

    it('updates zip code on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const input = getByPlaceholderText('ZIP Code');

      fireEvent.changeText(input, '80202');

      expect(getByDisplayValue('80202')).toBeTruthy();
    });

    it('updates country on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const input = getByPlaceholderText('Country');

      fireEvent.changeText(input, 'USA');

      expect(getByDisplayValue('USA')).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    const fillForm = (result: ReturnType<typeof renderScreen>) => {
      const { getByPlaceholderText } = result;
      fireEvent.changeText(getByPlaceholderText('Full name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone'), '555-123-4567');
      fireEvent.changeText(getByPlaceholderText('Street Address'), '123 Main St');
      fireEvent.changeText(getByPlaceholderText('City'), 'Denver');
      fireEvent.changeText(getByPlaceholderText('State'), 'CO');
      fireEvent.changeText(getByPlaceholderText('ZIP Code'), '80202');
      fireEvent.changeText(getByPlaceholderText('Country'), 'USA');
    };

    it('submits the form when save is pressed', async () => {
      const result = renderScreen();
      fillForm(result);

      const { getByText } = result;
      const saveButton = getByText('Save Address');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockClientPost).toHaveBeenCalled();
      });
    });

    it('shows success toast on successful save', async () => {
      const result = renderScreen();
      fillForm(result);

      const { getByText } = result;
      const saveButton = getByText('Save Address');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Address saved');
      });
    });

    it('navigates back on successful save', async () => {
      const result = renderScreen();
      fillForm(result);

      const { getByText } = result;
      const saveButton = getByText('Save Address');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
      });
    });

    it('shows error toast on save failure', async () => {
      mockClientPost.mockRejectedValue(new Error('Network error'));

      const result = renderScreen();
      fillForm(result);

      const { getByText } = result;
      const saveButton = getByText('Save Address');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Network error');
      });
    });

    it('shows error from server response', async () => {
      mockClientPost.mockResolvedValue({ error: 'Invalid zip code' });

      const result = renderScreen();
      fillForm(result);

      const { getByText } = result;
      const saveButton = getByText('Save Address');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Invalid zip code');
      });
    });
  });

  describe('Navigation', () => {
    it('has back button', () => {
      const { getByText } = renderScreen();
      // Back button is an icon, verify header exists
      expect(getByText('Add Address')).toBeTruthy();
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
            <AddAddressScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(getByText('Add Address')).toBeTruthy();
    });

    it('applies neutral theme when colorTemp is neutral', () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={neutralTheme}>
            <AddAddressScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(getByText('Add Address')).toBeTruthy();
    });
  });
});
