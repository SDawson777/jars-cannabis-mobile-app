/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useServiceAvailability } from '../../hooks/useServiceAvailability';

const mockFetchJson = jest.fn();

jest.mock('../../utils/apiClient', () => ({
  fetchJson: (...args: any[]) => mockFetchJson(...args),
}));

jest.mock('../../utils/apiConfig', () => ({
  API_BASE_URL: 'https://api.test.com',
}));

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

describe('useServiceAvailability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches service availability', async () => {
    const mockData = {
      services: {
        stripe: { available: true, message: null },
        ai: { available: true, message: null },
        firebase: { available: true, message: null },
        database: { available: true, message: null },
      },
      paymentsEnabled: true,
      aiEnabled: true,
    };
    mockFetchJson.mockResolvedValue(mockData);

    const { result } = renderHook(() => useServiceAvailability(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.paymentsEnabled).toBe(true);
    });

    expect(result.current.paymentsEnabled).toBe(true);
    expect(result.current.aiEnabled).toBe(true);
  });

  it('returns loading state initially', () => {
    mockFetchJson.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useServiceAvailability(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('handles errors with default availability', async () => {
    mockFetchJson.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useServiceAvailability(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.paymentsEnabled).toBe(true);
    });

    // Should return default availability
    expect(result.current.paymentsEnabled).toBe(true);
    expect(result.current.aiEnabled).toBe(true);
  });

  it('calls correct endpoint', async () => {
    mockFetchJson.mockResolvedValue({
      services: {
        stripe: { available: true, message: null },
        ai: { available: true, message: null },
        firebase: { available: true, message: null },
        database: { available: true, message: null },
      },
      paymentsEnabled: true,
      aiEnabled: true,
    });

    renderHook(() => useServiceAvailability(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetchJson).toHaveBeenCalledWith(
        'https://api.test.com/config/services',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  it('handles unavailable services', async () => {
    const mockData = {
      services: {
        stripe: { available: false, message: 'Stripe unavailable' },
        ai: { available: true, message: null },
        firebase: { available: true, message: null },
        database: { available: true, message: null },
      },
      paymentsEnabled: false,
      aiEnabled: true,
    };
    mockFetchJson.mockResolvedValue(mockData);

    const { result } = renderHook(() => useServiceAvailability(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.paymentsEnabled).toBe(false);
    });

    expect(result.current.paymentsEnabled).toBe(false);
    expect(result.current.stripeAvailable).toBe(false);
  });
});
