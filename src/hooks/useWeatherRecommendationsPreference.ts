import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Simple persisted boolean preference controlling visibility / network usage of the
// weather recommendations rail. Defaults to true to preserve current behavior for
// existing users; can be toggled off in settings screen (to be wired).
// Storage key kept short & namespaced.
const STORAGE_KEY = 'pref_weather_recs_enabled';

export function useWeatherRecommendationsPreference(): [
  boolean,
  (v: boolean) => Promise<void>,
  boolean,
] {
  const [enabled, setEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(val => {
        if (!mounted) return;
        if (val !== null) setEnabled(val === 'true');
      })
      .finally(() => mounted && setHydrated(true));
    return () => {
      mounted = false;
    };
  }, []);

  const update = async (v: boolean) => {
    setEnabled(v);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, v ? 'true' : 'false');
    } catch (_e) {
      // Non-fatal: swallow persistence errors – preference will fallback next launch.
    }
  };

  return [enabled, update, hydrated];
}

export default useWeatherRecommendationsPreference;
