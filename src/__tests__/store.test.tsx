import { renderHook, waitFor } from '@testing-library/react-native';
import { usePreferredStore } from '../state/store';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('usePreferredStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    // Reset the Zustand store before each test
    usePreferredStore.setState({ preferredStore: undefined });
  });

  it('should set preferred store', async () => {
    const { result } = renderHook(() => usePreferredStore());

    const store = { id: 'store-1', name: 'Test Store' } as any;
    result.current.setPreferredStore(store);

    await waitFor(() => {
      expect(result.current.preferredStore).toEqual(store);
    });
  });

  it('should hydrate preferred store from SecureStore', async () => {
    const store = { id: 'store-1', name: 'Test Store' };
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify(store));

    const { result } = renderHook(() => usePreferredStore());

    await result.current.hydrate();

    await waitFor(() => {
      expect(result.current.preferredStore).toEqual(store);
    });
  });

  it('should handle hydration error gracefully', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => usePreferredStore());

    await result.current.hydrate();

    // After hydration error, store should remain undefined
    expect(result.current.preferredStore).toBeUndefined();
  });

  it('should save to SecureStore when setting preferred store', () => {
    const { result } = renderHook(() => usePreferredStore());

    const store = { id: 'store-1', name: 'Test Store' } as any;
    result.current.setPreferredStore(store);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('preferredStore', JSON.stringify(store));
  });
});
