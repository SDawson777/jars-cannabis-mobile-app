/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProductInventory } from '../../hooks/useInventory';

// Mock dependencies
jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('../../api/phase4Client', () => ({
  phase4Client: {},
}));

jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

import { clientGet } from '../../api/http';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useInventory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useProductInventory', () => {
    it('fetches inventory for a product', async () => {
      const mockInventory = {
        productId: 'prod-123',
        storeId: 'store-1',
        quantity: 50,
        available: true,
        lowStock: false,
        lastUpdated: '2024-01-01T12:00:00Z',
      };
      (clientGet as jest.Mock).mockResolvedValue(mockInventory);

      const { result } = renderHook(() => useProductInventory('prod-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockInventory);
      expect(clientGet).toHaveBeenCalledWith(expect.anything(), '/inventory/prod-123');
    });

    it('fetches inventory with store filter', async () => {
      const mockInventory = {
        productId: 'prod-123',
        storeId: 'store-abc',
        quantity: 25,
        available: true,
        lowStock: true,
        lastUpdated: '2024-01-01T12:00:00Z',
      };
      (clientGet as jest.Mock).mockResolvedValue(mockInventory);

      const { result } = renderHook(() => useProductInventory('prod-123', 'store-abc'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(clientGet).toHaveBeenCalledWith(
        expect.anything(),
        '/inventory/prod-123?storeId=store-abc'
      );
    });

    it('handles error state', async () => {
      (clientGet as jest.Mock).mockRejectedValue(new Error('Inventory check failed'));

      const { result } = renderHook(() => useProductInventory('prod-456'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('shows low stock status correctly', async () => {
      const mockInventory = {
        productId: 'prod-789',
        storeId: 'store-1',
        quantity: 3,
        available: true,
        lowStock: true,
        lastUpdated: '2024-01-01T12:00:00Z',
      };
      (clientGet as jest.Mock).mockResolvedValue(mockInventory);

      const { result } = renderHook(() => useProductInventory('prod-789'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.lowStock).toBe(true);
      expect(result.current.data?.available).toBe(true);
    });

    it('shows out of stock correctly', async () => {
      const mockInventory = {
        productId: 'prod-000',
        storeId: 'store-1',
        quantity: 0,
        available: false,
        lowStock: false,
        lastUpdated: '2024-01-01T12:00:00Z',
      };
      (clientGet as jest.Mock).mockResolvedValue(mockInventory);

      const { result } = renderHook(() => useProductInventory('prod-000'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.available).toBe(false);
      expect(result.current.data?.quantity).toBe(0);
    });
  });
});
