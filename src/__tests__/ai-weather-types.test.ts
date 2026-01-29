import type {
  WeatherRecommendationsResponse,
  UseWeatherRecommendationsOptions,
} from '../hooks/useWeatherRecommendations';
import type {
  RecommendProductsRequest,
  ProductRecommendation,
  RecommendationsResponse,
  BudtenderRequest,
  BudtenderResponse,
} from '../hooks/useAI';
import type { CMSProduct } from '../types/cms';

describe('AI and weather recommendation types', () => {
  describe('WeatherRecommendationsResponse', () => {
    it('creates a valid weather recommendations response', () => {
      const response: WeatherRecommendationsResponse = {
        condition: 'sunny',
        tags: ['energetic', 'uplifting'],
        description: 'Perfect weather for outdoor activities with energizing strains',
        products: [
          { __id: 'prod-1', name: 'Sour Diesel', slug: 'sour-diesel', price: 50.0, type: 'flower' },
        ],
      };

      expect(response.condition).toBe('sunny');
      expect(response.tags).toContain('energetic');
      expect(response.products).toHaveLength(1);
    });

    it('supports optional location', () => {
      const response: WeatherRecommendationsResponse = {
        condition: 'rainy',
        tags: ['relaxing', 'cozy'],
        description: 'Rainy day recommendations',
        products: [],
        location: {
          city: 'Seattle',
          state: 'WA',
        },
      };

      expect(response.location?.city).toBe('Seattle');
      expect(response.location?.state).toBe('WA');
    });

    it('handles different weather conditions', () => {
      const conditions: WeatherRecommendationsResponse[] = [
        {
          condition: 'sunny',
          tags: ['energetic'],
          description: 'Sunny day',
          products: [],
        },
        {
          condition: 'rainy',
          tags: ['relaxing'],
          description: 'Rainy day',
          products: [],
        },
        {
          condition: 'cloudy',
          tags: ['balanced'],
          description: 'Cloudy day',
          products: [],
        },
        {
          condition: 'snowy',
          tags: ['cozy'],
          description: 'Snowy day',
          products: [],
        },
      ];

      expect(conditions).toHaveLength(4);
      expect(conditions.map(c => c.condition)).toContain('snowy');
    });

    it('supports multiple product recommendations', () => {
      const products: CMSProduct[] = [
        { __id: '1', name: 'Product 1', slug: 'product-1', price: 30.0, type: 'flower' },
        { __id: '2', name: 'Product 2', slug: 'product-2', price: 40.0, type: 'edible' },
        { __id: '3', name: 'Product 3', slug: 'product-3', price: 50.0, type: 'vape' },
      ];

      const response: WeatherRecommendationsResponse = {
        condition: 'sunny',
        tags: ['energetic', 'social'],
        description: 'Great for outdoor activities',
        products,
      };

      expect(response.products).toHaveLength(3);
    });

    it('supports multiple tags', () => {
      const response: WeatherRecommendationsResponse = {
        condition: 'partly-cloudy',
        tags: ['balanced', 'creative', 'social', 'relaxed'],
        description: 'Versatile recommendations',
        products: [],
      };

      expect(response.tags).toHaveLength(4);
      expect(response.tags).toContain('creative');
    });
  });

  describe('UseWeatherRecommendationsOptions', () => {
    it('creates valid options with condition', () => {
      const options: UseWeatherRecommendationsOptions = {
        condition: 'sunny',
      };

      expect(options.condition).toBe('sunny');
    });

    it('supports city and state location', () => {
      const options: UseWeatherRecommendationsOptions = {
        city: 'Denver',
        state: 'CO',
      };

      expect(options.city).toBe('Denver');
      expect(options.state).toBe('CO');
    });

    it('supports limit parameter', () => {
      const options: UseWeatherRecommendationsOptions = {
        condition: 'rainy',
        limit: 10,
      };

      expect(options.limit).toBe(10);
    });

    it('supports enabled flag', () => {
      const options: UseWeatherRecommendationsOptions = {
        condition: 'sunny',
        enabled: true,
      };

      expect(options.enabled).toBe(true);
    });

    it('supports all options together', () => {
      const options: UseWeatherRecommendationsOptions = {
        condition: 'cloudy',
        city: 'San Francisco',
        state: 'CA',
        limit: 5,
        enabled: true,
      };

      expect(options.condition).toBe('cloudy');
      expect(options.city).toBe('San Francisco');
      expect(options.limit).toBe(5);
      expect(options.enabled).toBe(true);
    });
  });

  describe('RecommendProductsRequest', () => {
    it('creates valid recommendation request', () => {
      const request: RecommendProductsRequest = {
        desiredEffects: ['relaxation', 'pain-relief'],
        experienceLevel: 'regular',
        budgetLevel: 'medium',
      };

      expect(request.desiredEffects).toContain('relaxation');
      expect(request.experienceLevel).toBe('regular');
      expect(request.budgetLevel).toBe('medium');
    });

    it('supports new user experience level', () => {
      const request: RecommendProductsRequest = {
        desiredEffects: ['sleep'],
        experienceLevel: 'new',
        budgetLevel: 'low',
      };

      expect(request.experienceLevel).toBe('new');
    });

    it('supports heavy user experience level', () => {
      const request: RecommendProductsRequest = {
        desiredEffects: ['creativity'],
        experienceLevel: 'heavy',
        budgetLevel: 'high',
      };

      expect(request.experienceLevel).toBe('heavy');
    });

    it('supports optional preferred categories', () => {
      const request: RecommendProductsRequest = {
        desiredEffects: ['energy', 'focus'],
        experienceLevel: 'regular',
        budgetLevel: 'medium',
        preferredCategories: ['flower', 'vape'],
      };

      expect(request.preferredCategories).toContain('flower');
      expect(request.preferredCategories).toHaveLength(2);
    });

    it('supports multiple desired effects', () => {
      const request: RecommendProductsRequest = {
        desiredEffects: ['relaxation', 'pain-relief', 'sleep', 'anxiety-relief'],
        experienceLevel: 'regular',
        budgetLevel: 'medium',
      };

      expect(request.desiredEffects).toHaveLength(4);
    });
  });

  describe('ProductRecommendation', () => {
    it('creates valid product recommendation', () => {
      const recommendation: ProductRecommendation = {
        id: 'prod-1',
        name: 'Blue Dream',
        brand: 'Premium Cannabis Co.',
        category: 'flower',
        price: 45.0,
        score: 0.92,
        reasoning: 'High match for desired effects and experience level',
      };

      expect(recommendation.name).toBe('Blue Dream');
      expect(recommendation.score).toBe(0.92);
    });

    it('supports optional THC percentage', () => {
      const recommendation: ProductRecommendation = {
        id: 'prod-2',
        name: 'Sour Diesel',
        brand: 'Green Valley',
        category: 'flower',
        price: 50.0,
        thcPercent: 24.5,
        score: 0.88,
        reasoning: 'Strong sativa for energy',
      };

      expect(recommendation.thcPercent).toBe(24.5);
    });

    it('supports optional CBD percentage', () => {
      const recommendation: ProductRecommendation = {
        id: 'prod-3',
        name: 'Harlequin',
        brand: 'Wellness Farms',
        category: 'flower',
        price: 40.0,
        cbdPercent: 10.0,
        thcPercent: 8.0,
        score: 0.85,
        reasoning: 'Balanced CBD for pain relief',
      };

      expect(recommendation.cbdPercent).toBe(10.0);
      expect(recommendation.thcPercent).toBe(8.0);
    });

    it('supports different categories', () => {
      const recommendations: ProductRecommendation[] = [
        {
          id: '1',
          name: 'Flower',
          brand: 'Brand A',
          category: 'flower',
          price: 45.0,
          score: 0.9,
          reasoning: 'Top match',
        },
        {
          id: '2',
          name: 'Edible',
          brand: 'Brand B',
          category: 'edible',
          price: 25.0,
          score: 0.85,
          reasoning: 'Good match',
        },
        {
          id: '3',
          name: 'Vape',
          brand: 'Brand C',
          category: 'vape',
          price: 55.0,
          score: 0.8,
          reasoning: 'Decent match',
        },
      ];

      expect(recommendations.map(r => r.category)).toContain('edible');
    });

    it('can sort by score', () => {
      const recommendations: ProductRecommendation[] = [
        {
          id: '1',
          name: 'Product A',
          brand: 'Brand',
          category: 'flower',
          price: 30.0,
          score: 0.75,
          reasoning: 'Lower score',
        },
        {
          id: '2',
          name: 'Product B',
          brand: 'Brand',
          category: 'flower',
          price: 40.0,
          score: 0.95,
          reasoning: 'Higher score',
        },
      ];

      const sorted = [...recommendations].sort((a, b) => b.score - a.score);

      expect(sorted[0].name).toBe('Product B');
      expect(sorted[0].score).toBe(0.95);
    });
  });

  describe('RecommendationsResponse', () => {
    it('creates valid recommendations response', () => {
      const response: RecommendationsResponse = {
        recommendations: [
          {
            id: '1',
            name: 'Product',
            brand: 'Brand',
            category: 'flower',
            price: 40.0,
            score: 0.9,
            reasoning: 'Great match',
          },
        ],
        totalFound: 15,
        preferences: {
          desiredEffects: ['relaxation'],
          experienceLevel: 'regular',
          budgetLevel: 'medium',
        },
      };

      expect(response.recommendations).toHaveLength(1);
      expect(response.totalFound).toBe(15);
      expect(response.preferences.desiredEffects).toContain('relaxation');
    });

    it('handles empty recommendations', () => {
      const response: RecommendationsResponse = {
        recommendations: [],
        totalFound: 0,
        preferences: {
          desiredEffects: ['rare-effect'],
          experienceLevel: 'new',
          budgetLevel: 'low',
        },
      };

      expect(response.recommendations).toHaveLength(0);
      expect(response.totalFound).toBe(0);
    });

    it('includes original request preferences', () => {
      const request: RecommendProductsRequest = {
        desiredEffects: ['energy', 'focus'],
        experienceLevel: 'heavy',
        budgetLevel: 'high',
        preferredCategories: ['flower', 'concentrate'],
      };

      const response: RecommendationsResponse = {
        recommendations: [],
        totalFound: 0,
        preferences: request,
      };

      expect(response.preferences.preferredCategories).toContain('concentrate');
    });
  });

  describe('BudtenderRequest', () => {
    it('creates valid budtender request', () => {
      const request: BudtenderRequest = {
        message: 'What strain is good for anxiety?',
      };

      expect(request.message).toBe('What strain is good for anxiety?');
    });

    it('supports optional conversation history', () => {
      const request: BudtenderRequest = {
        message: 'Tell me more about that',
        history: [
          { role: 'user', content: 'What is Blue Dream?' },
          { role: 'assistant', content: 'Blue Dream is a popular hybrid strain...' },
        ],
      };

      expect(request.history).toHaveLength(2);
      expect(request.history?.[0].role).toBe('user');
      expect(request.history?.[1].role).toBe('assistant');
    });

    it('supports multiple conversation turns', () => {
      const request: BudtenderRequest = {
        message: 'Any other suggestions?',
        history: [
          { role: 'user', content: 'Need help with sleep' },
          { role: 'assistant', content: 'Try indica strains' },
          { role: 'user', content: 'Which indica?' },
          { role: 'assistant', content: 'Granddaddy Purple is excellent' },
        ],
      };

      expect(request.history).toHaveLength(4);
    });
  });

  describe('BudtenderResponse', () => {
    it('creates valid budtender response', () => {
      const response: BudtenderResponse = {
        response: 'Blue Dream is great for anxiety relief. It has balanced effects.',
        timestamp: '2026-01-23T10:00:00Z',
        context: {
          userMessage: 'What strain is good for anxiety?',
          suggestedProducts: ['blue-dream', 'harlequin'],
        },
        conversationLength: 1,
      };

      expect(response.response).toContain('Blue Dream');
      expect(response.conversationLength).toBe(1);
      expect(response.context.suggestedProducts).toHaveLength(2);
    });

    it('includes ISO timestamp', () => {
      const response: BudtenderResponse = {
        response: 'Here are some recommendations...',
        timestamp: '2026-01-23T14:30:00Z',
        context: {
          userMessage: 'Help me choose',
          suggestedProducts: [],
        },
        conversationLength: 3,
      };

      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('tracks conversation length', () => {
      const response: BudtenderResponse = {
        response: 'Based on our conversation...',
        timestamp: '2026-01-23T15:00:00Z',
        context: {
          userMessage: 'Final question',
          suggestedProducts: ['product-1'],
        },
        conversationLength: 5,
      };

      expect(response.conversationLength).toBe(5);
    });

    it('includes user message in context', () => {
      const response: BudtenderResponse = {
        response: 'Let me help with that',
        timestamp: '2026-01-23T16:00:00Z',
        context: {
          userMessage: 'Need something for creativity',
          suggestedProducts: ['sour-diesel', 'jack-herer'],
        },
        conversationLength: 2,
      };

      expect(response.context.userMessage).toContain('creativity');
      expect(response.context.suggestedProducts).toContain('sour-diesel');
    });
  });

  describe('type compatibility', () => {
    it('weather recommendations work with product display', () => {
      interface WeatherDisplay {
        weather: WeatherRecommendationsResponse;
        selectedProduct?: CMSProduct;
      }

      const display: WeatherDisplay = {
        weather: {
          condition: 'sunny',
          tags: ['energetic'],
          description: 'Sunny day recommendations',
          products: [{ __id: '1', name: 'Product', slug: 'product', price: 30.0, type: 'flower' }],
        },
        selectedProduct: {
          __id: '1',
          name: 'Product',
          slug: 'product',
          price: 30.0,
          type: 'flower',
        },
      };

      expect(display.weather.products[0].__id).toBe(display.selectedProduct?.__id);
    });

    it('AI recommendations integrate with shopping', () => {
      interface ShoppingWithAI {
        aiRecommendations: RecommendationsResponse;
        userRequest: RecommendProductsRequest;
      }

      const shopping: ShoppingWithAI = {
        aiRecommendations: {
          recommendations: [],
          totalFound: 0,
          preferences: {
            desiredEffects: ['relaxation'],
            experienceLevel: 'new',
            budgetLevel: 'low',
          },
        },
        userRequest: {
          desiredEffects: ['relaxation'],
          experienceLevel: 'new',
          budgetLevel: 'low',
        },
      };

      expect(shopping.aiRecommendations.preferences.experienceLevel).toBe(
        shopping.userRequest.experienceLevel
      );
    });

    it('budtender conversation maintains history', () => {
      interface ConversationState {
        messages: Array<{ role: 'user' | 'assistant'; content: string }>;
        lastResponse?: BudtenderResponse;
      }

      const state: ConversationState = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
        lastResponse: {
          response: 'Hi there!',
          timestamp: '2026-01-23T10:00:00Z',
          context: {
            userMessage: 'Hello',
            suggestedProducts: [],
          },
          conversationLength: 1,
        },
      };

      expect(state.messages).toHaveLength(2);
      expect(state.lastResponse?.conversationLength).toBe(1);
    });
  });
});
