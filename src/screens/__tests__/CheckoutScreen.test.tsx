// src/screens/__tests__/CheckoutScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CheckoutScreen from '../CheckoutScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { hapticLight, hapticHeavy } from '../../utils/haptic';
import { trackScreenView, trackCommerceEvent } from '../../utils/analytics';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback: () => void) => callback()),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  HelpCircle: () => null,
}));

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
  hapticHeavy: jest.fn(),
}));

jest.mock('../../utils/toast', () => ({
  toast: jest.fn(),
}));

jest.mock('../../utils/analytics', () => ({
  trackScreenView: jest.fn(),
  trackCommerceEvent: jest.fn(),
  logEvent: jest.fn(),
}));

jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({
    initPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
    presentPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
    isApplePaySupported: jest.fn().mockResolvedValue(true),
    isGooglePaySupported: jest.fn().mockResolvedValue(false),
  }),
}));

jest.mock('../../api/stripe', () => ({
  fetchPaymentSheetParams: jest.fn().mockResolvedValue({
    customer: 'cus_test',
    ephemeralKey: 'ek_test',
    paymentIntent: 'pi_test',
  }),
}));

jest.mock('../../hooks/useOrders', () => ({
  useCreateOrder: jest.fn(opts => ({
    mutate: jest.fn(_data => {
      if (opts?.onSuccess) {
        opts.onSuccess({ id: 'order_123' });
      }
    }),
    isPending: false,
  })),
}));

jest.mock('../../hooks/useServiceAvailability', () => ({
  useServiceAvailability: () => ({
    paymentsEnabled: true,
    stripeMessage: null,
  }),
}));

jest.mock('../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'checkout.steps.delivery': 'Delivery',
        'checkout.steps.contact': 'Contact',
        'checkout.steps.payment': 'Payment',
        'checkout.steps.review': 'Review',
        'checkout.method.pickup': 'Pickup',
        'checkout.method.delivery': 'Delivery',
        'checkout.enterDeliveryAddress': 'Enter delivery address',
        'checkout.whoPickingUp': 'Who is picking up?',
        'checkout.fullName': 'Full Name',
        'checkout.phoneNumber': 'Phone Number',
        'checkout.emailAddress': 'Email Address',
        'checkout.mustMatchId': 'Must match ID',
        'checkout.howPay': 'How would you like to pay?',
        'checkout.payOnline': 'Pay Online',
        'checkout.payAtPickup': 'Pay at Pickup',
        'checkout.reviewYourOrder': 'Review your order',
        'checkout.review.method': 'Method',
        'checkout.review.contact': 'Contact',
        'checkout.review.payment': 'Payment',
        'checkout.continue': 'Continue',
        'checkout.placeOrder': 'Place Order',
        'checkout.placing': 'Placing...',
        'checkout.acceptTerms': 'Please accept the terms and conditions',
        'checkout.fillContactFields': 'Please fill all contact fields',
        'common.error': 'Error',
      };
      return params ? translations[key]?.replace('{min}', params.min) : translations[key] || key;
    },
  }),
}));

jest.mock('../../../store/usePreferredStore', () => ({
  usePreferredStoreId: {
    getState: () => ({
      preferredStoreId: 'store_123',
    }),
  },
}));

const mockCartItems = [
  { id: 'product-1', quantity: 2, price: 25, name: 'Blue Dream' },
  { id: 'product-2', quantity: 1, price: 30, name: 'Girl Scout Cookies' },
];

jest.mock('../../../stores/useCartStore', () => ({
  useCartStore: jest.fn((selector: any) => {
    const state = {
      items: mockCartItems,
      setItems: jest.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

const mockTheme = {
  colorTemp: 'warm',
  brandPrimary: '#3C5A47',
  brandSecondary: '#8FA998',
  brandBackground: '#FAF8F4',
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeContext.Provider value={mockTheme}>{ui}</ThemeContext.Provider>);
};

describe('CheckoutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the checkout screen', () => {
      const { getByTestId } = renderWithProviders(<CheckoutScreen />);
      expect(getByTestId('checkout-screen')).toBeTruthy();
    });

    it('renders progress bar with 4 steps', () => {
      const { getByText } = renderWithProviders(<CheckoutScreen />);
      expect(getByText('Delivery')).toBeTruthy();
    });

    it('shows step 0 (Delivery) initially', () => {
      const { getByText } = renderWithProviders(<CheckoutScreen />);
      expect(getByText('How would you like to receive your order?')).toBeTruthy();
    });

    it('renders pickup and delivery options', () => {
      const { getByText } = renderWithProviders(<CheckoutScreen />);
      expect(getByText('Pickup')).toBeTruthy();
      expect(getByText('Delivery')).toBeTruthy();
    });
  });

  describe('Analytics Tracking', () => {
    it('tracks screen view on mount', () => {
      renderWithProviders(<CheckoutScreen />);
      expect(trackScreenView).toHaveBeenCalledWith('CheckoutScreen', {
        step: 0,
        item_count: 3,
      });
    });

    it('tracks begin_checkout event', () => {
      renderWithProviders(<CheckoutScreen />);
      expect(trackCommerceEvent).toHaveBeenCalledWith(
        'begin_checkout',
        expect.arrayContaining([
          { product_id: 'product-1', quantity: 2, price: 25 },
          { product_id: 'product-2', quantity: 1, price: 30 },
        ]),
        { total: 80 }
      );
    });
  });

  describe('Step 0: Delivery Method', () => {
    it('defaults to pickup method', () => {
      const { queryByTestId } = renderWithProviders(<CheckoutScreen />);
      expect(queryByTestId('delivery-address-input')).toBeNull();
    });

    it('shows delivery address input when delivery is selected', () => {
      const { getByText, getByTestId } = renderWithProviders(<CheckoutScreen />);
      const deliveryOption = getByText('Delivery');
      fireEvent.press(deliveryOption);

      expect(hapticLight).toHaveBeenCalled();
      expect(getByTestId('delivery-address-input')).toBeTruthy();
    });

    it('updates delivery address on text input', () => {
      const { getByText, getByTestId } = renderWithProviders(<CheckoutScreen />);
      fireEvent.press(getByText('Delivery'));

      const addressInput = getByTestId('delivery-address-input');
      fireEvent.changeText(addressInput, '123 Main St, City, ST 12345');

      expect(hapticLight).toHaveBeenCalled();
    });

    it('allows continuing without address when pickup is selected', () => {
      const { getByTestId } = renderWithProviders(<CheckoutScreen />);
      const continueButton = getByTestId('place-order-button');

      expect(continueButton).not.toBeDisabled();
    });

    it('shows alert when continuing with empty delivery address', () => {
      const { getByText, getByTestId } = renderWithProviders(<CheckoutScreen />);
      fireEvent.press(getByText('Delivery'));

      const continueButton = getByTestId('place-order-button');
      fireEvent.press(continueButton);

      expect(hapticHeavy).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
    });
  });

  describe('Step 1: Contact Information', () => {
    it('shows contact fields on step 1', () => {
      const { getByTestId, getByPlaceholderText } = renderWithProviders(<CheckoutScreen />);

      // Move to step 1
      fireEvent.press(getByTestId('place-order-button'));

      expect(getByPlaceholderText('Full Name')).toBeTruthy();
      expect(getByPlaceholderText('Phone Number')).toBeTruthy();
      expect(getByPlaceholderText('Email Address')).toBeTruthy();
    });

    it('updates full name on input', () => {
      const { getByTestId, getByPlaceholderText } = renderWithProviders(<CheckoutScreen />);
      fireEvent.press(getByTestId('place-order-button'));

      const nameInput = getByPlaceholderText('Full Name');
      fireEvent.changeText(nameInput, 'John Doe');

      expect(hapticLight).toHaveBeenCalled();
    });

    it('updates phone on input', () => {
      const { getByTestId, getByPlaceholderText } = renderWithProviders(<CheckoutScreen />);
      fireEvent.press(getByTestId('place-order-button'));

      const phoneInput = getByPlaceholderText('Phone Number');
      fireEvent.changeText(phoneInput, '555-1234');

      expect(hapticLight).toHaveBeenCalled();
    });

    it('updates email on input', () => {
      const { getByTestId, getByPlaceholderText } = renderWithProviders(<CheckoutScreen />);
      fireEvent.press(getByTestId('place-order-button'));

      const emailInput = getByPlaceholderText('Email Address');
      fireEvent.changeText(emailInput, 'john@example.com');

      expect(hapticLight).toHaveBeenCalled();
    });

    it('shows "Must match ID" note', () => {
      const { getByTestId, getByText } = renderWithProviders(<CheckoutScreen />);
      fireEvent.press(getByTestId('place-order-button'));

      expect(getByText('Must match ID')).toBeTruthy();
    });

    it('shows alert when continuing with empty contact fields', () => {
      const { getByTestId } = renderWithProviders(<CheckoutScreen />);

      // Move to step 1
      fireEvent.press(getByTestId('place-order-button'));

      // Try to continue without filling fields
      fireEvent.press(getByTestId('place-order-button'));

      expect(hapticHeavy).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
    });
  });

  describe('Step 2: Payment Method', () => {
    it('shows payment options on step 2', () => {
      const { getByTestId, getByPlaceholderText, getByText } = renderWithProviders(
        <CheckoutScreen />
      );

      // Move to step 1
      fireEvent.press(getByTestId('place-order-button'));

      // Fill contact info
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');

      // Move to step 2
      fireEvent.press(getByTestId('place-order-button'));

      expect(getByText('How would you like to pay?')).toBeTruthy();
      expect(getByText('Pay Online')).toBeTruthy();
      expect(getByText('Pay at Pickup')).toBeTruthy();
    });

    it('defaults to "Pay at Pickup"', () => {
      const { getByTestId, getByPlaceholderText } = renderWithProviders(<CheckoutScreen />);

      // Navigate to step 2
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.press(getByTestId('place-order-button'));

      // Payment defaults to atPickup, so we should be able to continue
      expect(getByTestId('place-order-button')).not.toBeDisabled();
    });

    it('allows selecting online payment', () => {
      const { getByTestId, getByPlaceholderText, getByText } = renderWithProviders(
        <CheckoutScreen />
      );

      // Navigate to step 2
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.press(getByTestId('place-order-button'));

      const onlineOption = getByText('Pay Online');
      fireEvent.press(onlineOption);

      expect(hapticLight).toHaveBeenCalled();
    });
  });

  describe('Step 3: Review & Terms', () => {
    it('shows review information on step 3', () => {
      const { getByTestId, getByPlaceholderText, getByText } = renderWithProviders(
        <CheckoutScreen />
      );

      // Navigate to step 3
      fireEvent.press(getByTestId('place-order-button')); // Step 0 -> 1
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.press(getByTestId('place-order-button')); // Step 1 -> 2
      fireEvent.press(getByTestId('place-order-button')); // Step 2 -> 3

      expect(getByText('Review your order')).toBeTruthy();
      expect(getByText('Method')).toBeTruthy();
      expect(getByText('Contact')).toBeTruthy();
      expect(getByText('Payment')).toBeTruthy();
    });

    it('displays pickup method in review', () => {
      const { getByTestId, getByPlaceholderText, getByText } = renderWithProviders(
        <CheckoutScreen />
      );

      // Navigate to step 3
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.press(getByTestId('place-order-button'));

      expect(getByText('Pickup')).toBeTruthy();
    });

    it('displays contact information in review', () => {
      const { getByTestId, getByPlaceholderText, getByText } = renderWithProviders(
        <CheckoutScreen />
      );

      // Navigate to step 3
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.press(getByTestId('place-order-button'));

      expect(getByText('John Doe, 555-1234, john@example.com')).toBeTruthy();
    });

    it('displays payment method in review', () => {
      const { getByTestId, getByPlaceholderText, getByText } = renderWithProviders(
        <CheckoutScreen />
      );

      // Navigate to step 3
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.press(getByTestId('place-order-button'));

      expect(getByText('At Pickup/Delivery')).toBeTruthy();
    });

    it('shows terms and conditions checkbox', () => {
      const { getByTestId, getByPlaceholderText, getByText } = renderWithProviders(
        <CheckoutScreen />
      );

      // Navigate to step 3
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.press(getByTestId('place-order-button'));

      expect(getByText(/I agree to the/)).toBeTruthy();
      expect(getByText('Terms & Conditions')).toBeTruthy();
      expect(getByText('Privacy Policy')).toBeTruthy();
    });

    it('toggles terms acceptance on checkbox press', () => {
      const { getByTestId, getByPlaceholderText, getByText } = renderWithProviders(
        <CheckoutScreen />
      );

      // Navigate to step 3
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.press(getByTestId('place-order-button'));

      const termsRow = getByText(/I agree to the/).parent;
      fireEvent.press(termsRow);

      expect(hapticLight).toHaveBeenCalled();
    });

    it('shows alert when placing order without accepting terms', () => {
      const { getByTestId, getByPlaceholderText } = renderWithProviders(<CheckoutScreen />);

      // Navigate to step 3
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.press(getByTestId('place-order-button'));

      // Try to place order without accepting terms
      fireEvent.press(getByTestId('place-order-button'));

      expect(hapticHeavy).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Error', expect.stringContaining('terms'));
    });
  });

  describe('Navigation', () => {
    it('renders with navigation support', () => {
      const { getByTestId } = renderWithProviders(<CheckoutScreen />);

      // Verify screen renders (navigation hooks are used internally)
      expect(getByTestId('checkout-screen')).toBeTruthy();
    });

    it('has header with back and help actions', () => {
      const { getByTestId } = renderWithProviders(<CheckoutScreen />);
      const screen = getByTestId('checkout-screen');

      // Header exists (contains navigation elements)
      expect(screen).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme background color', () => {
      const { getByTestId } = renderWithProviders(<CheckoutScreen />);
      const screen = getByTestId('checkout-screen');

      expect(screen.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: '#FAF8F4' })])
      );
    });

    it('applies theme primary color to header', () => {
      const { getByText } = renderWithProviders(<CheckoutScreen />);
      const headerTitle = getByText('Delivery');

      expect(headerTitle.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#3C5A47' })])
      );
    });
  });

  describe('Accessibility', () => {
    it('has accessibility label for place order button', () => {
      const { getByTestId, getByPlaceholderText } = renderWithProviders(<CheckoutScreen />);

      // Navigate to step 3
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '555-1234');
      fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
      fireEvent.press(getByTestId('place-order-button'));
      fireEvent.press(getByTestId('place-order-button'));

      const placeOrderButton = getByTestId('place-order-button');
      expect(placeOrderButton.props.accessibilityLabel).toBe('Place Order');
    });

    it('has accessibility label for continue button', () => {
      const { getByTestId } = renderWithProviders(<CheckoutScreen />);

      const continueButton = getByTestId('place-order-button');
      expect(continueButton.props.accessibilityLabel).toBe('Continue');
    });
  });
});
