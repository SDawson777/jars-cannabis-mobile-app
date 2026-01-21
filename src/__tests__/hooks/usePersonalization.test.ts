import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePersonalization } from '../../hooks/usePersonalization';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('usePersonalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('returns default enabled state of true', async () => {
    const { result } = renderHook(() => usePersonalization());
    expect(result.current[0]).toBe(true);
  });

  it('loads enabled state from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');
    const { result } = renderHook(() => usePersonalization());

    await waitFor(() => {
      expect(result.current[0]).toBe(false);
    });
  });

  it('loads true from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
    const { result } = renderHook(() => usePersonalization());

    await waitFor(() => {
      expect(result.current[0]).toBe(true);
    });
  });

  it('updates state and persists to AsyncStorage', async () => {
    const { result } = renderHook(() => usePersonalization());

    await act(async () => {
      await result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('personalization_enabled', 'false');
  });

  it('persists true value to AsyncStorage', async () => {
    const { result } = renderHook(() => usePersonalization());

    await act(async () => {
      await result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('personalization_enabled', 'true');
  });
});
