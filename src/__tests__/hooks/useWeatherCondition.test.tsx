/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useWeatherCondition } from '../../hooks/useWeatherCondition';
import { ThemeContext } from '../../context/ThemeContext';

const createWrapper = (contextValue: any) => {
  return ({ children }: { children: React.ReactNode }) => (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );
};

describe('useWeatherCondition', () => {
  beforeEach(() => {
    // Reset time to a known value
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T14:00:00')); // 2 PM
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns simulated condition when enabled', () => {
    const contextValue = {
      debugInfo: {},
      weatherSimulation: {
        enabled: true,
        condition: 'rainy',
      },
    };

    const { result } = renderHook(() => useWeatherCondition(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.condition).toBe('rainy');
    expect(result.current.isSimulated).toBe(true);
  });

  it('returns actual weather condition when available', () => {
    const contextValue = {
      debugInfo: {
        actualCondition: 'cloudy',
        weatherSource: 'openweather',
      },
      weatherSimulation: {
        enabled: false,
      },
    };

    const { result } = renderHook(() => useWeatherCondition(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.condition).toBe('cloudy');
    expect(result.current.isSimulated).toBe(false);
  });

  it('prefers simulation over actual weather', () => {
    const contextValue = {
      debugInfo: {
        actualCondition: 'cloudy',
        weatherSource: 'openweather',
      },
      weatherSimulation: {
        enabled: true,
        condition: 'sunny',
      },
    };

    const { result } = renderHook(() => useWeatherCondition(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.condition).toBe('sunny');
    expect(result.current.isSimulated).toBe(true);
  });

  it('falls back to time-based condition - morning', () => {
    jest.setSystemTime(new Date('2024-01-15T08:00:00')); // 8 AM

    const contextValue = {
      debugInfo: {},
      weatherSimulation: {},
    };

    const { result } = renderHook(() => useWeatherCondition(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.condition).toBe('sunny');
    expect(result.current.isSimulated).toBe(false);
  });

  it('falls back to time-based condition - afternoon', () => {
    jest.setSystemTime(new Date('2024-01-15T14:00:00')); // 2 PM

    const contextValue = {
      debugInfo: {},
      weatherSimulation: {},
    };

    const { result } = renderHook(() => useWeatherCondition(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.condition).toBe('sunny');
    expect(result.current.isSimulated).toBe(false);
  });

  it('falls back to time-based condition - evening', () => {
    jest.setSystemTime(new Date('2024-01-15T18:00:00')); // 6 PM

    const contextValue = {
      debugInfo: {},
      weatherSimulation: {},
    };

    const { result } = renderHook(() => useWeatherCondition(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.condition).toBe('clear');
    expect(result.current.isSimulated).toBe(false);
  });

  it('falls back to time-based condition - night', () => {
    jest.setSystemTime(new Date('2024-01-15T22:00:00')); // 10 PM

    const contextValue = {
      debugInfo: {},
      weatherSimulation: {},
    };

    const { result } = renderHook(() => useWeatherCondition(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.condition).toBe('clear');
    expect(result.current.isSimulated).toBe(false);
  });

  it('includes debugInfo in result', () => {
    const debugInfo = { test: 'data' };
    const contextValue = {
      debugInfo,
      weatherSimulation: {},
    };

    const { result } = renderHook(() => useWeatherCondition(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.debugInfo).toEqual(debugInfo);
  });
});
