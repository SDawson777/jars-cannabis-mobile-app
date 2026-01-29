import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCMSContent } from '../hooks/useCMSContent';
import { cmsClient } from '../api/cmsClient';
import { useCMSPreview } from '../context/CMSPreviewContext';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../api/cmsClient');
jest.mock('../context/CMSPreviewContext');
jest.mock('@react-native-community/netinfo');

const mockedCmsClient = cmsClient as jest.Mocked<typeof cmsClient>;
const mockedUseCMSPreview = useCMSPreview as jest.MockedFunction<typeof useCMSPreview>;
const mockedNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

interface TestData {
  items: string[];
}

describe('useCMSContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseCMSPreview.mockReturnValue({ preview: false, setPreview: jest.fn() });
  });

  it('should fetch content when online', async () => {
    const mockData = { items: ['item1', 'item2'] };
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedCmsClient.get.mockResolvedValue({ data: mockData });
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCMSContent<TestData>(['testContent'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      'cms:/content/test',
      JSON.stringify(mockData)
    );
  });

  it('should include preview header when preview mode is enabled', async () => {
    mockedUseCMSPreview.mockReturnValue({ preview: true, setPreview: jest.fn() });
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedCmsClient.get.mockResolvedValue({ data: { items: [] } });
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCMSContent<TestData>(['testContent'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedCmsClient.get).toHaveBeenCalledWith('/content/test', {
      headers: { 'X-Preview': 'true' },
    });
  });

  it('should return cached content when offline', async () => {
    const cachedData = { items: ['cached1', 'cached2'] };
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useCMSContent<TestData>(['testContent'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(cachedData);
    expect(mockedCmsClient.get).not.toHaveBeenCalled();
  });

  it('should throw error when offline and no cache', async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);
    mockedAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useCMSContent<TestData>(['testContent'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Offline');
  });

  it('should fallback to cache when API fails', async () => {
    const cachedData = { items: ['fallback'] };
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedCmsClient.get.mockRejectedValue(new Error('API Error'));
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useCMSContent<TestData>(['testContent'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(cachedData);
  });

  it('should throw error when API fails and no cache', async () => {
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockedCmsClient.get.mockRejectedValue(new Error('API Error'));
    mockedAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useCMSContent<TestData>(['testContent'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('API Error');
  });
});
