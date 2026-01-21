/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  usePaymentProcessors,
  useProcessorStatus,
  usePaymentMethods,
} from '../../hooks/usePayments';

// Mock dependencies
jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
  clientDelete: jest.fn(),
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

describe('usePayments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usePaymentProcessors', () => {
    it('fetches available payment processors', async () => {
      const mockProcessors = [
        {
          processor: 'hypur',
          name: 'Hypur',
          displayName: 'Hypur',
          isEnabled: true,
          isConfigured: true,
          supportedMethods: ['bank_account', 'ach'],
        },
        {
          processor: 'dutchie_pay',
          name: 'Dutchie Pay',
          displayName: 'Dutchie Pay',
          isEnabled: true,
          isConfigured: false,
          supportedMethods: ['debit_card'],
        },
      ];
      (clientGet as jest.Mock).mockResolvedValue({ processors: mockProcessors });

      const { result } = renderHook(() => usePaymentProcessors(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProcessors);
      expect(result.current.data).toHaveLength(2);
    });

    it('handles error state', async () => {
      (clientGet as jest.Mock).mockRejectedValue(new Error('Failed to fetch processors'));

      const { result } = renderHook(() => usePaymentProcessors(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useProcessorStatus', () => {
    it('fetches status for a specific processor', async () => {
      const mockProcessor = {
        processor: 'hypur',
        name: 'Hypur',
        displayName: 'Hypur',
        isEnabled: true,
        isConfigured: true,
        supportedMethods: ['bank_account'],
      };
      (clientGet as jest.Mock).mockResolvedValue(mockProcessor);

      const { result } = renderHook(() => useProcessorStatus('hypur'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.processor).toBe('hypur');
      expect(result.current.data?.isConfigured).toBe(true);
    });

    it('is disabled when processor is empty', () => {
      const { result } = renderHook(() => useProcessorStatus('' as any), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('usePaymentMethods', () => {
    it('fetches saved payment methods', async () => {
      const mockMethods = [
        {
          id: 'pm-1',
          processor: 'hypur',
          type: 'bank_account',
          last4: '1234',
          bankName: 'Chase',
          isDefault: true,
          isVerified: true,
          createdAt: '2024-01-01',
        },
        {
          id: 'pm-2',
          processor: 'dutchie_pay',
          type: 'debit_card',
          last4: '5678',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: false,
          isVerified: true,
          createdAt: '2024-02-01',
        },
      ];
      (clientGet as jest.Mock).mockResolvedValue({ methods: mockMethods });

      const { result } = renderHook(() => usePaymentMethods(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].last4).toBe('1234');
    });

    it('handles empty payment methods', async () => {
      (clientGet as jest.Mock).mockResolvedValue({ methods: [] });

      const { result } = renderHook(() => usePaymentMethods(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('handles error state', async () => {
      (clientGet as jest.Mock).mockRejectedValue(new Error('Failed to fetch methods'));

      const { result } = renderHook(() => usePaymentMethods(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
