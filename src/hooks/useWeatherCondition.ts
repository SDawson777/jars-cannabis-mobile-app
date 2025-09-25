import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export function useWeatherCondition() {
  const { debugInfo, weatherSimulation } = useContext(ThemeContext);

  // If simulation is enabled, use simulated condition
  if (weatherSimulation?.enabled && weatherSimulation?.condition) {
    return {
      condition: weatherSimulation.condition,
      isSimulated: true,
      debugInfo,
    };
  }

  // Otherwise, use actual weather condition if available
  if (debugInfo.actualCondition && debugInfo.weatherSource === 'openweather') {
    return {
      condition: debugInfo.actualCondition,
      isSimulated: false,
      debugInfo,
    };
  }

  // Fallback to time-based condition
  const hour = new Date().getHours();
  let timeBasedCondition = 'clear';

  if (hour >= 6 && hour < 12) {
    timeBasedCondition = 'sunny';
  } else if (hour >= 17 && hour < 20) {
    timeBasedCondition = 'clear';
  } else if (hour >= 12 && hour < 17) {
    timeBasedCondition = 'sunny';
  } else {
    timeBasedCondition = 'clear';
  }

  return {
    condition: timeBasedCondition,
    isSimulated: false,
    debugInfo,
  };
}
