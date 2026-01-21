// src/screens/__tests__/AddPaymentScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddPaymentScreen from '../AddPaymentScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { addPaymentMethod } from '../../clients/paymentClient';
import { toast } from '../../utils/toast';

// Mock dependencies
jest.mock('../../clients/paymentClient', () => ({
  addPaymentMethod: jest.fn(),
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
  textColor: '#2C3E50',
  isDark: false,
};

const mockAddPaymentMethod = addPaymentMethod as jest.MockedFunction<typeof addPaymentMethod>;

describe('AddPaymentScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockAddPaymentMethod.mockResolvedValue({ success: true });
  });

  const renderScreen = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={mockThemeContext}>
          <AddPaymentScreen />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('renders the screen with header', () => {
      const { getByText } = renderScreen();
      expect(getByText('Add Payment')).toBeTruthy();
    });

    it('renders all form fields', () => {
      const { getByText } = renderScreen();
      expect(getByText('Name on Card')).toBeTruthy();
      expect(getByText('Card Brand')).toBeTruthy();
      expect(getByText('Last 4 digits')).toBeTruthy();
      expect(getByText('Expiry (MM/YY)')).toBeTruthy();
      expect(getByText('Make default')).toBeTruthy();
    });

    it('renders add button', () => {
      const { getByText } = renderScreen();
      expect(getByText('Save Payment')).toBeTruthy();
    });

    it('starts with empty form fields', () => {
      const { getByPlaceholderText } = renderScreen();
      expect(getByPlaceholderText('Name on Card')).toBeTruthy();
      expect(getByPlaceholderText('Card Brand')).toBeTruthy();
      expect(getByPlaceholderText('Last 4 digits')).toBeTruthy();
      expect(getByPlaceholderText('Expiry (MM/YY)')).toBeTruthy();
    });

    it('has default toggle button', () => {
      const { getByText } = renderScreen();
      expect(getByText('No')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty holder name', async () => {
      const { getByPlaceholderText, getByText } = renderScreen();
      const nameInput = getByPlaceholderText('Name on Card');

      fireEvent.changeText(nameInput, 'test');
      fireEvent.changeText(nameInput, '');
      fireEvent(nameInput, 'blur');

      await waitFor(() => {
        expect(getByText('Name is required')).toBeTruthy();
      });
    });

    it('shows error for empty card brand', async () => {
      const { getByPlaceholderText, getByText } = renderScreen();
      const brandInput = getByPlaceholderText('Card Brand');

      fireEvent.changeText(brandInput, 'test');
      fireEvent.changeText(brandInput, '');
      fireEvent(brandInput, 'blur');

      await waitFor(() => {
        expect(getByText('Card brand is required')).toBeTruthy();
      });
    });

    it('shows error for invalid last 4 digits', async () => {
      const { getByPlaceholderText, getByText } = renderScreen();
      const last4Input = getByPlaceholderText('Last 4 digits');

      fireEvent.changeText(last4Input, '12');
      fireEvent(last4Input, 'blur');

      await waitFor(() => {
        expect(getByText('Must be 4 digits')).toBeTruthy();
      });
    });

    it('shows error for empty expiry', async () => {
      const { getByPlaceholderText, getByText } = renderScreen();
      const expiryInput = getByPlaceholderText('Expiry (MM/YY)');

      fireEvent.changeText(expiryInput, 'test');
      fireEvent.changeText(expiryInput, '');
      fireEvent(expiryInput, 'blur');

      await waitFor(() => {
        expect(getByText('Expiry is required')).toBeTruthy();
      });
    });
  });

  describe('Form Input', () => {
    it('updates holder name on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const nameInput = getByPlaceholderText('Name on Card');

      fireEvent.changeText(nameInput, 'John Doe');

      expect(getByDisplayValue('John Doe')).toBeTruthy();
    });

    it('updates card brand on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const brandInput = getByPlaceholderText('Card Brand');

      fireEvent.changeText(brandInput, 'Visa');

      expect(getByDisplayValue('Visa')).toBeTruthy();
    });

    it('updates last 4 digits on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const last4Input = getByPlaceholderText('Last 4 digits');

      fireEvent.changeText(last4Input, '4242');

      expect(getByDisplayValue('4242')).toBeTruthy();
    });

    it('updates expiry on input change', () => {
      const { getByPlaceholderText, getByDisplayValue } = renderScreen();
      const expiryInput = getByPlaceholderText('Expiry (MM/YY)');

      fireEvent.changeText(expiryInput, '12/25');

      expect(getByDisplayValue('12/25')).toBeTruthy();
    });

    it('toggles default setting', () => {
      const { getByText } = renderScreen();
      const defaultToggle = getByText('No');

      fireEvent.press(defaultToggle);

      expect(getByText('Yes (Default)')).toBeTruthy();
    });

    it('toggles default setting back to no', () => {
      const { getByText } = renderScreen();
      const defaultToggle = getByText('No');

      fireEvent.press(defaultToggle);
      expect(getByText('Yes (Default)')).toBeTruthy();

      const yesToggle = getByText('Yes (Default)');
      fireEvent.press(yesToggle);

      expect(getByText('No')).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    const fillForm = (result: ReturnType<typeof renderScreen>) => {
      const { getByPlaceholderText } = result;
      fireEvent.changeText(getByPlaceholderText('Name on Card'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Card Brand'), 'Visa');
      fireEvent.changeText(getByPlaceholderText('Last 4 digits'), '4242');
      fireEvent.changeText(getByPlaceholderText('Expiry (MM/YY)'), '12/25');
    };

    it('calls addPaymentMethod on submit', async () => {
      const result = renderScreen();
      fillForm(result);

      const { getByText } = result;
      const submitButton = getByText('Save Payment');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAddPaymentMethod).toHaveBeenCalledWith({
          cardBrand: 'Visa',
          cardLast4: '4242',
          holderName: 'John Doe',
          expiry: '12/25',
          isDefault: false,
        });
      });
    });

    it('shows success toast on successful add', async () => {
      const result = renderScreen();
      fillForm(result);

      const { getByText } = result;
      const submitButton = getByText('Save Payment');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Payment method added');
      });
    });

    it('navigates back on successful add', async () => {
      const result = renderScreen();
      fillForm(result);

      const { getByText } = result;
      const submitButton = getByText('Save Payment');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
      });
    });

    it('shows error toast on add failure', async () => {
      mockAddPaymentMethod.mockRejectedValue(new Error('Network error'));

      const result = renderScreen();
      fillForm(result);

      const { getByText } = result;
      const submitButton = getByText('Save Payment');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith('Unable to save payment method. Please try again.');
      });
    });

    it('submits with isDefault true when toggled', async () => {
      const result = renderScreen();
      fillForm(result);

      const { getByText } = result;
      const defaultToggle = getByText('No');
      fireEvent.press(defaultToggle);

      const submitButton = getByText('Save Payment');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAddPaymentMethod).toHaveBeenCalledWith(
          expect.objectContaining({
            isDefault: true,
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
    it('has back button with accessibility label', () => {
      const { getByLabelText } = renderScreen();
      expect(getByLabelText('Go back')).toBeTruthy();
    });

    it('form fields have placeholder text', () => {
      const { getByPlaceholderText } = renderScreen();
      expect(getByPlaceholderText('Name on Card')).toBeTruthy();
      expect(getByPlaceholderText('Card Brand')).toBeTruthy();
      expect(getByPlaceholderText('Last 4 digits')).toBeTruthy();
      expect(getByPlaceholderText('Expiry (MM/YY)')).toBeTruthy();
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
            <AddPaymentScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(getByText('Add Payment')).toBeTruthy();
    });

    it('applies neutral theme when colorTemp is neutral', () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={neutralTheme}>
            <AddPaymentScreen />
          </ThemeContext.Provider>
        </QueryClientProvider>
      );

      expect(getByText('Add Payment')).toBeTruthy();
    });
  });
});
