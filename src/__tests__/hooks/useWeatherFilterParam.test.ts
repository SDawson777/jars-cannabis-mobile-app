import { renderHook } from '@testing-library/react-native';
import { useWeatherFilterParam } from '../../hooks/useWeatherFilterParam';

// Mock the mapWeatherCondition import
jest.mock('../../hooks/useWeatherRecommendations', () => ({
  mapWeatherCondition: (val: string) => val.toLowerCase(),
}));

describe('useWeatherFilterParam', () => {
  it('returns undefined when navigation is null', () => {
    const { result } = renderHook(() => useWeatherFilterParam(null));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined when navigation has no getState', () => {
    const { result } = renderHook(() => useWeatherFilterParam({}));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined when routes array is empty', () => {
    const navigation = {
      getState: () => ({ routes: [] }),
    };
    const { result } = renderHook(() => useWeatherFilterParam(navigation));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined when current route has no params', () => {
    const navigation = {
      getState: () => ({
        routes: [{ name: 'Home' }],
      }),
    };
    const { result } = renderHook(() => useWeatherFilterParam(navigation));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined when weatherFilter param is not a string', () => {
    const navigation = {
      getState: () => ({
        routes: [{ name: 'Home', params: { weatherFilter: 123 } }],
      }),
    };
    const { result } = renderHook(() => useWeatherFilterParam(navigation));
    expect(result.current).toBeUndefined();
  });

  it('returns mapped weather condition when valid', () => {
    const navigation = {
      getState: () => ({
        routes: [{ name: 'Shop', params: { weatherFilter: 'SUNNY' } }],
      }),
    };
    const { result } = renderHook(() => useWeatherFilterParam(navigation));
    expect(result.current).toBe('sunny');
  });

  it('returns last route weatherFilter with multiple routes', () => {
    const navigation = {
      getState: () => ({
        routes: [
          { name: 'Home', params: {} },
          { name: 'Shop', params: { weatherFilter: 'RAINY' } },
        ],
      }),
    };
    const { result } = renderHook(() => useWeatherFilterParam(navigation));
    expect(result.current).toBe('rainy');
  });
});
