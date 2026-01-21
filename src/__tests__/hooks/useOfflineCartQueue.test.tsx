/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useOfflineCartQueue } from '../../hooks/useOfflineCartQueue';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock('../../api/http', () => ({
  clientPost: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../api/phase4Client', () => ({
  phase4Client: {},
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('useOfflineCartQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  it('initially has pending false when queue is empty', async () => {
    const { result } = renderHook(() => useOfflineCartQueue());

    await waitFor(() => {
      expect(result.current.pending).toBe(false);
    });
  });

  it('returns queueAction function', () => {
    const { result } = renderHook(() => useOfflineCartQueue());

    expect(result.current.queueAction).toBeDefined();
    expect(typeof result.current.queueAction).toBe('function');
  });

  it('queueAction adds action to storage', async () => {
    mockNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);

    const { result } = renderHook(() => useOfflineCartQueue());

    await act(async () => {
      await result.current.queueAction({ endpoint: '/cart/add', payload: { id: '1' } });
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'cartQueue',
      expect.stringContaining('/cart/add')
    );
  });

  it('sets pending true after queuing action', async () => {
    mockNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);

    const { result } = renderHook(() => useOfflineCartQueue());

    await act(async () => {
      await result.current.queueAction({ endpoint: '/cart/add', payload: {} });
    });

    expect(result.current.pending).toBe(true);
  });

  it('registers NetInfo listener on mount', () => {
    renderHook(() => useOfflineCartQueue());

    expect(mockNetInfo.addEventListener).toHaveBeenCalled();
  });

  it('processes queue when connected', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([{ endpoint: '/cart/add', payload: { id: '1' } }])
    );

    renderHook(() => useOfflineCartQueue());

    await waitFor(() => {
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('cartQueue');
    });
  });

  it('does not process queue when offline', async () => {
    mockNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);
    mockAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([{ endpoint: '/cart/add', payload: { id: '1' } }])
    );

    renderHook(() => useOfflineCartQueue());

    await waitFor(() => {
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalled();
    });
  });
});
