import { useMemo } from 'react';
import { mapWeatherCondition } from './useWeatherRecommendations';

// Extract and normalize a weatherFilter param from a navigation state object.
// Accepts a generic navigation instance supporting getState(); memoizes the
// normalized value to avoid redundant mapping.
export function useWeatherFilterParam(navigation: any): string | undefined {
  return useMemo(() => {
    try {
      const navState = navigation?.getState?.();
      const routes = navState?.routes || [];
      const current = routes[routes.length - 1];
      const raw = current?.params?.weatherFilter;
      if (!raw || typeof raw !== 'string') return undefined;
      return mapWeatherCondition(raw);
    } catch (_e) {
      return undefined;
    }
  }, [navigation]);
}

export default useWeatherFilterParam;
