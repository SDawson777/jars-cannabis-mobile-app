// src/screens/__tests__/OrderDetailsScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OrderDetailsScreen from '../OrderDetailsScreen';
import { ThemeContext } from '../../context/ThemeContext';

// Mock dependencies
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
const mockNavigate = jest.fn();
const mockOrder = {
  id: 'ORD-12345',
  date: '2025-07-14',
  status: 'Processing',
  items: [
    { id: '1', name: 'Rainbow Rozay', qty: 1, price: 79.0 },
    { id: '2', name: 'Moonwalker OG', qty: 2, price: 65.0 },
  ],
};

const mockUseRoute = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate,
  }),
  useRoute: () => mockUseRoute(),
}));

const mockThemeContext = {
  colorTemp: 'warm' as const,
  brandPrimary: '#4C9F70',
  brandSecondary: '#E8F5E9',
  brandBackground: '#FAF8F4',
  textColor: '#2C3E50',
  isDark: false,
};

describe('OrderDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRoute.mockReturnValue({
      params: {
        order: mockOrder,
      },
    });
  });

  const renderScreen = () => {
    return render(
      <ThemeContext.Provider value={mockThemeContext}>
        <OrderDetailsScreen />
      </ThemeContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('renders the screen with order ID in header', () => {
      const { getByText } = renderScreen();
      expect(getByText('Order #ORD-12345')).toBeTruthy();
    });

    it('renders the order date', () => {
      const { getByText } = renderScreen();
      expect(getByText('Date: 2025-07-14')).toBeTruthy();
    });

    it('renders the order status', () => {
      const { getByText } = renderScreen();
      expect(getByText('Status: Processing')).toBeTruthy();
    });

    it('renders order items', () => {
      const { getByText } = renderScreen();
      expect(getByText('1× Rainbow Rozay')).toBeTruthy();
      expect(getByText('2× Moonwalker OG')).toBeTruthy();
    });

    it('renders item prices correctly', () => {
      const { getByText } = renderScreen();
      // Rainbow Rozay: 1 × 79.00 = $79.00
      expect(getByText('$79.00')).toBeTruthy();
      // Moonwalker OG: 2 × 65.00 = $130.00
      expect(getByText('$130.00')).toBeTruthy();
    });

    it('renders subtotal', () => {
      const { getByText } = renderScreen();
      // Subtotal: 79.00 + 130.00 = $209.00
      expect(getByText('Subtotal')).toBeTruthy();
      expect(getByText('$209.00')).toBeTruthy();
    });

    it('renders taxes', () => {
      const { getByText } = renderScreen();
      // Taxes: 209.00 × 0.07 = $14.63
      expect(getByText('Taxes')).toBeTruthy();
      expect(getByText('$14.63')).toBeTruthy();
    });

    it('renders total', () => {
      const { getByText } = renderScreen();
      // Total: 209.00 + 14.63 = $223.63
      expect(getByText('Total')).toBeTruthy();
      expect(getByText('$223.63')).toBeTruthy();
    });

    it('renders reorder button', () => {
      const { getByText } = renderScreen();
      expect(getByText('Reorder')).toBeTruthy();
    });
  });

  describe('Fallback Order', () => {
    it('uses fallback order when no order param provided', () => {
      mockUseRoute.mockReturnValue({
        params: {},
      });

      const { getByText } = renderScreen();
      // Fallback order ID is 12345
      expect(getByText('Order #12345')).toBeTruthy();
      expect(getByText('Date: 2025-07-14')).toBeTruthy();
      expect(getByText('Status: Processing')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to cart screen when reorder is pressed', () => {
      const { getByText } = renderScreen();
      const reorderButton = getByText('Reorder');

      fireEvent.press(reorderButton);

      expect(mockNavigate).toHaveBeenCalledWith('CartScreen');
    });
  });

  describe('Theme Integration', () => {
    it('applies cool theme when colorTemp is cool', () => {
      const coolTheme = {
        ...mockThemeContext,
        colorTemp: 'cool' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={coolTheme}>
          <OrderDetailsScreen />
        </ThemeContext.Provider>
      );

      expect(getByText('Order #ORD-12345')).toBeTruthy();
    });

    it('applies neutral theme when colorTemp is neutral', () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={neutralTheme}>
          <OrderDetailsScreen />
        </ThemeContext.Provider>
      );

      expect(getByText('Order #ORD-12345')).toBeTruthy();
    });
  });

  describe('Order Calculations', () => {
    it('calculates correct total for single item order', () => {
      mockUseRoute.mockReturnValue({
        params: {
          order: {
            id: 'ORD-001',
            date: '2025-07-15',
            status: 'Delivered',
            items: [{ id: '1', name: 'Test Product', qty: 1, price: 100.0 }],
          },
        },
      });

      const { getAllByText, getByText } = renderScreen();
      // Subtotal: $100.00, Taxes: $7.00, Total: $107.00
      // There may be multiple $100.00 (item price and subtotal)
      expect(getAllByText('$100.00').length).toBeGreaterThan(0);
      expect(getByText('$7.00')).toBeTruthy();
      expect(getByText('$107.00')).toBeTruthy();
    });

    it('handles multiple quantities correctly', () => {
      mockUseRoute.mockReturnValue({
        params: {
          order: {
            id: 'ORD-002',
            date: '2025-07-15',
            status: 'Shipped',
            items: [{ id: '1', name: 'Bulk Product', qty: 5, price: 20.0 }],
          },
        },
      });

      const { getByText, getAllByText } = renderScreen();
      // Item price: 5 × 20 = $100.00
      expect(getByText('5× Bulk Product')).toBeTruthy();
      // There may be multiple $100.00 (item price and subtotal)
      expect(getAllByText('$100.00').length).toBeGreaterThan(0);
    });
  });

  describe('Order Status Display', () => {
    it('displays Processing status', () => {
      const { getByText } = renderScreen();
      expect(getByText('Status: Processing')).toBeTruthy();
    });

    it('displays Shipped status', () => {
      mockUseRoute.mockReturnValue({
        params: {
          order: {
            ...mockOrder,
            status: 'Shipped',
          },
        },
      });

      const { getByText } = renderScreen();
      expect(getByText('Status: Shipped')).toBeTruthy();
    });

    it('displays Delivered status', () => {
      mockUseRoute.mockReturnValue({
        params: {
          order: {
            ...mockOrder,
            status: 'Delivered',
          },
        },
      });

      const { getByText } = renderScreen();
      expect(getByText('Status: Delivered')).toBeTruthy();
    });

    it('displays Cancelled status', () => {
      mockUseRoute.mockReturnValue({
        params: {
          order: {
            ...mockOrder,
            status: 'Cancelled',
          },
        },
      });

      const { getByText } = renderScreen();
      expect(getByText('Status: Cancelled')).toBeTruthy();
    });
  });
});
