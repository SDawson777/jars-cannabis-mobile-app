import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useWeatherRecommendationsPreference } from '../hooks/useWeatherRecommendationsPreference';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useWeatherRecommendationsPreference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should default to enabled when no stored value', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useWeatherRecommendationsPreference());

    await waitFor(() => {
      expect(result.current[2]).toBe(true); // hydrated
    });

    expect(result.current[0]).toBe(true); // enabled
    expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('pref_weather_recs_enabled');
  });

  it('should restore enabled state from storage', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue('true');

    const { result } = renderHook(() => useWeatherRecommendationsPreference());

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('should restore disabled state from storage', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue('false');

    const { result } = renderHook(() => useWeatherRecommendationsPreference());

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toBe(false);
  });

  it('should update and persist preference', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue('true');
    mockedAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useWeatherRecommendationsPreference());

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    await act(async () => {
      await result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith('pref_weather_recs_enabled', 'false');
  });

  it('should handle storage errors gracefully', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue('true');
    mockedAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useWeatherRecommendationsPreference());

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    // Should not throw
    await act(async () => {
      await result.current[1](false);
    });

    // State should still update locally
    expect(result.current[0]).toBe(false);
  });

  it('should indicate hydration status', async () => {
    let resolveGetItem: (value: string | null) => void;
    mockedAsyncStorage.getItem.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveGetItem = resolve;
        })
    );

    const { result } = renderHook(() => useWeatherRecommendationsPreference());

    // Initially not hydrated
    expect(result.current[2]).toBe(false);

    await act(async () => {
      resolveGetItem!('true');
    });

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });
  });
});
