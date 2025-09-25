// backend/src/services/weatherProvider.ts
// Minimal weather provider abstraction so we can later plug in a real external API
// without changing the recommendations route logic. For now we derive a pseudo
// condition from provided query params (temp, clouds, precip) or fall back to
// time-of-day logic similar to the mobile placeholder.

export type WeatherObservation = {
  tempC?: number; // temperature in Celsius
  cloudCoverPct?: number; // 0-100
  precipitationMm?: number; // last hour
  thunder?: boolean;
  snow?: boolean;
  time?: Date;
};

// Normalize an observation into one of our supported condition keys.
export function normalizeObservationToCondition(obs: WeatherObservation): string {
  // thunder has highest precedence
  if (obs.thunder) return 'thunderstorm';
  if (obs.snow) return 'snow';
  const precip = obs.precipitationMm ?? 0;
  if (precip > 0.2) return 'rain';
  const clouds = obs.cloudCoverPct ?? 0;
  if (clouds < 10) return 'clear';
  if (clouds < 35) return 'sunny';
  if (clouds < 60) return 'partly cloudy';
  if (clouds < 85) return 'cloudy';
  return 'overcast';
}

// Fallback: time-of-day mapping used when no numeric data provided.
export function deriveConditionFromTime(date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 6 && hour < 11) return 'partly cloudy';
  if (hour >= 11 && hour < 16) return 'sunny';
  if (hour >= 16 && hour < 20) return 'cloudy';
  return 'overcast';
}

// Public API for route: Accept partial observation (maybe derived from a still-to-be-implemented
// external fetch) and return normalized condition. If no meaningful fields, fallback to time.
export async function getCurrentWeatherCondition(
  _lat?: number,
  _lon?: number,
  partial?: WeatherObservation
): Promise<string> {
  // 1) Use external API if configured (guarded by env) with simple in-memory caching.
  //    This is best-effort only. Any failure should gracefully fall back to local inference.
  try {
    // Lazy import to avoid circulars for tests
    const { env } = await import('../env');
    const url = env.WEATHER_API_URL;
    const apiKey = env.WEATHER_API_KEY;
    const ttl = Number(env.WEATHER_CACHE_TTL_MS || '300000');
    if (url && _lat != null && _lon != null) {
      const cacheKey = `${Math.round(_lat * 100) / 100},${Math.round(_lon * 100) / 100}`;
      const cached = getCachedCondition(cacheKey);
      if (cached) return cached;

      const qs = url.includes('?') ? `&lat=${_lat}&lon=${_lon}` : `?lat=${_lat}&lon=${_lon}`;
      const fetchUrl = `${url}${qs}`;
      const headers: Record<string, string> = {};
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      const fetchImpl: any = (global as any).fetch;
      if (typeof fetchImpl === 'function') {
        const resp = await fetchImpl(fetchUrl, { headers });
        if (resp && typeof resp.json === 'function') {
          const data = await resp.json();
          // Adapter: prefer explicit string condition when available
          let condition: string | undefined = (data && data.condition) || (data && data.weather);
          if (typeof condition === 'string') {
            condition = String(condition).toLowerCase();
          } else if (data && typeof data === 'object') {
            // Try to map common field names into our observation shape
            const obs: WeatherObservation = {
              cloudCoverPct:
                data.cloudCoverPct ??
                data.cloud_cover ??
                data.clouds ??
                data.clouds_pct ??
                undefined,
              precipitationMm:
                data.precipitationMm ?? data.precip_mm ?? data.rain_mm ?? data.precip ?? undefined,
              thunder: data.thunder ?? data.thunderstorm ?? false,
              snow: data.snow ?? !!data.snowfall,
            };
            condition = normalizeObservationToCondition(obs);
          }
          if (condition && typeof condition === 'string') {
            cacheCondition(cacheKey, condition, ttl);
            return condition;
          }
        }
      }
    }
  } catch {
    // Swallow and fall through to local inference
  }

  // 2) If caller supplied a partial observation, infer condition from it.
  if (
    partial &&
    (partial.cloudCoverPct != null ||
      partial.precipitationMm != null ||
      partial.thunder ||
      partial.snow)
  ) {
    return normalizeObservationToCondition(partial);
  }
  // 3) Final fallback to time-of-day heuristic.
  return deriveConditionFromTime();
}

// Very small in-memory cache (future-proof). For now not used by getCurrentWeatherCondition
// but retained for extension.
const memoryCache = new Map<string, { value: string; expires: number }>();
export function cacheCondition(key: string, value: string, ttlMs = 5 * 60 * 1000) {
  memoryCache.set(key, { value, expires: Date.now() + ttlMs });
}
export function getCachedCondition(key: string): string | undefined {
  const hit = memoryCache.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expires) {
    memoryCache.delete(key);
    return undefined;
  }
  return hit.value;
}
