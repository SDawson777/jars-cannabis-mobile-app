import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAddresses, useCreateAddress, Address } from '../../hooks/useAddresses';
import * as http from '../../api/http';
import * as analytics from '../../utils/analytics';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
  clientPut: jest.fn(),
  clientDelete: jest.fn(),
}));

jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAddresses hook', () => {
  const mockAddresses: Address[] = [
    {
      id: 'addr-1',
      label: 'Home',
      line1: '123 Main St',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Work',
      line1: '456 Office Blvd',
      city: 'Boulder',
      state: 'CO',
      zip: '80301',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch addresses successfully', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockAddresses);

    const { result } = renderHook(() => useAddresses(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAddresses);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/addresses');
  });

  it('should handle fetch error', async () => {
    (http.clientGet as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAddresses(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should return loading state initially', () => {
    (http.clientGet as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAddresses(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useCreateAddress hook', () => {
  const newAddress = {
    label: 'New Home',
    line1: '789 New St',
    city: 'Aurora',
    state: 'CO',
    zip: '80010',
  };

  const createdAddress: Address = {
    ...newAddress,
    id: 'addr-3',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create address successfully', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce(createdAddress);

    const { result } = renderHook(() => useCreateAddress(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync(newAddress);
    });

    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/addresses', newAddress);
    expect(analytics.logEvent).toHaveBeenCalledWith('address_created', { state: 'CO' });
  });

  it('should handle create error', async () => {
    (http.clientPost as jest.Mock).mockRejectedValueOnce(new Error('Create failed'));

    const { result } = renderHook(() => useCreateAddress(), { wrapper: createWrapper() });

    await expect(
      act(async () => {
        await result.current.mutateAsync(newAddress);
      })
    ).rejects.toThrow('Create failed');
  });

  it('should track mutation success state', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce(createdAddress);

    const { result } = renderHook(() => useCreateAddress(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync(newAddress);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(createdAddress);
  });
});
