/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { useOfflineJournalQueue } from '../../hooks/useOfflineJournalQueue';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock('../../api/phase4Client', () => ({
  addJournal: jest.fn().mockResolvedValue({ id: 'j1' }),
  updateJournal: jest.fn().mockResolvedValue({ id: 'j1' }),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('useOfflineJournalQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  it('initially has pending false when queue is empty', async () => {
    const { result } = renderHook(() => useOfflineJournalQueue());

    await waitFor(() => {
      expect(result.current.pending).toBe(false);
    });
  });

  it('returns queueJournalAction function', () => {
    const { result } = renderHook(() => useOfflineJournalQueue());

    expect(result.current.queueJournalAction).toBeDefined();
    expect(typeof result.current.queueJournalAction).toBe('function');
  });

  it('queueJournalAction adds action to storage', async () => {
    const { result } = renderHook(() => useOfflineJournalQueue());

    await act(async () => {
      await result.current.queueJournalAction({
        type: 'create',
        payload: { productId: 'p1', rating: 5 },
      });
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'journalQueue',
      expect.stringContaining('p1')
    );
  });

  it('sets pending true after queuing action', async () => {
    const { result } = renderHook(() => useOfflineJournalQueue());

    await act(async () => {
      await result.current.queueJournalAction({
        type: 'create',
        payload: { productId: 'p1' },
      });
    });

    expect(result.current.pending).toBe(true);
  });

  it('registers NetInfo listener on mount', () => {
    renderHook(() => useOfflineJournalQueue());

    expect(mockNetInfo.addEventListener).toHaveBeenCalled();
  });

  it('processes queue when connected', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([{ type: 'create', payload: { productId: 'p1', rating: 4 } }])
    );

    renderHook(() => useOfflineJournalQueue());

    await waitFor(() => {
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('journalQueue');
    });
  });

  it('does not process queue when offline', async () => {
    mockNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);
    mockAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([{ type: 'create', payload: { productId: 'p1' } }])
    );

    renderHook(() => useOfflineJournalQueue());

    await waitFor(() => {
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  it('queues update actions', async () => {
    const { result } = renderHook(() => useOfflineJournalQueue());

    await act(async () => {
      await result.current.queueJournalAction({
        type: 'update',
        id: 'j123',
        payload: { productId: 'p1', notes: 'Updated notes' },
      });
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'journalQueue',
      expect.stringContaining('update')
    );
  });
});
