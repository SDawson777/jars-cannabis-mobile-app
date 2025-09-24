import {
  getCriteriaForWeatherCondition,
  getTagsForWeatherCondition,
  isValidWeatherCondition,
  getWeatherDescription,
  WEATHER_PRODUCT_MAP,
} from '../src/services/weatherRecs';

describe('Weather Recommendations Service', () => {
  describe('getCriteriaForWeatherCondition', () => {
    it('should return criteria for valid weather condition', () => {
      const criteria = getCriteriaForWeatherCondition('sunny');
      expect(criteria).toBeDefined();
      expect(criteria?.condition).toBe('sunny');
      expect(criteria?.categories).toContain('Concentrate');
      expect(criteria?.strainTypes).toContain('Sativa');
    });

    it('should handle case insensitive input', () => {
      const criteria1 = getCriteriaForWeatherCondition('SUNNY');
      const criteria2 = getCriteriaForWeatherCondition('Sunny');
      const criteria3 = getCriteriaForWeatherCondition('sunny');

      expect(criteria1).toEqual(criteria2);
      expect(criteria2).toEqual(criteria3);
    });

    it('should return null for invalid weather condition', () => {
      const criteria = getCriteriaForWeatherCondition('invalid-weather');
      expect(criteria).toBeNull();
    });

    it('should handle whitespace trimming', () => {
      const criteria = getCriteriaForWeatherCondition('  sunny  ');
      expect(criteria).toBeDefined();
      expect(criteria?.condition).toBe('sunny');
    });
  });

  describe('getTagsForWeatherCondition', () => {
    it('should return tags for valid weather condition', () => {
      const tags = getTagsForWeatherCondition('sunny');
      expect(tags).toBeDefined();
      expect(tags).toContain('Energizing');
      expect(tags).toContain('Uplifting');
      expect(tags).toContain('Daytime');
    });

    it('should return empty array for invalid weather condition', () => {
      const tags = getTagsForWeatherCondition('invalid-weather');
      expect(tags).toEqual([]);
    });
  });

  describe('isValidWeatherCondition', () => {
    it('should return true for valid weather conditions', () => {
      const validConditions = [
        'sunny',
        'clear',
        'partly cloudy',
        'cloudy',
        'overcast',
        'rain',
        'snow',
        'thunderstorm',
      ];

      validConditions.forEach(condition => {
        expect(isValidWeatherCondition(condition)).toBe(true);
      });
    });

    it('should return false for invalid weather conditions', () => {
      const invalidConditions = ['invalid', 'unknown', ''];

      invalidConditions.forEach(condition => {
        expect(isValidWeatherCondition(condition)).toBe(false);
      });
    });

    it('should handle case insensitive validation', () => {
      expect(isValidWeatherCondition('SUNNY')).toBe(true);
      expect(isValidWeatherCondition('Sunny')).toBe(true);
      expect(isValidWeatherCondition('sunny')).toBe(true);
    });
  });

  describe('getWeatherDescription', () => {
    it('should return description for valid weather condition', () => {
      const description = getWeatherDescription('sunny');
      expect(description).toBe('Perfect sunny day picks for outdoor activities and energy');
    });

    it('should return empty string for invalid weather condition', () => {
      const description = getWeatherDescription('invalid-weather');
      expect(description).toBe('');
    });
  });

  describe('WEATHER_PRODUCT_MAP', () => {
    it('should have all required weather conditions', () => {
      const expectedConditions = [
        'sunny',
        'clear',
        'partly cloudy',
        'cloudy',
        'overcast',
        'rain',
        'snow',
        'thunderstorm',
      ];

      expectedConditions.forEach(condition => {
        expect(WEATHER_PRODUCT_MAP[condition]).toBeDefined();
      });
    });

    it('should have valid structure for each weather condition', () => {
      Object.values(WEATHER_PRODUCT_MAP).forEach(criteria => {
        expect(criteria).toHaveProperty('condition');
        expect(criteria).toHaveProperty('tags');
        expect(criteria).toHaveProperty('description');
        expect(criteria).toHaveProperty('categories');
        expect(criteria).toHaveProperty('strainTypes');
        expect(criteria).toHaveProperty('searchTerms');

        expect(Array.isArray(criteria.tags)).toBe(true);
        expect(Array.isArray(criteria.categories)).toBe(true);
        expect(Array.isArray(criteria.strainTypes)).toBe(true);
        expect(Array.isArray(criteria.searchTerms)).toBe(true);

        expect(typeof criteria.condition).toBe('string');
        expect(typeof criteria.description).toBe('string');
      });
    });

    it('should have meaningful content for each condition', () => {
      Object.values(WEATHER_PRODUCT_MAP).forEach(criteria => {
        expect(criteria.condition.length).toBeGreaterThan(0);
        expect(criteria.description.length).toBeGreaterThan(0);
        expect(criteria.tags.length).toBeGreaterThan(0);
        expect(criteria.categories?.length || 0).toBeGreaterThan(0);
        expect(criteria.strainTypes?.length || 0).toBeGreaterThan(0);
        expect(criteria.searchTerms?.length || 0).toBeGreaterThan(0);
      });
    });

    it('should use valid ProductCategory enum values', () => {
      const validCategories = [
        'Flower',
        'PreRoll',
        'Edibles',
        'Vape',
        'Concentrate',
        'Beverage',
        'Tincture',
        'Topical',
        'Gear',
        'Other',
      ];

      Object.values(WEATHER_PRODUCT_MAP).forEach(criteria => {
        criteria.categories?.forEach(category => {
          expect(validCategories).toContain(category);
        });
      });
    });

    it('should use valid StrainType enum values', () => {
      const validStrainTypes = ['Sativa', 'Indica', 'Hybrid', 'CBD', 'None'];

      Object.values(WEATHER_PRODUCT_MAP).forEach(criteria => {
        criteria.strainTypes?.forEach(strainType => {
          expect(validStrainTypes).toContain(strainType);
        });
      });
    });
  });

  describe('Product filtering appropriateness', () => {
    it('should recommend energizing products for sunny weather', () => {
      const criteria = getCriteriaForWeatherCondition('sunny');
      expect(criteria?.strainTypes).toContain('Sativa');
      expect(criteria?.searchTerms).toContain('energizing');
      expect(criteria?.tags).toContain('Energizing');
    });

    it('should recommend relaxing products for rainy weather', () => {
      const criteria = getCriteriaForWeatherCondition('rain');
      expect(criteria?.strainTypes).toContain('Indica');
      expect(criteria?.searchTerms).toContain('cozy');
      expect(criteria?.tags).toContain('Cozy');
    });

    it('should recommend calming products for thunderstorms', () => {
      const criteria = getCriteriaForWeatherCondition('thunderstorm');
      expect(criteria?.strainTypes).toContain('CBD');
      expect(criteria?.searchTerms).toContain('calming');
      expect(criteria?.tags).toContain('Calming');
    });

    it('should recommend balanced products for partly cloudy weather', () => {
      const criteria = getCriteriaForWeatherCondition('partly cloudy');
      expect(criteria?.strainTypes).toContain('Hybrid');
      expect(criteria?.searchTerms).toContain('balanced');
      expect(criteria?.tags).toContain('Balanced');
    });
  });
});
