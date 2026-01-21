/**
 * @jest-environment jsdom
 */

import { act, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { usePreferredStore } from '../../state/store';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('preferredStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    mockSecureStore.setItemAsync.mockResolvedValue();

    // Reset store to initial state
    act(() => {
      usePreferredStore.setState({
        preferredStore: undefined,
      });
    });
  });

  it('has initial preferredStore as undefined', () => {
    const { preferredStore } = usePreferredStore.getState();
    expect(preferredStore).toBeUndefined();
  });

  it('setPreferredStore updates the store', () => {
    const { setPreferredStore } = usePreferredStore.getState();
    const store = { id: 's1', name: 'Test Store', slug: 'test-store' };

    act(() => {
      setPreferredStore(store as any);
    });

    expect(usePreferredStore.getState().preferredStore).toEqual(store);
  });

  it('setPreferredStore persists to SecureStore', async () => {
    const { setPreferredStore } = usePreferredStore.getState();
    const store = { id: 's1', name: 'Test Store', slug: 'test-store' };

    act(() => {
      setPreferredStore(store as any);
    });

    await waitFor(() => {
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'preferredStore',
        JSON.stringify(store)
      );
    });
  });

  it('hydrate loads store from SecureStore', async () => {
    const store = { id: 's1', name: 'Saved Store', slug: 'saved-store' };
    mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(store));

    const { hydrate } = usePreferredStore.getState();

    await act(async () => {
      await hydrate();
    });

    expect(usePreferredStore.getState().preferredStore).toEqual(store);
  });

  it('hydrate handles null value gracefully', async () => {
    mockSecureStore.getItemAsync.mockResolvedValue(null);

    const { hydrate } = usePreferredStore.getState();

    await act(async () => {
      await hydrate();
    });

    expect(usePreferredStore.getState().preferredStore).toBeUndefined();
  });

  it('hydrate handles errors gracefully', async () => {
    mockSecureStore.getItemAsync.mockRejectedValue(new Error('Storage error'));

    const { hydrate } = usePreferredStore.getState();

    // Should not throw
    await act(async () => {
      await hydrate();
    });

    expect(usePreferredStore.getState().preferredStore).toBeUndefined();
  });

  it('setPreferredStore handles storage error gracefully', async () => {
    mockSecureStore.setItemAsync.mockRejectedValue(new Error('Storage error'));

    const { setPreferredStore } = usePreferredStore.getState();
    const store = { id: 's1', name: 'Test Store', slug: 'test-store' };

    // Should not throw
    act(() => {
      setPreferredStore(store as any);
    });

    // State should still be updated
    expect(usePreferredStore.getState().preferredStore).toEqual(store);
  });
});
