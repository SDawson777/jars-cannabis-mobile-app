import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useCMSContent } from '../../hooks/useCMSContent';
import * as CMSPreviewModule from '../../context/CMSPreviewContext';
import { cmsClient } from '../../api/cmsClient';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

jest.mock('../../api/cmsClient', () => ({
  cmsClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../context/CMSPreviewContext', () => ({
  useCMSPreview: jest.fn(),
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

describe('useCMSContent hook', () => {
  interface MockData {
    id: string;
    title: string;
  }

  const mockData: MockData = {
    id: 'content-1',
    title: 'Test Content',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (CMSPreviewModule.useCMSPreview as jest.Mock).mockReturnValue({ preview: false });
  });

  it('should fetch content when online', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useCMSContent<MockData>(['test'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(cmsClient.get).toHaveBeenCalledWith('/content/test', {
      headers: undefined,
    });
  });

  it('should cache fetched content', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useCMSContent<MockData>(['test'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'cms:/content/test',
      JSON.stringify(mockData)
    );
  });

  it('should use cache when offline', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

    const { result } = renderHook(() => useCMSContent<MockData>(['test'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(cmsClient.get).not.toHaveBeenCalled();
  });

  it('should fetch with preview header in preview mode', async () => {
    (CMSPreviewModule.useCMSPreview as jest.Mock).mockReturnValue({ preview: true });
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useCMSContent<MockData>(['test'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cmsClient.get).toHaveBeenCalledWith('/content/test', {
      headers: { 'X-Preview': 'true' },
    });
  });

  it('should cache preview content separately', async () => {
    (CMSPreviewModule.useCMSPreview as jest.Mock).mockReturnValue({ preview: true });
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useCMSContent<MockData>(['test'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'cms:/content/test:preview',
      JSON.stringify(mockData)
    );
  });

  it('should fallback to cache on API error', async () => {
    (cmsClient.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

    const { result } = renderHook(() => useCMSContent<MockData>(['test'], '/content/test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
  });
});
