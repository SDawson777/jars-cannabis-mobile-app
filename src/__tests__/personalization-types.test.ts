import type { ForYouTodayItem, ForYouTodayPayload } from '../@types/personalization';

describe('personalization types', () => {
  describe('ForYouTodayItem', () => {
    it('has correct structure with all required fields', () => {
      const item: ForYouTodayItem = {
        id: 'prod-123',
        name: 'Blue Dream',
        price: 29.99,
      };

      expect(item.id).toBe('prod-123');
      expect(item.name).toBe('Blue Dream');
      expect(item.price).toBe(29.99);
    });

    it('accepts optional imageUrl', () => {
      const itemWithImage: ForYouTodayItem = {
        id: '1',
        name: 'Test',
        price: 19.99,
        imageUrl: 'https://example.com/image.jpg',
      };

      const itemWithoutImage: ForYouTodayItem = {
        id: '1',
        name: 'Test',
        price: 19.99,
      };

      expect(itemWithImage.imageUrl).toBe('https://example.com/image.jpg');
      expect(itemWithoutImage.imageUrl).toBeUndefined();
    });

    it('accepts optional isNew flag', () => {
      const newItem: ForYouTodayItem = {
        id: '1',
        name: 'New Product',
        price: 25.0,
        isNew: true,
      };

      const regularItem: ForYouTodayItem = {
        id: '2',
        name: 'Regular Product',
        price: 20.0,
      };

      expect(newItem.isNew).toBe(true);
      expect(regularItem.isNew).toBeUndefined();
    });

    it('accepts optional hasDeal flag', () => {
      const dealItem: ForYouTodayItem = {
        id: '1',
        name: 'On Sale',
        price: 15.0,
        hasDeal: true,
      };

      const regularItem: ForYouTodayItem = {
        id: '2',
        name: 'Regular Price',
        price: 20.0,
      };

      expect(dealItem.hasDeal).toBe(true);
      expect(regularItem.hasDeal).toBeUndefined();
    });

    it('accepts item with all optional fields', () => {
      const fullItem: ForYouTodayItem = {
        id: 'full-123',
        name: 'Complete Item',
        price: 30.0,
        imageUrl: 'https://cdn.example.com/full.jpg',
        isNew: true,
        hasDeal: true,
      };

      expect(fullItem.imageUrl).toBeDefined();
      expect(fullItem.isNew).toBe(true);
      expect(fullItem.hasDeal).toBe(true);
    });

    it('accepts price as number with decimals', () => {
      const item: ForYouTodayItem = {
        id: '1',
        name: 'Test',
        price: 19.99,
      };

      expect(typeof item.price).toBe('number');
      expect(item.price).toBe(19.99);
    });
  });

  describe('ForYouTodayPayload', () => {
    it('has correct structure with products array', () => {
      const payload: ForYouTodayPayload = {
        greeting: 'Good morning, John',
        message: 'Based on your preferences',
        products: [
          {
            id: '1',
            name: 'Product 1',
            price: 15.99,
          },
          {
            id: '2',
            name: 'Product 2',
            price: 25.99,
          },
        ],
      };

      expect(payload.greeting).toBe('Good morning, John');
      expect(payload.message).toBe('Based on your preferences');
      expect(payload.products).toHaveLength(2);
    });

    it('accepts empty products array', () => {
      const payload: ForYouTodayPayload = {
        greeting: 'Hello',
        message: 'No recommendations yet',
        products: [],
      };

      expect(payload.products).toEqual([]);
      expect(payload.products).toHaveLength(0);
    });

    it('allows optional ctaText', () => {
      const withCTA: ForYouTodayPayload = {
        greeting: 'Hi',
        message: 'Check these out',
        products: [],
        ctaText: 'View All',
      };

      const withoutCTA: ForYouTodayPayload = {
        greeting: 'Hi',
        message: 'Check these out',
        products: [],
      };

      expect(withCTA.ctaText).toBe('View All');
      expect(withoutCTA.ctaText).toBeUndefined();
    });

    it('accepts products with different prices', () => {
      const payload: ForYouTodayPayload = {
        greeting: 'Hello',
        message: 'Various prices',
        products: [
          { id: '1', name: 'Cheap', price: 5.0 },
          { id: '2', name: 'Medium', price: 15.5 },
          { id: '3', name: 'Expensive', price: 99.99 },
        ],
      };

      expect(payload.products[0].price).toBe(5.0);
      expect(payload.products[1].price).toBe(15.5);
      expect(payload.products[2].price).toBe(99.99);
    });

    it('accepts personalized greeting with emojis', () => {
      const payload: ForYouTodayPayload = {
        greeting: 'Good evening, Sarah! 🌙',
        message: 'Perfect for relaxation',
        products: [],
      };

      expect(payload.greeting).toContain('Sarah');
      expect(payload.greeting).toContain('🌙');
    });

    it('accepts contextual message', () => {
      const payload: ForYouTodayPayload = {
        greeting: 'Welcome back',
        message: 'Based on your recent purchases and the rainy weather, these might interest you',
        products: [],
      };

      expect(payload.message).toContain('weather');
      expect(payload.message).toContain('purchases');
    });

    it('accepts products with optional flags', () => {
      const payload: ForYouTodayPayload = {
        greeting: 'Hello',
        message: 'Featured items',
        products: [
          { id: '1', name: 'New', price: 20, isNew: true },
          { id: '2', name: 'Deal', price: 15, hasDeal: true },
          { id: '3', name: 'Both', price: 25, isNew: true, hasDeal: true },
        ],
      };

      expect(payload.products[0].isNew).toBe(true);
      expect(payload.products[1].hasDeal).toBe(true);
      expect(payload.products[2].isNew).toBe(true);
      expect(payload.products[2].hasDeal).toBe(true);
    });
  });

  describe('type compatibility', () => {
    it('ForYouTodayItem can be used in arrays', () => {
      const items: ForYouTodayItem[] = [
        { id: '1', name: 'A', price: 10 },
        { id: '2', name: 'B', price: 20 },
      ];

      expect(Array.isArray(items)).toBe(true);
      expect(items).toHaveLength(2);
    });

    it('payload products can be mapped and filtered', () => {
      const payload: ForYouTodayPayload = {
        greeting: 'Hello',
        message: 'Test',
        products: [
          { id: '1', name: 'A', price: 10 },
          { id: '2', name: 'B', price: 30 },
          { id: '3', name: 'C', price: 20 },
        ],
      };

      const expensive = payload.products.filter(item => item.price > 25);
      const names = payload.products.map(item => item.name);

      expect(expensive).toHaveLength(1);
      expect(names).toEqual(['A', 'B', 'C']);
    });

    it('products with images can be filtered', () => {
      const payload: ForYouTodayPayload = {
        greeting: 'Test',
        message: 'Test',
        products: [
          { id: '1', name: 'With Image', price: 10, imageUrl: 'url1' },
          { id: '2', name: 'No Image', price: 20 },
          { id: '3', name: 'Also With Image', price: 15, imageUrl: 'url2' },
        ],
      };

      const withImages = payload.products.filter(p => p.imageUrl !== undefined);
      expect(withImages).toHaveLength(2);
    });
  });
});
