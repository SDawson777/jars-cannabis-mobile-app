import request from 'supertest';
import {
  normalizeObservationToCondition,
  deriveConditionFromTime,
  getCurrentWeatherCondition,
} from '../src/services/weatherProvider';
import app from '../src/app';

describe('weatherProvider', () => {
  it('normalizes thunder', () => {
    expect(normalizeObservationToCondition({ thunder: true })).toBe('thunderstorm');
  });
  it('normalizes snow', () => {
    expect(normalizeObservationToCondition({ snow: true })).toBe('snow');
  });
  it('normalizes rain from precipitation', () => {
    expect(normalizeObservationToCondition({ precipitationMm: 1 })).toBe('rain');
  });
  it('maps low clouds to clear/sunny/partly', () => {
    expect(normalizeObservationToCondition({ cloudCoverPct: 0 })).toBe('clear');
    expect(normalizeObservationToCondition({ cloudCoverPct: 20 })).toBe('sunny');
    expect(normalizeObservationToCondition({ cloudCoverPct: 45 })).toBe('partly cloudy');
  });
  it('fallbacks to time mapping when no metrics', () => {
    const cond = deriveConditionFromTime(new Date('2024-01-01T05:00:00Z'));
    expect(typeof cond).toBe('string');
  });
});

describe('GET /recommendations/weather/auto', () => {
  it('derives from cloudCoverPct', async () => {
    const res = await request(app).get(
      '/api/v1/recommendations/weather/auto?cloudCoverPct=5&limit=1'
    );
    expect(res.status).toBe(200);
    expect(res.body.condition).toBeDefined();
    expect(res.body.derived).toBe(true);
  });
  it('handles thunder precedence', async () => {
    const res = await request(app).get('/api/v1/recommendations/weather/auto?thunder=true&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.condition).toBe('thunderstorm');
  });
});

describe('weatherProvider external API integration (mocked)', () => {
  const realEnv = process.env;
  const realFetch = (global as any).fetch;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...realEnv };
  });

  afterAll(() => {
    process.env = realEnv;
    (global as any).fetch = realFetch;
  });

  it('uses external API when WEATHER_API_URL is set and caches result', async () => {
    process.env.WEATHER_API_URL = 'https://example.test/weather';
    process.env.WEATHER_API_KEY = 'k';
    process.env.WEATHER_CACHE_TTL_MS = '1000';

    const mockJson = jest.fn().mockResolvedValue({ condition: 'Sunny' });
    const mockFetch = jest.fn().mockResolvedValue({ json: mockJson });
    (global as any).fetch = mockFetch;

    const c1 = await getCurrentWeatherCondition(42.1234, -83.9999);
    expect(typeof c1).toBe('string');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const c2 = await getCurrentWeatherCondition(42.1234, -83.9999);
    expect(c2).toBe(c1);
    // second call should hit cache
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('falls back gracefully when fetch throws', async () => {
    process.env.WEATHER_API_URL = 'https://example.test/weather';
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('network'));
    const c = await getCurrentWeatherCondition(10, 10);
    expect(typeof c).toBe('string');
  });
});
