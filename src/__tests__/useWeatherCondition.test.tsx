import React from 'react';
import { renderHook } from '@testing-library/react-native';

import { useWeatherCondition } from '../hooks/useWeatherCondition';
import { ThemeContext } from '../context/ThemeContext';

describe('useWeatherCondition', () => {
  const createWrapper = (contextValue: any) => {
    return ({ children }: { children: React.ReactNode }) => (
      <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
    );
  };

  it('returns simulated condition when simulation is enabled', () => {
    const wrapper = createWrapper({
      weatherSimulation: { enabled: true, condition: 'rainy' },
      debugInfo: { actualCondition: 'sunny', weatherSource: 'openweather' },
    });

    const { result } = renderHook(() => useWeatherCondition(), { wrapper });

    expect(result.current.condition).toBe('rainy');
    expect(result.current.isSimulated).toBe(true);
  });

  it('returns actual condition from weather API when available', () => {
    const wrapper = createWrapper({
      weatherSimulation: { enabled: false },
      debugInfo: { actualCondition: 'cloudy', weatherSource: 'openweather' },
    });

    const { result } = renderHook(() => useWeatherCondition(), { wrapper });

    expect(result.current.condition).toBe('cloudy');
    expect(result.current.isSimulated).toBe(false);
  });

  it('falls back to time-based condition when no weather data available', () => {
    const wrapper = createWrapper({
      weatherSimulation: { enabled: false },
      debugInfo: {},
    });

    const { result } = renderHook(() => useWeatherCondition(), { wrapper });

    // Should return a time-based condition (sunny, clear, etc.)
    expect(['sunny', 'clear']).toContain(result.current.condition);
    expect(result.current.isSimulated).toBe(false);
  });

  it('returns morning sunny condition between 6-12', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T09:00:00'));

    const wrapper = createWrapper({
      weatherSimulation: { enabled: false },
      debugInfo: {},
    });

    const { result } = renderHook(() => useWeatherCondition(), { wrapper });

    expect(result.current.condition).toBe('sunny');

    jest.useRealTimers();
  });

  it('returns afternoon sunny condition between 12-17', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T14:00:00'));

    const wrapper = createWrapper({
      weatherSimulation: { enabled: false },
      debugInfo: {},
    });

    const { result } = renderHook(() => useWeatherCondition(), { wrapper });

    expect(result.current.condition).toBe('sunny');

    jest.useRealTimers();
  });

  it('returns evening clear condition between 17-20', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T18:00:00'));

    const wrapper = createWrapper({
      weatherSimulation: { enabled: false },
      debugInfo: {},
    });

    const { result } = renderHook(() => useWeatherCondition(), { wrapper });

    expect(result.current.condition).toBe('clear');

    jest.useRealTimers();
  });

  it('returns clear condition for night hours', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T22:00:00'));

    const wrapper = createWrapper({
      weatherSimulation: { enabled: false },
      debugInfo: {},
    });

    const { result } = renderHook(() => useWeatherCondition(), { wrapper });

    expect(result.current.condition).toBe('clear');

    jest.useRealTimers();
  });

  it('includes debugInfo in return value', () => {
    const debugInfo = { actualCondition: 'stormy', weatherSource: 'openweather' };
    const wrapper = createWrapper({
      weatherSimulation: { enabled: false },
      debugInfo,
    });

    const { result } = renderHook(() => useWeatherCondition(), { wrapper });

    expect(result.current.debugInfo).toEqual(debugInfo);
  });
});
