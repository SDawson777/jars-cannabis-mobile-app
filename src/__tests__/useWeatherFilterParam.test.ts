import { renderHook } from '@testing-library/react-native';
import { useWeatherFilterParam } from '../hooks/useWeatherFilterParam';

// Mock the mapWeatherCondition function
jest.mock('../hooks/useWeatherRecommendations', () => ({
  mapWeatherCondition: jest.fn((condition: string) => {
    const map: Record<string, string> = {
      sunny: 'Clear',
      rainy: 'Rain',
      cloudy: 'Clouds',
    };
    return map[condition.toLowerCase()] || condition;
  }),
}));

describe('useWeatherFilterParam', () => {
  it('should return undefined when navigation is undefined', () => {
    const { result } = renderHook(() => useWeatherFilterParam(undefined));

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when getState is not available', () => {
    const mockNavigation = {};

    const { result } = renderHook(() => useWeatherFilterParam(mockNavigation));

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when routes are empty', () => {
    const mockNavigation = {
      getState: () => ({ routes: [] }),
    };

    const { result } = renderHook(() => useWeatherFilterParam(mockNavigation));

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when no weatherFilter param exists', () => {
    const mockNavigation = {
      getState: () => ({
        routes: [{ name: 'Shop', params: {} }],
      }),
    };

    const { result } = renderHook(() => useWeatherFilterParam(mockNavigation));

    expect(result.current).toBeUndefined();
  });

  it('should return mapped weather condition when param exists', () => {
    const mockNavigation = {
      getState: () => ({
        routes: [{ name: 'Shop', params: { weatherFilter: 'sunny' } }],
      }),
    };

    const { result } = renderHook(() => useWeatherFilterParam(mockNavigation));

    expect(result.current).toBe('Clear');
  });

  it('should use the last route in the stack', () => {
    const mockNavigation = {
      getState: () => ({
        routes: [
          { name: 'Home', params: { weatherFilter: 'rainy' } },
          { name: 'Shop', params: { weatherFilter: 'sunny' } },
        ],
      }),
    };

    const { result } = renderHook(() => useWeatherFilterParam(mockNavigation));

    expect(result.current).toBe('Clear');
  });

  it('should return undefined for non-string weatherFilter', () => {
    const mockNavigation = {
      getState: () => ({
        routes: [{ name: 'Shop', params: { weatherFilter: 123 } }],
      }),
    };

    const { result } = renderHook(() => useWeatherFilterParam(mockNavigation));

    expect(result.current).toBeUndefined();
  });

  it('should handle errors gracefully', () => {
    const mockNavigation = {
      getState: () => {
        throw new Error('Navigation error');
      },
    };

    const { result } = renderHook(() => useWeatherFilterParam(mockNavigation));

    expect(result.current).toBeUndefined();
  });
});
