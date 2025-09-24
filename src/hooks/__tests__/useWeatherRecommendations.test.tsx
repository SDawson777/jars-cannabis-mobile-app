import { renderHook, waitFor } from '@testing-library/react-native';

import { useWeatherRecommendations, mapWeatherCondition } from '../useWeatherRecommendations';

// Mock fetch
global.fetch = jest.fn();

describe('useWeatherRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() =>
      useWeatherRecommendations({ condition: 'sunny', enabled: false })
    );

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should fetch weather recommendations successfully', async () => {
    const mockResponse = {
      condition: 'sunny',
      tags: ['Energizing', 'Uplifting', 'Daytime'],
      description: 'Perfect sunny day picks for outdoor activities and energy',
      products: [
        {
          __id: '1',
          name: 'Test Product',
          price: 25.99,
          slug: 'test-product',
          type: 'Flower',
          image: { url: 'https://example.com/image.jpg' },
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useWeatherRecommendations({ condition: 'sunny' }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/recommendations/weather?condition=sunny&limit=24'
    );
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid weather condition' }),
    });

    const { result } = renderHook(() => useWeatherRecommendations({ condition: 'invalid' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Invalid weather condition');
  });

  it('should include location parameters when provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ condition: 'sunny', tags: [], description: '', products: [] }),
    });

    const { result } = renderHook(() =>
      useWeatherRecommendations({
        condition: 'sunny',
        city: 'Denver',
        state: 'CO',
        limit: 12,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/recommendations/weather?condition=sunny&limit=12&city=Denver&state=CO'
    );
  });

  it('should not fetch when condition is missing', () => {
    renderHook(() => useWeatherRecommendations({}));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', () => {
    renderHook(() => useWeatherRecommendations({ condition: 'sunny', enabled: false }));

    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('mapWeatherCondition', () => {
  it('should map weather descriptions to correct conditions', () => {
    expect(mapWeatherCondition('sunny')).toBe('sunny');
    expect(mapWeatherCondition('Sunny skies')).toBe('sunny');
    expect(mapWeatherCondition('clear sky')).toBe('clear');
    expect(mapWeatherCondition('Clear')).toBe('clear');
    expect(mapWeatherCondition('partly cloudy')).toBe('partly cloudy');
    expect(mapWeatherCondition('few clouds')).toBe('partly cloudy');
    expect(mapWeatherCondition('cloudy')).toBe('cloudy');
    expect(mapWeatherCondition('overcast')).toBe('overcast');
    expect(mapWeatherCondition('light rain')).toBe('rain');
    expect(mapWeatherCondition('drizzle')).toBe('rain');
    expect(mapWeatherCondition('snow')).toBe('snow');
    expect(mapWeatherCondition('thunderstorm')).toBe('thunderstorm');
    expect(mapWeatherCondition('thunder')).toBe('thunderstorm');
  });

  it('should return clear as default for unknown conditions', () => {
    expect(mapWeatherCondition('unknown condition')).toBe('clear');
    expect(mapWeatherCondition('')).toBe('clear');
  });

  it('should handle case insensitive input', () => {
    expect(mapWeatherCondition('SUNNY')).toBe('sunny');
    expect(mapWeatherCondition('Partly Cloudy')).toBe('partly cloudy');
    expect(mapWeatherCondition('THUNDERSTORM')).toBe('thunderstorm');
  });
});
