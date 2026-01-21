/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePreferredStoreId } from '../../../store/usePreferredStore';

describe('usePreferredStore', () => {
  beforeEach(() => {
    // Clear state and AsyncStorage
    usePreferredStoreId.setState({ preferredStoreId: undefined });
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.setItem as jest.Mock).mockReset();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('starts with undefined preferredStoreId', () => {
    const { result } = renderHook(() => usePreferredStoreId(s => s));
    expect(result.current.preferredStoreId).toBeUndefined();
  });

  it('sets preferredStoreId', () => {
    const { result } = renderHook(() => usePreferredStoreId(s => s));

    act(() => {
      result.current.setPreferredStoreId('store-123');
    });

    expect(result.current.preferredStoreId).toBe('store-123');
  });

  it('persists preferredStoreId to AsyncStorage', () => {
    const { result } = renderHook(() => usePreferredStoreId(s => s));

    act(() => {
      result.current.setPreferredStoreId('store-456');
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('preferredStoreId', 'store-456');
  });

  it('hydrates preferredStoreId from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('stored-store-id');

    const { result } = renderHook(() => usePreferredStoreId(s => s));

    await act(async () => {
      await result.current.hydrate();
    });

    expect(result.current.preferredStoreId).toBe('stored-store-id');
  });

  it('handles hydration with null value', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => usePreferredStoreId(s => s));

    await act(async () => {
      await result.current.hydrate();
    });

    expect(result.current.preferredStoreId).toBeUndefined();
  });

  it('handles hydration error gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => usePreferredStoreId(s => s));

    // Should not throw
    await act(async () => {
      await result.current.hydrate();
    });

    expect(result.current.preferredStoreId).toBeUndefined();
  });

  it('can update preferredStoreId multiple times', () => {
    const { result } = renderHook(() => usePreferredStoreId(s => s));

    act(() => {
      result.current.setPreferredStoreId('first-store');
    });
    expect(result.current.preferredStoreId).toBe('first-store');

    act(() => {
      result.current.setPreferredStoreId('second-store');
    });
    expect(result.current.preferredStoreId).toBe('second-store');
  });
});
