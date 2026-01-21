import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useLegal, useLegalByType } from '../../hooks/useLegal';

// Mock dependencies
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

const { cmsClient } = require('../../api/cmsClient');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useLegal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('fetches legal content successfully', async () => {
    const mockLegalContent = {
      terms: 'Terms of Service...',
      privacy: 'Privacy Policy...',
      accessibility: 'Accessibility Statement...',
    };

    (cmsClient.get as jest.Mock).mockResolvedValue({ data: mockLegalContent });

    const { result } = renderHook(() => useLegal(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.terms).toBe('Terms of Service...');
    expect(result.current.data?.privacy).toBe('Privacy Policy...');
  });

  it('fetches legal content with state code', async () => {
    const mockLegalContent = { terms: 'CA Terms...' };

    (cmsClient.get as jest.Mock).mockResolvedValue({ data: mockLegalContent });

    const { result } = renderHook(() => useLegal('CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(cmsClient.get).toHaveBeenCalledWith('/content/legal?state=CA');
  });

  it('uses cached data when offline', async () => {
    const cachedData = { terms: 'Cached Terms' };

    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useLegal(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.terms).toBe('Cached Terms');
  });

  it('caches fetched data', async () => {
    const mockData = { terms: 'Fresh Terms' };
    (cmsClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    renderHook(() => useLegal(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});

describe('useLegalByType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('returns terms content with proper title', async () => {
    const mockData = {
      terms: 'Terms content...',
      lastUpdated: { terms: '2024-01-01' },
    };
    (cmsClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useLegalByType('terms'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.title).toBe('Terms');
    expect(result.current.data?.body).toBe('Terms content...');
    expect(result.current.data?.lastUpdated).toBe('2024-01-01');
  });

  it('returns privacy content with proper title', async () => {
    const mockData = { privacy: 'Privacy content...' };
    (cmsClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useLegalByType('privacy'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.title).toBe('Privacy');
    expect(result.current.data?.body).toBe('Privacy content...');
  });

  it('returns empty body when content type not available', async () => {
    const mockData = { terms: 'Only terms' };
    (cmsClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useLegalByType('accessibility'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.title).toBe('Accessibility');
    expect(result.current.data?.body).toBe('');
  });
});
