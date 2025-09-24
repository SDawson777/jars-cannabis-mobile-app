import { ProductCategory, StrainType } from '@prisma/client';

// Weather-to-product filtering criteria
export interface WeatherProductCriteria {
  condition: string;
  tags: string[]; // For display purposes
  description: string;
  categories?: ProductCategory[];
  strainTypes?: StrainType[];
  brands?: string[];
  searchTerms?: string[]; // For name/description matching
}

export const WEATHER_PRODUCT_MAP: Record<string, WeatherProductCriteria> = {
  sunny: {
    condition: 'sunny',
    categories: ['Concentrate', 'Vape'],
    strainTypes: ['Sativa'],
    brands: [],
    searchTerms: ['energizing', 'uplifting', 'citrus', 'tropical', 'outdoor', 'daytime'],
    tags: ['Energizing', 'Uplifting', 'Daytime'],
    description: 'Perfect sunny day picks for outdoor activities and energy',
  },
  clear: {
    condition: 'clear',
    categories: ['PreRoll', 'Edibles'],
    strainTypes: ['Sativa', 'Hybrid'],
    brands: [],
    searchTerms: ['clear-headed', 'focus', 'creative', 'social', 'bright'],
    tags: ['Clear-Headed', 'Focus', 'Social'],
    description: 'Clear weather calls for clear-minded products',
  },
  'partly cloudy': {
    condition: 'partly cloudy',
    categories: ['Edibles', 'Tincture'],
    strainTypes: ['Hybrid'],
    brands: [],
    searchTerms: ['balanced', 'mellow', 'versatile', 'afternoon', 'mild'],
    tags: ['Balanced', 'Mellow', 'Versatile'],
    description: 'Balanced choices for those in-between moments',
  },
  cloudy: {
    condition: 'cloudy',
    categories: ['Edibles', 'Tincture'],
    strainTypes: ['Indica', 'Hybrid'],
    brands: [],
    searchTerms: ['relaxing', 'calming', 'cozy', 'indoor', 'comfort'],
    tags: ['Relaxing', 'Calming', 'Cozy'],
    description: 'Cloudy skies, cozy vibes - perfect for indoor relaxation',
  },
  overcast: {
    condition: 'overcast',
    categories: ['Tincture', 'Topical'],
    strainTypes: ['Indica', 'CBD'],
    brands: [],
    searchTerms: ['therapeutic', 'wellness', 'mood-boost', 'comfort', 'soothing'],
    tags: ['Therapeutic', 'Wellness', 'Mood-Boost'],
    description: 'Overcast weather wellness essentials',
  },
  rain: {
    condition: 'rain',
    categories: ['Edibles', 'Beverage'],
    strainTypes: ['Indica', 'CBD', 'Hybrid'],
    brands: [],
    searchTerms: ['cozy', 'indoor', 'comfort', 'relaxation', 'warm', 'soothing'],
    tags: ['Cozy', 'Indoor', 'Comfort'],
    description: 'Rainy day comfort essentials for staying in',
  },
  snow: {
    condition: 'snow',
    categories: ['Concentrate', 'Topical'],
    strainTypes: ['Indica', 'CBD'],
    brands: [],
    searchTerms: ['warming', 'therapeutic', 'winter', 'comfort', 'muscle-relief'],
    tags: ['Warming', 'Therapeutic', 'Winter'],
    description: 'Snow day essentials for warmth and comfort',
  },
  thunderstorm: {
    condition: 'thunderstorm',
    categories: ['Tincture', 'Edibles'],
    strainTypes: ['CBD', 'Indica'],
    brands: [],
    searchTerms: ['calming', 'anxiety-relief', 'storm', 'peace', 'tranquil'],
    tags: ['Calming', 'Anxiety-Relief', 'Peace'],
    description: 'Storm-weather stress relief and calming products',
  },
};

export function getCriteriaForWeatherCondition(condition: string): WeatherProductCriteria | null {
  const normalizedCondition = condition.toLowerCase().trim();
  return WEATHER_PRODUCT_MAP[normalizedCondition] || null;
}

export function getTagsForWeatherCondition(condition: string): string[] {
  const criteria = getCriteriaForWeatherCondition(condition);
  return criteria ? criteria.tags : [];
}

export function isValidWeatherCondition(condition: string): boolean {
  const normalizedCondition = condition.toLowerCase().trim();
  return normalizedCondition in WEATHER_PRODUCT_MAP;
}

export function getWeatherDescription(condition: string): string {
  const criteria = getCriteriaForWeatherCondition(condition);
  return criteria ? criteria.description : '';
}
