import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCart } from '../src/hooks/useCart';

jest.mock('@react-native-community/netinfo');
jest.mock('../src/api/phase4Client');

const queryClient = new QueryClient();

describe('useCart', () => {
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
});
