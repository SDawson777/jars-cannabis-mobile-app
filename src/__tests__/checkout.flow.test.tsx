import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock cart data
const mockCartItems = [
  {
    id: '1',
    productId: 'product-1',
    productName: 'Blue Dream',
    quantity: 2,
    price: 35.00,
    variant: 'eighth',
    image: 'blue-dream.jpg',
  },
  {
    id: '2',
    productId: 'product-2', 
    productName: 'Sour Diesel',
    quantity: 1,
    price: 40.00,
    variant: 'quarter',
    image: 'sour-diesel.jpg',
  },
];

const mockCart = {
  items: mockCartItems,
  subtotal: 110.00,
  tax: 11.00,
  total: 121.00,
  itemCount: 3,
};

// Mock cart hooks
jest.mock('../hooks/useCart', () => ({
  useCart: () => ({
    data: mockCart,
    isLoading: false,
    error: null,
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
  }),
}));

// Mock auth context
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));

describe('Checkout Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          {component}
        </NavigationContainer>
      </QueryClientProvider>
    );
  };

  describe('CartScreen', () => {
    it('should render cart with items', () => {
      const { getByText } = renderWithProviders(<CartScreen />);
      
      // Check if cart items are displayed
      expect(getByText('Blue Dream')).toBeTruthy();
      expect(getByText('Sour Diesel')).toBeTruthy();
      
      // Check quantities
      expect(getByText('2')).toBeTruthy();
      expect(getByText('1')).toBeTruthy();
      
      // Check total
      expect(getByText('$121.00')).toBeTruthy();
    });

    it('should update item quantity', () => {
      const mockUpdateItem = jest.fn();
      jest.doMock('../hooks/useCart', () => ({
        useCart: () => ({
          data: mockCart,
          updateItem: mockUpdateItem,
        }),
      }));

      const { getByTestId } = renderWithProviders(<CartScreen />);
      
      // Press increase quantity button
      const increaseButton = getByTestId('increase-quantity-1');
      fireEvent.press(increaseButton);

      expect(mockUpdateItem).toHaveBeenCalledWith('1', { quantity: 3 });
    });

    it('should remove item from cart', () => {
      const mockRemoveItem = jest.fn();
      jest.doMock('../hooks/useCart', () => ({
        useCart: () => ({
          data: mockCart,
          removeItem: mockRemoveItem,
        }),
      }));

      const { getByTestId } = renderWithProviders(<CartScreen />);
      
      // Press remove button
      const removeButton = getByTestId('remove-item-1');
      fireEvent.press(removeButton);

      expect(mockRemoveItem).toHaveBeenCalledWith('1');
    });

    it('should navigate to checkout when checkout button is pressed', () => {
      const { getByText } = renderWithProviders(<CartScreen />);
      
      const checkoutButton = getByText('Proceed to Checkout');
      fireEvent.press(checkoutButton);

      expect(mockNavigate).toHaveBeenCalledWith('Checkout');
    });

    it('should show empty cart state', () => {
      jest.doMock('../hooks/useCart', () => ({
        useCart: () => ({
          data: { items: [], total: 0, itemCount: 0 },
        }),
      }));

      const { getByText } = renderWithProviders(<CartScreen />);
      
      expect(getByText(/your cart is empty/i)).toBeTruthy();
      expect(getByText(/continue shopping/i)).toBeTruthy();
    });

    it('should apply coupon code', async () => {
      const mockApplyCoupon = jest.fn();
      jest.doMock('../hooks/useCart', () => ({
        useCart: () => ({
          data: mockCart,
          applyCoupon: mockApplyCoupon,
        }),
      }));

      const { getByTestId, getByText } = renderWithProviders(<CartScreen />);
      
      // Enter coupon code
      const couponInput = getByTestId('coupon-input');
      fireEvent.changeText(couponInput, 'SAVE10');
      
      // Press apply button
      const applyButton = getByText('Apply');
      fireEvent.press(applyButton);

      expect(mockApplyCoupon).toHaveBeenCalledWith('SAVE10');
    });
  });

  describe('CheckoutScreen', () => {
    it('should render checkout form', () => {
      const { getByText, getByTestId } = renderWithProviders(<CheckoutScreen />);
      
      // Check if form sections are present
      expect(getByText('Delivery Information')).toBeTruthy();
      expect(getByText('Payment Method')).toBeTruthy();
      expect(getByText('Order Summary')).toBeTruthy();
      
      // Check form inputs
      expect(getByTestId('delivery-address-input')).toBeTruthy();
      expect(getByTestId('payment-method-selector')).toBeTruthy();
    });

    it('should validate required fields', async () => {
      const { getByText, getByTestId } = renderWithProviders(<CheckoutScreen />);
      
      // Try to submit without filling required fields
      const submitButton = getByText('Place Order');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText(/delivery address is required/i)).toBeTruthy();
        expect(getByText(/payment method is required/i)).toBeTruthy();
      });
    });

    it('should submit order with valid data', async () => {
      const mockCreateOrder = jest.fn().mockResolvedValue({
        id: 'order-123',
        status: 'pending',
      });

      jest.doMock('../hooks/useOrders', () => ({
        useCreateOrder: () => ({
          mutate: mockCreateOrder,
          isLoading: false,
        }),
      }));

      const { getByText, getByTestId } = renderWithProviders(<CheckoutScreen />);
      
      // Fill in delivery address
      const addressInput = getByTestId('delivery-address-input');
      fireEvent.changeText(addressInput, '123 Main St, Denver, CO 80202');
      
      // Select payment method
      const paymentSelector = getByTestId('payment-method-selector');
      fireEvent.press(paymentSelector);
      
      const cardOption = getByText('Credit Card');
      fireEvent.press(cardOption);
      
      // Submit order
      const submitButton = getByText('Place Order');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockCreateOrder).toHaveBeenCalledWith({
          deliveryAddress: '123 Main St, Denver, CO 80202',
          paymentMethod: 'card',
          items: mockCartItems,
        });
      });
    });

    it('should show order total breakdown', () => {
      const { getByText } = renderWithProviders(<CheckoutScreen />);
      
      expect(getByText('Subtotal')).toBeTruthy();
      expect(getByText('$110.00')).toBeTruthy();
      expect(getByText('Tax')).toBeTruthy();
      expect(getByText('$11.00')).toBeTruthy();
      expect(getByText('Total')).toBeTruthy();
      expect(getByText('$121.00')).toBeTruthy();
    });

    it('should handle delivery method selection', () => {
      const { getByText, getByTestId } = renderWithProviders(<CheckoutScreen />);
      
      // Select delivery method
      const deliveryRadio = getByTestId('delivery-method-delivery');
      fireEvent.press(deliveryRadio);
      
      expect(getByText('Delivery Fee: $5.00')).toBeTruthy();
      
      // Switch to pickup
      const pickupRadio = getByTestId('delivery-method-pickup');
      fireEvent.press(pickupRadio);
      
      expect(getByText('Pickup - No fee')).toBeTruthy();
    });

    it('should show loading state during order submission', async () => {
      jest.doMock('../hooks/useOrders', () => ({
        useCreateOrder: () => ({
          mutate: jest.fn(),
          isLoading: true,
        }),
      }));

      const { getByTestId } = renderWithProviders(<CheckoutScreen />);
      
      expect(getByTestId('order-loading-indicator')).toBeTruthy();
    });

    it('should navigate to order confirmation on successful order', async () => {
      const mockCreateOrder = jest.fn().mockResolvedValue({
        id: 'order-123',
        status: 'pending',
      });

      jest.doMock('../hooks/useOrders', () => ({
        useCreateOrder: () => ({
          mutate: mockCreateOrder,
          isLoading: false,
          onSuccess: (data: any) => {
            mockNavigate('OrderConfirmation', { orderId: data.id });
          },
        }),
      }));

      const { getByText, getByTestId } = renderWithProviders(<CheckoutScreen />);
      
      // Fill form and submit
      const addressInput = getByTestId('delivery-address-input');
      fireEvent.changeText(addressInput, '123 Main St');
      
      const submitButton = getByText('Place Order');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('OrderConfirmation', {
          orderId: 'order-123',
        });
      });
    });
  });
});