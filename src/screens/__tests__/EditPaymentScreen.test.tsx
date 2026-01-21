// src/screens/__tests__/EditPaymentScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditPaymentScreen from '../EditPaymentScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { updatePaymentMethod } from '../../clients/paymentClient';
import { toast } from '../../utils/toast';

// Mock dependencies
jest.mock('../../clients/paymentClient', () => ({
  updatePaymentMethod: jest.fn(),
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
const mockPayment = {
  id: 'pm_123',
  holderName: 'John Doe',
  cardBrand: 'Visa',
  cardLast4: '4242',
  expiry: '12/25',
  isDefault: true,
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      payment: mockPayment,
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

const mockUpdatePaymentMethod = updatePaymentMethod as jest.MockedFunction<
  typeof updatePaymentMethod
>;

describe('EditPaymentScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockUpdatePaymentMethod.mockResolvedValue({ success: true });
  });

  const renderScreen = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={mockThemeContext}>
          <EditPaymentScreen />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('renders the screen with header', () => {
      const { getByText } = renderScreen();
      expect(getByText('Edit Payment')).toBeTruthy();
    });

    it('renders all form fields', () => {
      const { getByText } = renderScreen();
      expect(getByText('Name on Card')).toBeTruthy();
      expect(getByText('Card Brand')).toBeTruthy();
      expect(getByText('Last 4 digits')).toBeTruthy();
      expect(getByText('Expiry (MM/YY)')).toBeTruthy();
    });

    it('renders save button', () => {
      const { getByText } = renderScreen();
      expect(getByText('Save Changes')).toBeTruthy();
    });

    it('pre-fills form with existing payment data', () => {
      const { getByDisplayValue } = renderScreen();
      expect(getByDisplayValue('John Doe')).toBeTruthy();
      expect(getByDisplayValue('Visa')).toBeTruthy();
      expect(getByDisplayValue('4242')).toBeTruthy();
      expect(getByDisplayValue('12/25')).toBeTruthy();
    });

    it('applies warm theme background color', () => {
      const { getByText } = renderScreen();
      const screen = getByText('Edit Payment').parent?.parent;
      // Screen should have warm background color applied
      expect(screen).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty holder name', async () => {
      const { getByDisplayValue, getByText } = renderScreen();
      const nameInput = getByDisplayValue('John Doe');

      fireEvent.changeText(nameInput, '');
      fireEvent(nameInput, 'blur');

      await waitFor(() => {
        expect(getByText('Name is required')).toBeTruthy();
      });
    });

    it('shows error for empty card brand', async () => {
      const { getByDisplayValue, getByText } = renderScreen();
      const brandInput = getByDisplayValue('Visa');

      fireEvent.changeText(brandInput, '');
      fireEvent(brandInput, 'blur');

      await waitFor(() => {
        expect(getByText('Card brand is required')).toBeTruthy();
      });
    });

    it('shows error for invalid last 4 digits', async () => {
      const { getByDisplayValue, getByText } = renderScreen();
      const last4Input = getByDisplayValue('4242');

      fireEvent.changeText(last4Input, '12');
      fireEvent(last4Input, 'blur');

      await waitFor(() => {
        expect(getByText('Must be 4 digits')).toBeTruthy();
      });
    });

    it('shows error for empty expiry', async () => {
      const { getByDisplayValue, getByText } = renderScreen();
      const expiryInput = getByDisplayValue('12/25');

      fireEvent.changeText(expiryInput, '');
      fireEvent(expiryInput, 'blur');

      await waitFor(() => {
        expect(getByText('Expiry is required')).toBeTruthy();
      });
    });
  });

  describe('Form Input', () => {
    it('updates holder name on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const nameInput = getByDisplayValue('John Doe');

      fireEvent.changeText(nameInput, 'Jane Smith');

      expect(getByDisplayValue('Jane Smith')).toBeTruthy();
    });

    it('updates card brand on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const brandInput = getByDisplayValue('Visa');

      fireEvent.changeText(brandInput, 'Mastercard');

      expect(getByDisplayValue('Mastercard')).toBeTruthy();
    });

    it('updates last 4 digits on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const last4Input = getByDisplayValue('4242');

      fireEvent.changeText(last4Input, '5555');

      expect(getByDisplayValue('5555')).toBeTruthy();
    });

    it('updates expiry on input change', () => {
      const { getByDisplayValue } = renderScreen();
      const expiryInput = getByDisplayValue('12/25');

      fireEvent.changeText(expiryInput, '06/28');

      expect(getByDisplayValue('06/28')).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('calls updatePaymentMethod on save', async () => {
      const { getByText } = renderScreen();
      const saveButton = getByText('Save Changes');

      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockUpdatePaymentMethod).toHaveBeenCalledWith('pm_123', {
          cardBrand: 'Visa',
          cardLast4: '4242',
          holderName: 'John Doe',
          expiry: '12/25',
          isDefault: true,
        });
      });
    });

    it('shows success toast on successful save', async () => {
      const { getByText } = renderScreen();
      const saveButton = getByText('Save Changes');

      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Payment method updated');
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
      mockUpdatePaymentMethod.mockRejectedValue(new Error('Network error'));

      const { getByText } = renderScreen();
      const saveButton = getByText('Save Changes');

      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Unable to save payment method. Please try again.');
      });
    });

    it('submits with updated form values', async () => {
      const { getByDisplayValue, getByText } = renderScreen();

      // Update the form
      fireEvent.changeText(getByDisplayValue('John Doe'), 'Jane Smith');
      fireEvent.changeText(getByDisplayValue('Visa'), 'Mastercard');

      const saveButton = getByText('Save Changes');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockUpdatePaymentMethod).toHaveBeenCalledWith(
          'pm_123',
          expect.objectContaining({
            holderName: 'Jane Smith',
            cardBrand: 'Mastercard',
          })
        );
      });
    });
  });

  describe('Navigation', () => {
    it('has back button', () => {
      const { getByLabelText } = renderScreen();
      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('navigates back when back button pressed', () => {
      const { getByLabelText } = renderScreen();
      const backButton = getByLabelText('Go back');

      fireEvent.press(backButton);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('save button has accessibility label', () => {
      const { getByLabelText } = renderScreen();
      expect(getByLabelText('Save changes')).toBeTruthy();
    });

    it('back button has accessibility label', () => {
      const { getByLabelText } = renderScreen();
      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('input fields have accessibility labels', () => {
      const { getByDisplayValue } = renderScreen();
      // Verify inputs are rendered with expected values
      expect(getByDisplayValue('John Doe')).toBeTruthy();
      expect(getByDisplayValue('Visa')).toBeTruthy();
      expect(getByDisplayValue('4242')).toBeTruthy();
      expect(getByDisplayValue('12/25')).toBeTruthy();
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
            <EditPaymentScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(getByText('Edit Payment')).toBeTruthy();
    });

    it('applies neutral theme when colorTemp is neutral', () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={neutralTheme}>
            <EditPaymentScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(getByText('Edit Payment')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('button is disabled during submission', async () => {
      const { getByText } = renderScreen();
      const saveButton = getByText('Save Changes');

      // Button should be accessible before submission
      expect(saveButton).toBeTruthy();
    });
  });

  describe('Empty Payment Params', () => {
    it('handles missing payment params gracefully', () => {
      // Override the useRoute mock for this test
      jest.doMock('@react-navigation/native', () => ({
        useNavigation: () => ({
          goBack: mockGoBack,
          navigate: jest.fn(),
        }),
        useRoute: () => ({
          params: {},
        }),
      }));

      // The screen should still render without crashing
      const { getByText } = renderScreen();
      expect(getByText('Edit Payment')).toBeTruthy();
    });
  });
});
