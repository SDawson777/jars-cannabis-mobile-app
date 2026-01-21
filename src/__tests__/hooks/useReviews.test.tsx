/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProductReviews } from '../../hooks/useReviews';

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

describe('useReviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useProductReviews', () => {
    it('fetches reviews for a product', async () => {
      const mockReviews = {
        reviews: [
          {
            id: 'rev-1',
            userId: 'user-1',
            userName: 'John',
            productId: 'prod-123',
            rating: 5,
            text: 'Great product!',
            createdAt: '2024-01-01',
            verified: true,
          },
        ],
        averageRating: 5,
        totalCount: 1,
      };
      (clientGet as jest.Mock).mockResolvedValue(mockReviews);

      const { result } = renderHook(() => useProductReviews('prod-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockReviews);
      expect(result.current.data?.averageRating).toBe(5);
      expect(result.current.data?.reviews).toHaveLength(1);
    });

    it('includes limit in request', async () => {
      (clientGet as jest.Mock).mockResolvedValue({ reviews: [], averageRating: 0, totalCount: 0 });

      const { result } = renderHook(() => useProductReviews('prod-456', { limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(clientGet).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('limit=10')
      );
    });

    it('includes offset in request', async () => {
      (clientGet as jest.Mock).mockResolvedValue({ reviews: [], averageRating: 0, totalCount: 0 });

      const { result } = renderHook(() => useProductReviews('prod-789', { offset: 20 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(clientGet).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('offset=20')
      );
    });

    it('is disabled when productId is empty', () => {
      const { result } = renderHook(() => useProductReviews(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('handles error state', async () => {
      (clientGet as jest.Mock).mockRejectedValue(new Error('Failed to fetch reviews'));

      const { result } = renderHook(() => useProductReviews('prod-error'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('returns rating distribution when available', async () => {
      const mockReviews = {
        reviews: [],
        averageRating: 4.2,
        totalCount: 100,
        ratingDistribution: { 1: 5, 2: 10, 3: 15, 4: 30, 5: 40 },
      };
      (clientGet as jest.Mock).mockResolvedValue(mockReviews);

      const { result } = renderHook(() => useProductReviews('prod-dist'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.ratingDistribution).toEqual({ 1: 5, 2: 10, 3: 15, 4: 30, 5: 40 });
    });
  });
});
