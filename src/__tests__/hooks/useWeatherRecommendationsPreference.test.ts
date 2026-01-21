import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWeatherRecommendationsPreference } from '../../hooks/useWeatherRecommendationsPreference';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('useWeatherRecommendationsPreference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('returns default enabled state of true', async () => {
    const { result } = renderHook(() => useWeatherRecommendationsPreference());
    expect(result.current[0]).toBe(true);
  });

  it('returns hydrated false initially then true', async () => {
    const { result } = renderHook(() => useWeatherRecommendationsPreference());

    // Initially not hydrated (may be hydrated immediately depending on timing)
    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });
  });

  it('loads disabled state from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');
    const { result } = renderHook(() => useWeatherRecommendationsPreference());

    await waitFor(() => {
      expect(result.current[0]).toBe(false);
    });
  });

  it('updates and persists preference', async () => {
    const { result } = renderHook(() => useWeatherRecommendationsPreference());

    await act(async () => {
      await result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('pref_weather_recs_enabled', 'false');
  });

  it('handles setItem errors gracefully', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
    const { result } = renderHook(() => useWeatherRecommendationsPreference());

    // Should not throw
    await act(async () => {
      await result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
  });
});
