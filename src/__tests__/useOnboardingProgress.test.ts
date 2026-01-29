import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useOnboardingProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load completed state from AsyncStorage', async () => {
    mockedAsyncStorage.getItem.mockImplementation((key: string) => {
      if (key === 'onboardingCompleted') return Promise.resolve('true');
      if (key === 'onboardingLastIndex') return Promise.resolve('3');
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => {
      expect(result.current.completed).toBe(true);
    });
    expect(result.current.lastIndex).toBe(3);
  });

  it('should default to not completed when no storage value', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => {
      expect(result.current.completed).toBe(false);
    });
    expect(result.current.lastIndex).toBe(0);
  });

  it('should set lastIndex and persist to storage', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(null);
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => expect(result.current.completed).toBe(false));

    await act(async () => {
      await result.current.setLastIndex(5);
    });

    expect(result.current.lastIndex).toBe(5);
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith('onboardingLastIndex', '5');
  });

  it('should complete onboarding and persist to storage', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(null);
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => expect(result.current.completed).toBe(false));

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(result.current.completed).toBe(true);
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith('onboardingCompleted', 'true');
  });

  it('should reset onboarding and clear storage', async () => {
    mockedAsyncStorage.getItem.mockImplementation((key: string) => {
      if (key === 'onboardingCompleted') return Promise.resolve('true');
      return Promise.resolve('2');
    });
    mockedAsyncStorage.removeItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => expect(result.current.completed).toBe(true));

    await act(async () => {
      await result.current.resetOnboarding();
    });

    expect(result.current.completed).toBe(false);
    expect(result.current.lastIndex).toBe(0);
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith('onboardingCompleted');
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith('onboardingLastIndex');
  });

  it('should handle AsyncStorage errors gracefully on load', async () => {
    mockedAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => {
      expect(result.current.completed).toBe(false);
    });
  });

  it('should handle AsyncStorage errors gracefully on setLastIndex', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(null);
    mockedAsyncStorage.setItem.mockRejectedValue(new Error('Write error'));

    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => expect(result.current.completed).toBe(false));

    // Should not throw
    await act(async () => {
      await result.current.setLastIndex(10);
    });

    // State should still be updated locally
    expect(result.current.lastIndex).toBe(10);
  });
});
