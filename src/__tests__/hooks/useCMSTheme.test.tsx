import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useCMSTheme, DEFAULT_CMS_THEME } from '../../hooks/useCMSTheme';
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

describe('useCMSTheme hook', () => {
  const mockTheme = {
    brandSlug: 'nimbus',
    primaryColor: '#2E5D46',
    secondaryColor: '#8CD24C',
    backgroundColor: '#FFFFFF',
    accentColor: '#FFD700',
    cornerRadius: 8,
    darkModeEnabled: true,
    elevation: 'medium',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  it('should fetch theme when online', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockTheme });

    const { result } = renderHook(() => useCMSTheme(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTheme);
    expect(cmsClient.get).toHaveBeenCalledWith('/content/theme');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('cms:theme', JSON.stringify(mockTheme));
  });

  it('should fetch theme with brandSlug', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockTheme });

    const { result } = renderHook(() => useCMSTheme('nimbus'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cmsClient.get).toHaveBeenCalledWith('/content/theme?brand=nimbus');
  });

  it('should use cached theme when offline', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockTheme));

    const { result } = renderHook(() => useCMSTheme(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTheme);
    expect(cmsClient.get).not.toHaveBeenCalled();
  });

  it('should fallback to cache on API error', async () => {
    (cmsClient.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockTheme));

    const { result } = renderHook(() => useCMSTheme(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTheme);
  });
});

describe('DEFAULT_CMS_THEME', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_CMS_THEME).toEqual({
      brandSlug: 'default',
      primaryColor: '#2E5D46',
      secondaryColor: '#8CD24C',
      backgroundColor: '#F9F9F9',
      accentColor: '#FFD700',
      cornerRadius: 12,
      darkModeEnabled: false,
      elevation: 'soft',
    });
  });
});
