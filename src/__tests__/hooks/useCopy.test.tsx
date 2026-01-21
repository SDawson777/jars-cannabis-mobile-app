import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useCopy, defaultCopy } from '../../hooks/useCopy';
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

describe('useCopy hook', () => {
  const mockCopyItems = [
    { key: 'welcome.title', text: 'Welcome' },
    { key: 'welcome.subtitle', text: 'Your app' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  it('should fetch copy when online', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockCopyItems });

    const { result } = renderHook(() => useCopy('onboarding'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      'welcome.title': 'Welcome',
      'welcome.subtitle': 'Your app',
    });
  });

  it('should cache fetched copy', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockCopyItems });

    const { result } = renderHook(() => useCopy('onboarding'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('cms:copy:onboarding', expect.any(String));
  });

  it('should use cache when offline', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ 'welcome.title': 'Cached Welcome' })
    );

    const { result } = renderHook(() => useCopy('onboarding'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ 'welcome.title': 'Cached Welcome' });
    expect(cmsClient.get).not.toHaveBeenCalled();
  });

  it('should return empty map when offline with no cache', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useCopy('onboarding'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({});
  });

  it('should fallback to cache on API error', async () => {
    (cmsClient.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ 'welcome.title': 'Cached Welcome' })
    );

    const { result } = renderHook(() => useCopy('onboarding'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ 'welcome.title': 'Cached Welcome' });
  });

  it('should call API with correct params', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useCopy('emptyStates'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cmsClient.get).toHaveBeenCalledWith('/content/copy', {
      params: { context: 'emptyStates' },
    });
  });
});

describe('defaultCopy', () => {
  it('should have onboarding copy', () => {
    expect(defaultCopy.onboarding).toBeDefined();
    expect(defaultCopy.onboarding['welcome.title']).toBe('Welcome to Nimbus');
  });

  it('should have all contexts', () => {
    expect(defaultCopy.onboarding).toBeDefined();
    expect(defaultCopy.emptyStates).toBeDefined();
    expect(defaultCopy.awards).toBeDefined();
    expect(defaultCopy.accessibility).toBeDefined();
    expect(defaultCopy.dataTransparency).toBeDefined();
    expect(defaultCopy.ageGate).toBeDefined();
    expect(defaultCopy.checkout).toBeDefined();
    expect(defaultCopy.errors).toBeDefined();
  });
});
