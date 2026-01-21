import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useCMSProducts } from '../../hooks/useCMSProducts';
import { cmsClient } from '../../api/cmsClient';

jest.mock('../../api/cmsClient', () => ({
  cmsClient: {
    get: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCMSProducts hook', () => {
  const mockProducts = [
    {
      id: 'product-1',
      slug: 'blue-dream',
      name: 'Blue Dream',
      category: 'flower',
      thc: '22%',
      cbd: '1%',
    },
    {
      id: 'product-2',
      slug: 'og-kush',
      name: 'OG Kush',
      category: 'flower',
      thc: '25%',
      cbd: '0.5%',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch products successfully', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockProducts });

    const { result } = renderHook(() => useCMSProducts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProducts);
    expect(cmsClient.get).toHaveBeenCalledWith('/api/admin/products');
  });

  it('should return loading state', () => {
    (cmsClient.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useCMSProducts(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle fetch error', async () => {
    (cmsClient.get as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

    const { result } = renderHook(() => useCMSProducts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Fetch failed');
  });
});
