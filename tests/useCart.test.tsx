import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useCart } from '../src/hooks/useCart';

jest.mock('@react-native-community/netinfo');
jest.mock('../src/api/phase4Client');

const queryClient = new QueryClient();

describe('useCart', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.resetAllMocks();
  });

  it('returns cached cart when offline', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    await AsyncStorage.setItem('cart', JSON.stringify({ items: [], total: 0 }));
    const wrapper = ({ children }: any) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.cart).toBeDefined());
    expect(result.current.cart).toEqual({ items: [], total: 0 });
  });

  it('increments quantity and server cart reflects the change', async () => {
    // Mock online
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    // Mock backend
    const mockPost = require('../src/api/phase4Client').phase4Client.post;
    const serverCart = { items: [{ productId: 'p1', quantity: 2, price: 10 }], total: 20 };
    mockPost.mockImplementation(async (endpoint: string, _payload: any) => {
      if (endpoint === '/cart/update') {
        // Simulate server merge logic
        return { data: { cart: serverCart } };
      }
      return { data: { cart: { items: [], total: 0 } } };
    });
    const wrapper = ({ children }: any) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCart(), { wrapper });
    // Add item
    await result.current.addItem({ id: 'p1', price: 10, quantity: 1 });
    // Increment quantity
    await result.current.addItem({ id: 'p1', price: 10, quantity: 1 });
    await waitFor(() => {
      expect(result.current.cart.items[0].quantity).toBe(2);
      expect(result.current.cart.total).toBe(20);
    });
    // Ensure payload sent to server is normalized
    expect(mockPost).toHaveBeenCalledWith(
      '/cart/update',
      expect.objectContaining({
        items: [expect.objectContaining({ productId: 'p1', quantity: 1, price: 10 })],
      })
    );
  });
});
