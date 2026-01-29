import { mapWeatherCondition } from '../hooks/useWeatherRecommendations';

describe('mapWeatherCondition', () => {
  describe('sunny conditions', () => {
    it('maps "sunny" to "sunny"', () => {
      expect(mapWeatherCondition('sunny')).toBe('sunny');
    });

    it('maps "Sunny" with uppercase to "sunny"', () => {
      expect(mapWeatherCondition('Sunny')).toBe('sunny');
    });

    it('maps "sun" to "sunny"', () => {
      expect(mapWeatherCondition('sun')).toBe('sunny');
    });

    it('maps "partly sunny" to "sunny"', () => {
      expect(mapWeatherCondition('partly sunny')).toBe('sunny');
    });

    it('maps "mostly sunny" to "sunny"', () => {
      expect(mapWeatherCondition('mostly sunny')).toBe('sunny');
    });
  });

  describe('clear conditions', () => {
    it('maps "clear" to "clear"', () => {
      expect(mapWeatherCondition('clear')).toBe('clear');
    });

    it('maps "Clear" with uppercase to "clear"', () => {
      expect(mapWeatherCondition('Clear')).toBe('clear');
    });

    it('maps "clear skies" to "clear"', () => {
      expect(mapWeatherCondition('clear skies')).toBe('clear');
    });

    it('maps "clear weather" to "clear"', () => {
      expect(mapWeatherCondition('clear weather')).toBe('clear');
    });
  });

  describe('partly cloudy conditions', () => {
    it('maps "partly cloudy" to "partly cloudy"', () => {
      expect(mapWeatherCondition('partly cloudy')).toBe('partly cloudy');
    });

    it('maps "Partly Cloudy" with uppercase to "partly cloudy"', () => {
      expect(mapWeatherCondition('Partly Cloudy')).toBe('partly cloudy');
    });

    it('maps "few clouds" to "partly cloudy"', () => {
      expect(mapWeatherCondition('few clouds')).toBe('partly cloudy');
    });

    it('maps "partly cloudy with sun" to "sunny" (sun checked first)', () => {
      // Function checks for 'sun' before 'partly cloudy', so returns 'sunny'
      expect(mapWeatherCondition('partly cloudy with sun')).toBe('sunny');
    });
  });

  describe('cloudy conditions', () => {
    it('maps "cloudy" to "cloudy"', () => {
      expect(mapWeatherCondition('cloudy')).toBe('cloudy');
    });

    it('maps "Cloudy" with uppercase to "cloudy"', () => {
      expect(mapWeatherCondition('Cloudy')).toBe('cloudy');
    });

    it('maps "mostly cloudy" to "cloudy"', () => {
      expect(mapWeatherCondition('mostly cloudy')).toBe('cloudy');
    });

    it('maps "broken clouds" to "clear" (no exact match for "cloudy")', () => {
      // "broken clouds" has "cloud" but not "cloudy", so no pattern matches - defaults to clear
      expect(mapWeatherCondition('broken clouds')).toBe('clear');
    });
  });

  describe('overcast conditions', () => {
    it('maps "overcast" to "overcast"', () => {
      expect(mapWeatherCondition('overcast')).toBe('overcast');
    });

    it('maps "Overcast" with uppercase to "overcast"', () => {
      expect(mapWeatherCondition('Overcast')).toBe('overcast');
    });

    it('maps "overcast skies" to "overcast"', () => {
      expect(mapWeatherCondition('overcast skies')).toBe('overcast');
    });

    it('prefers "overcast" over "cloudy" when both match', () => {
      expect(mapWeatherCondition('overcast and cloudy')).toBe('overcast');
    });
  });

  describe('rain conditions', () => {
    it('maps "rain" to "rain"', () => {
      expect(mapWeatherCondition('rain')).toBe('rain');
    });

    it('maps "Rain" with uppercase to "rain"', () => {
      expect(mapWeatherCondition('Rain')).toBe('rain');
    });

    it('maps "rainy" to "rain"', () => {
      expect(mapWeatherCondition('rainy')).toBe('rain');
    });

    it('maps "light rain" to "rain"', () => {
      expect(mapWeatherCondition('light rain')).toBe('rain');
    });

    it('maps "heavy rain" to "rain"', () => {
      expect(mapWeatherCondition('heavy rain')).toBe('rain');
    });

    it('maps "drizzle" to "rain"', () => {
      expect(mapWeatherCondition('drizzle')).toBe('rain');
    });

    it('maps "light drizzle" to "rain"', () => {
      expect(mapWeatherCondition('light drizzle')).toBe('rain');
    });

    it('maps "showers" to "rain"', () => {
      expect(mapWeatherCondition('rain showers')).toBe('rain');
    });
  });

  describe('snow conditions', () => {
    it('maps "snow" to "snow"', () => {
      expect(mapWeatherCondition('snow')).toBe('snow');
    });

    it('maps "Snow" with uppercase to "snow"', () => {
      expect(mapWeatherCondition('Snow')).toBe('snow');
    });

    it('maps "snowy" to "snow"', () => {
      expect(mapWeatherCondition('snowy')).toBe('snow');
    });

    it('maps "light snow" to "snow"', () => {
      expect(mapWeatherCondition('light snow')).toBe('snow');
    });

    it('maps "heavy snow" to "snow"', () => {
      expect(mapWeatherCondition('heavy snow')).toBe('snow');
    });

    it('maps "snow showers" to "snow"', () => {
      expect(mapWeatherCondition('snow showers')).toBe('snow');
    });
  });

  describe('thunderstorm conditions', () => {
    it('maps "thunder" to "thunderstorm"', () => {
      expect(mapWeatherCondition('thunder')).toBe('thunderstorm');
    });

    it('maps "Thunder" with uppercase to "thunderstorm"', () => {
      expect(mapWeatherCondition('Thunder')).toBe('thunderstorm');
    });

    it('maps "thunderstorm" to "thunderstorm"', () => {
      expect(mapWeatherCondition('thunderstorm')).toBe('thunderstorm');
    });

    it('maps "storm" to "thunderstorm"', () => {
      expect(mapWeatherCondition('storm')).toBe('thunderstorm');
    });

    it('maps "thunderstorms" plural to "thunderstorm"', () => {
      expect(mapWeatherCondition('thunderstorms')).toBe('thunderstorm');
    });

    it('maps "stormy weather" to "thunderstorm"', () => {
      expect(mapWeatherCondition('stormy weather')).toBe('thunderstorm');
    });
  });

  describe('priority and fallback', () => {
    it('checks partly cloudy before cloudy', () => {
      expect(mapWeatherCondition('partly cloudy')).toBe('partly cloudy');
    });

    it('checks overcast before cloudy', () => {
      expect(mapWeatherCondition('overcast')).toBe('overcast');
    });

    it('returns "clear" as default fallback', () => {
      expect(mapWeatherCondition('unknown condition')).toBe('clear');
    });

    it('returns "clear" for empty string', () => {
      expect(mapWeatherCondition('')).toBe('clear');
    });

    it('returns "clear" for random text', () => {
      expect(mapWeatherCondition('xyz abc 123')).toBe('clear');
    });

    it('returns "clear" for special characters', () => {
      expect(mapWeatherCondition('!!!@@@###')).toBe('clear');
    });
  });

  describe('case insensitivity', () => {
    it('handles UPPERCASE descriptions', () => {
      expect(mapWeatherCondition('SUNNY')).toBe('sunny');
      expect(mapWeatherCondition('RAIN')).toBe('rain');
      expect(mapWeatherCondition('SNOW')).toBe('snow');
    });

    it('handles MixedCase descriptions', () => {
      expect(mapWeatherCondition('PaRtLy ClOuDy')).toBe('partly cloudy');
      expect(mapWeatherCondition('ThUnDeRsToRm')).toBe('thunderstorm');
    });

    it('handles lowercase descriptions', () => {
      expect(mapWeatherCondition('clear skies')).toBe('clear');
      expect(mapWeatherCondition('light drizzle')).toBe('rain');
    });
  });

  describe('complex weather descriptions', () => {
    it('handles "Partly Cloudy with a Chance of Rain"', () => {
      // Checks partly cloudy first, so returns that
      expect(mapWeatherCondition('Partly Cloudy with a Chance of Rain')).toBe('partly cloudy');
    });

    it('handles "Light Rain and Thunder"', () => {
      // Checks rain before thunder, so returns rain
      expect(mapWeatherCondition('Light Rain and Thunder')).toBe('rain');
    });

    it('handles "Cloudy with Snow Flurries"', () => {
      // Checks cloudy before snow
      expect(mapWeatherCondition('Cloudy with Snow Flurries')).toBe('cloudy');
    });

    it('handles "Fog" (not in conditions)', () => {
      expect(mapWeatherCondition('Fog')).toBe('clear');
    });

    it('handles "Haze" (not in conditions)', () => {
      expect(mapWeatherCondition('Haze')).toBe('clear');
    });
  });

  describe('edge cases', () => {
    it('handles leading/trailing whitespace', () => {
      expect(mapWeatherCondition('  sunny  ')).toBe('sunny');
      expect(mapWeatherCondition('  rain  ')).toBe('rain');
    });

    it('handles descriptions with extra spaces (matches "cloudy" not "partly cloudy")', () => {
      // "partly   cloudy" doesn't exactly match "partly cloudy" string, but includes "cloudy"
      expect(mapWeatherCondition('partly   cloudy')).toBe('cloudy');
    });

    it('handles very long descriptions', () => {
      const long = 'It is a very sunny day with clear blue skies and warm weather';
      expect(mapWeatherCondition(long)).toBe('sunny');
    });

    it('handles descriptions with numbers', () => {
      expect(mapWeatherCondition('Sunny 75 degrees')).toBe('sunny');
    });

    it('handles descriptions with punctuation', () => {
      expect(mapWeatherCondition('Cloudy, with rain possible.')).toBe('cloudy');
    });
  });
});
