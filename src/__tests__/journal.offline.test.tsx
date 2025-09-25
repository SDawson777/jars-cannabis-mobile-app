import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { renderHook, waitFor } from '@testing-library/react-native';

import * as phase4Client from '../api/phase4Client';
import { useOfflineJournalQueue } from '../hooks/useOfflineJournalQueue';

// Mock all dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

jest.mock('../api/phase4Client', () => ({
  addJournal: jest.fn(),
  updateJournal: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockPhase4Client = phase4Client as jest.Mocked<typeof phase4Client>;

describe('useOfflineJournalQueue', () => {
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();
    mockNetInfo.addEventListener.mockReturnValue(mockUnsubscribe);
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with pending false when no queue exists', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useOfflineJournalQueue());

    await waitFor(
      () => {
        expect(result.current.pending).toBe(false);
      },
      { timeout: 1000 }
    );
  });

  it('should queue journal create action when offline', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOfflineJournalQueue());

    const action = {
      type: 'create' as const,
      payload: {
        productId: 'test-product',
        rating: 4.5,
        notes: 'Great product',
        tags: ['Focus', 'Creativity'],
      },
    };

    await waitFor(
      async () => {
        await result.current.queueJournalAction(action);
        expect(result.current.pending).toBe(true);
      },
      { timeout: 1000 }
    );

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('journalQueue', JSON.stringify([action]));
  });

  it('should queue journal update action when offline', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOfflineJournalQueue());

    const action = {
      type: 'update' as const,
      id: 'entry-123',
      payload: {
        productId: 'test-product',
        rating: 3.5,
        notes: 'Updated notes',
        tags: ['Relaxation'],
      },
    };

    await waitFor(
      async () => {
        await result.current.queueJournalAction(action);
        expect(result.current.pending).toBe(true);
      },
      { timeout: 1000 }
    );

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('journalQueue', JSON.stringify([action]));
  });

  it('should append to existing queue', async () => {
    const existingQueue = [{ type: 'create', payload: { productId: 'existing' } }];
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingQueue));
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOfflineJournalQueue());

    const newAction = {
      type: 'update' as const,
      id: 'entry-456',
      payload: { productId: 'test-product', rating: 4.0 },
    };

    await result.current.queueJournalAction(newAction);

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'journalQueue',
      JSON.stringify([...existingQueue, newAction])
    );
  });

  it('should process queue when online', async () => {
    const queuedActions = [
      {
        type: 'create',
        payload: { productId: 'test-1', rating: 4.0 },
      },
      {
        type: 'update',
        id: 'entry-123',
        payload: { productId: 'test-2', rating: 3.5 },
      },
    ];

    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queuedActions));
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);
    mockPhase4Client.addJournal.mockResolvedValue({});
    mockPhase4Client.updateJournal.mockResolvedValue({});

    const { result } = renderHook(() => useOfflineJournalQueue());

    await waitFor(
      () => {
        expect(mockPhase4Client.addJournal).toHaveBeenCalledWith({
          productId: 'test-1',
          rating: 4.0,
        });
        expect(mockPhase4Client.updateJournal).toHaveBeenCalledWith('entry-123', {
          productId: 'test-2',
          rating: 3.5,
        });
        expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('journalQueue');
        expect(result.current.pending).toBe(false);
      },
      { timeout: 2000 }
    );
  });

  it('should handle partial queue processing on API error', async () => {
    const queuedActions = [
      { type: 'create', payload: { productId: 'success' } },
      { type: 'create', payload: { productId: 'failure' } },
      { type: 'create', payload: { productId: 'not-processed' } },
    ];

    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queuedActions));
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);

    // First call succeeds, second fails
    mockPhase4Client.addJournal
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useOfflineJournalQueue());

    await waitFor(
      () => {
        expect(mockPhase4Client.addJournal).toHaveBeenCalledTimes(2);
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'journalQueue',
          JSON.stringify([
            { type: 'create', payload: { productId: 'failure' } },
            { type: 'create', payload: { productId: 'not-processed' } },
          ])
        );
        expect(result.current.pending).toBe(true);
      },
      { timeout: 2000 }
    );
  });

  it('should not process queue when offline', async () => {
    const queuedActions = [{ type: 'create', payload: { productId: 'test' } }];

    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queuedActions));
    mockNetInfo.fetch.mockResolvedValue({ isConnected: false } as any);

    const { result } = renderHook(() => useOfflineJournalQueue());

    await waitFor(
      () => {
        expect(mockPhase4Client.addJournal).not.toHaveBeenCalled();
        expect(result.current.pending).toBe(false);
      },
      { timeout: 1000 }
    );
  });

  it('should process queue when connectivity is restored', async () => {
    const queuedActions = [{ type: 'create', payload: { productId: 'test-reconnect' } }];

    let connectivityListener: ((state: any) => void) | undefined;
    mockNetInfo.addEventListener.mockImplementation(listener => {
      connectivityListener = listener;
      return mockUnsubscribe;
    });

    // Initially offline
    mockNetInfo.fetch.mockResolvedValueOnce({ isConnected: false } as any);
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(queuedActions));
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    mockPhase4Client.addJournal.mockResolvedValue({});

    const { result } = renderHook(() => useOfflineJournalQueue());

    // Wait for initial hook processing
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // Now mock online behavior for the listener
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);

    // Trigger connectivity change to online
    if (connectivityListener) {
      connectivityListener({ isConnected: true });
    }

    await waitFor(
      () => {
        expect(mockPhase4Client.addJournal).toHaveBeenCalledWith({
          productId: 'test-reconnect',
        });
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('journalQueue');
        expect(result.current.pending).toBe(false);
      },
      { timeout: 1000 }
    );
  });

  it('should clean up subscription on unmount', () => {
    const { unmount } = renderHook(() => useOfflineJournalQueue());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle subscription cleanup gracefully with different subscription types', () => {
    // Test function-style subscription
    mockNetInfo.addEventListener.mockReturnValue(mockUnsubscribe);
    const { unmount: unmount1 } = renderHook(() => useOfflineJournalQueue());
    unmount1();
    expect(mockUnsubscribe).toHaveBeenCalled();

    // Test object-style with unsubscribe method
    const mockObjectSub = { unsubscribe: jest.fn() };
    mockNetInfo.addEventListener.mockReturnValue(mockObjectSub as any);
    const { unmount: unmount2 } = renderHook(() => useOfflineJournalQueue());
    unmount2();
    expect(mockObjectSub.unsubscribe).toHaveBeenCalled();

    // Test object-style with remove method
    const mockObjectRemove = { remove: jest.fn() };
    mockNetInfo.addEventListener.mockReturnValue(mockObjectRemove as any);
    const { unmount: unmount3 } = renderHook(() => useOfflineJournalQueue());
    unmount3();
    expect(mockObjectRemove.remove).toHaveBeenCalled();
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true } as any);

    const { result } = renderHook(() => useOfflineJournalQueue());

    // Should not crash and should default to no pending state
    await waitFor(
      () => {
        expect(result.current.pending).toBe(false);
      },
      { timeout: 1000 }
    );
  });
});
