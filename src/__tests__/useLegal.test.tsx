import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLegal } from '../hooks/useLegal';
import { cmsClient } from '../api/cmsClient';

jest.mock('../api/cmsClient');
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true }),
}));

const mockedCmsClient = cmsClient as jest.Mocked<typeof cmsClient>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLegal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('should call cmsClient with correct path', async () => {
    const mockLegalContent = {
      terms: 'TOS content',
      privacy: 'Privacy content',
    };
    mockedCmsClient.get.mockResolvedValue({ data: mockLegalContent });

    renderHook(() => useLegal(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockedCmsClient.get).toHaveBeenCalledWith('/content/legal');
    });
  });

  it('should return legal content when loaded', async () => {
    const mockLegalContent = {
      terms: 'TOS content',
      privacy: 'Privacy content',
    };
    mockedCmsClient.get.mockResolvedValue({ data: mockLegalContent });

    const { result } = renderHook(() => useLegal(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockLegalContent);
  });

  it('should return loading state', () => {
    mockedCmsClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useLegal(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', async () => {
    const mockError = new Error('Failed to fetch legal content');
    mockedCmsClient.get.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLegal(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to fetch legal content');
  });
});
