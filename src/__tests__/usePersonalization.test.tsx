import { renderHook } from '@testing-library/react-native';
import { usePersonalization } from '../hooks/usePersonalization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, waitFor } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('usePersonalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should return default enabled state', async () => {
    const { result } = renderHook(() => usePersonalization());

    await waitFor(() => {
      expect(result.current[0]).toBe(true);
    });
  });

  it('should load saved state from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');

    const { result } = renderHook(() => usePersonalization());

    await waitFor(() => {
      expect(result.current[0]).toBe(false);
    });
  });

  it('should update state and save to AsyncStorage', async () => {
    const { result } = renderHook(() => usePersonalization());

    await act(async () => {
      await result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('personalization_enabled', 'false');
  });

  it('should save true state to AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');

    const { result } = renderHook(() => usePersonalization());

    await waitFor(() => {
      expect(result.current[0]).toBe(false);
    });

    await act(async () => {
      await result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('personalization_enabled', 'true');
  });
});
