import { useState, useEffect, useCallback } from 'react';
import { fetchJson } from '../utils/apiClient';
import type { CMSProduct } from '../types/cms';

export interface WeatherRecommendationsResponse {
  condition: string;
  tags: string[];
  description: string;
  products: CMSProduct[];
  location?: {
    city: string;
    state: string;
  };
}

export interface UseWeatherRecommendationsOptions {
  condition?: string;
  city?: string;
  state?: string;
  limit?: number;
  enabled?: boolean;
}

interface UseWeatherRecommendationsReturn {
  data: WeatherRecommendationsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWeatherRecommendations(
  options: UseWeatherRecommendationsOptions = {}
): UseWeatherRecommendationsReturn {
  const { condition, city, state, limit = 24, enabled = true } = options;
  const [data, setData] = useState<WeatherRecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (signal?: AbortSignal) => {
    if (!condition || !enabled) {
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        condition,
        limit: limit.toString(),
      });

      if (city) params.append('city', city);
      if (state) params.append('state', state);

      const result = await fetchJson<WeatherRecommendationsResponse>(
        `/api/recommendations/weather?${params.toString()}`,
        { signal }
      );
      setData(result);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        // Fetch was aborted, bail silently
        return;
      }
      // Normalise ApiError-like objects thrown by fetchJson
      // so caller tests and UIs get a readable message.
      const msg =
        err instanceof Error
          ? err.message
          : err && (err as any).message
            ? (err as any).message
            : 'Failed to fetch weather recommendations';
      setError(msg);
      setData(null);
    } finally {
      setIsLoading(false);
    }

  }, [condition, city, state, limit, enabled]);

  useEffect(() => {
    const controller = new AbortController();
    // fire-and-forget; allow cleanup to cancel
    void fetchRecommendations(controller.signal);
    return () => controller.abort();
  }, [fetchRecommendations]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRecommendations,
  };
}

// Utility function to get current weather condition from weather APIs
export function mapWeatherCondition(weatherDescription: string): string {
  const description = weatherDescription.toLowerCase();

  if (description.includes('sunny') || description.includes('sun')) {
    return 'sunny';
  }
  if (description.includes('clear')) {
    return 'clear';
  }
  if (description.includes('partly cloudy') || description.includes('few clouds')) {
    return 'partly cloudy';
  }
  if (description.includes('cloudy') || description.includes('overcast')) {
    return description.includes('overcast') ? 'overcast' : 'cloudy';
  }
  if (description.includes('rain') || description.includes('drizzle')) {
    return 'rain';
  }
  if (description.includes('snow')) {
    return 'snow';
  }
  if (description.includes('thunder') || description.includes('storm')) {
    return 'thunderstorm';
  }

  return 'clear'; // Default fallback
}
