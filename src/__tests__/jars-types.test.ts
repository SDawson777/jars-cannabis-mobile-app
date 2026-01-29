import type { StashItem, JournalEntry } from '../@types/jars';

describe('jars types', () => {
  describe('StashItem', () => {
    it('has correct structure with required fields', () => {
      const item: StashItem = {
        id: 'stash-123',
        name: 'Blue Dream',
        strainType: 'Hybrid',
        purchaseDate: '2026-01-15T10:00:00Z',
        status: 'in_stock',
      };

      expect(item.id).toBe('stash-123');
      expect(item.name).toBe('Blue Dream');
      expect(item.strainType).toBe('Hybrid');
      expect(item.purchaseDate).toBe('2026-01-15T10:00:00Z');
      expect(item.status).toBe('in_stock');
    });

    it('accepts in_stock status', () => {
      const item: StashItem = {
        id: '1',
        name: 'Product',
        strainType: 'Sativa',
        purchaseDate: '2026-01-20T10:00:00Z',
        status: 'in_stock',
      };

      expect(item.status).toBe('in_stock');
    });

    it('accepts consumed status', () => {
      const item: StashItem = {
        id: '1',
        name: 'Product',
        strainType: 'Indica',
        purchaseDate: '2026-01-10T10:00:00Z',
        status: 'consumed',
      };

      expect(item.status).toBe('consumed');
    });

    it('accepts optional imageUrl', () => {
      const withImage: StashItem = {
        id: '1',
        name: 'Product',
        strainType: 'Sativa',
        purchaseDate: '2026-01-20T10:00:00Z',
        status: 'in_stock',
        imageUrl: 'https://cdn.example.com/product.jpg',
      };

      const withoutImage: StashItem = {
        id: '2',
        name: 'Product',
        strainType: 'Indica',
        purchaseDate: '2026-01-20T10:00:00Z',
        status: 'in_stock',
      };

      expect(withImage.imageUrl).toBe('https://cdn.example.com/product.jpg');
      expect(withoutImage.imageUrl).toBeUndefined();
    });

    it('accepts various strain types', () => {
      const strainTypes = ['Sativa', 'Indica', 'Hybrid', 'CBD'];

      strainTypes.forEach(strainType => {
        const item: StashItem = {
          id: `item-${strainType}`,
          name: `${strainType} Product`,
          strainType,
          purchaseDate: '2026-01-20T10:00:00Z',
          status: 'in_stock',
        };

        expect(item.strainType).toBe(strainType);
      });
    });

    it('accepts ISO date string for purchaseDate', () => {
      const item: StashItem = {
        id: '1',
        name: 'Product',
        strainType: 'Hybrid',
        purchaseDate: '2026-01-23T15:30:45.123Z',
        status: 'in_stock',
      };

      expect(item.purchaseDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('accepts various product names', () => {
      const item: StashItem = {
        id: '1',
        name: 'Premium Blue Dream - Sativa Dominant Hybrid (3.5g)',
        strainType: 'Hybrid',
        purchaseDate: '2026-01-20T10:00:00Z',
        status: 'in_stock',
      };

      expect(item.name).toContain('Blue Dream');
      expect(item.name).toContain('3.5g');
    });
  });

  describe('JournalEntry', () => {
    it('has correct structure with all required fields', () => {
      const entry: JournalEntry = {
        id: 'entry-123',
        productId: 'prod-456',
        notes: 'Great for evening relaxation',
        effects: {
          relaxation: 8,
          focus: 3,
          painRelief: 6,
          creativity: 4,
          sleepQuality: 9,
        },
        activities: ['reading', 'meditation'],
        createdAt: '2026-01-23T20:00:00Z',
      };

      expect(entry.id).toBe('entry-123');
      expect(entry.productId).toBe('prod-456');
      expect(entry.notes).toBe('Great for evening relaxation');
      expect(entry.effects).toBeDefined();
      expect(entry.activities).toEqual(['reading', 'meditation']);
      expect(entry.createdAt).toBe('2026-01-23T20:00:00Z');
    });

    it('has effects object with all required properties', () => {
      const entry: JournalEntry = {
        id: 'entry-1',
        productId: 'prod-1',
        notes: 'Test',
        effects: {
          relaxation: 7,
          focus: 8,
          painRelief: 5,
          creativity: 9,
          sleepQuality: 6,
        },
        activities: [],
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(entry.effects).toHaveProperty('relaxation');
      expect(entry.effects).toHaveProperty('focus');
      expect(entry.effects).toHaveProperty('painRelief');
      expect(entry.effects).toHaveProperty('creativity');
      expect(entry.effects).toHaveProperty('sleepQuality');
    });

    it('accepts numeric values for effects', () => {
      const entry: JournalEntry = {
        id: 'entry-1',
        productId: 'prod-1',
        notes: 'Test',
        effects: {
          relaxation: 10,
          focus: 1,
          painRelief: 5,
          creativity: 7,
          sleepQuality: 3,
        },
        activities: [],
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(typeof entry.effects.relaxation).toBe('number');
      expect(typeof entry.effects.focus).toBe('number');
      expect(typeof entry.effects.painRelief).toBe('number');
      expect(typeof entry.effects.creativity).toBe('number');
      expect(typeof entry.effects.sleepQuality).toBe('number');
    });

    it('accepts effects with values from 1-10', () => {
      const entry: JournalEntry = {
        id: 'entry-1',
        productId: 'prod-1',
        notes: 'Test',
        effects: {
          relaxation: 10,
          focus: 1,
          painRelief: 5,
          creativity: 10,
          sleepQuality: 1,
        },
        activities: [],
        createdAt: '2026-01-23T10:00:00Z',
      };

      Object.values(entry.effects).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      });
    });

    it('accepts empty activities array', () => {
      const entry: JournalEntry = {
        id: 'entry-1',
        productId: 'prod-1',
        notes: 'No activities',
        effects: {
          relaxation: 5,
          focus: 5,
          painRelief: 5,
          creativity: 5,
          sleepQuality: 5,
        },
        activities: [],
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(entry.activities).toEqual([]);
      expect(entry.activities).toHaveLength(0);
    });

    it('accepts multiple activities', () => {
      const entry: JournalEntry = {
        id: 'entry-1',
        productId: 'prod-1',
        notes: 'Very active day',
        effects: {
          relaxation: 6,
          focus: 8,
          painRelief: 4,
          creativity: 9,
          sleepQuality: 7,
        },
        activities: ['hiking', 'painting', 'cooking', 'socializing'],
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(entry.activities).toHaveLength(4);
      expect(entry.activities).toContain('hiking');
      expect(entry.activities).toContain('painting');
    });

    it('accepts various activity types', () => {
      const activities = [
        'exercise',
        'meditation',
        'reading',
        'socializing',
        'gaming',
        'cooking',
        'creative_work',
        'relaxing',
      ];

      const entry: JournalEntry = {
        id: 'entry-1',
        productId: 'prod-1',
        notes: 'Test',
        effects: {
          relaxation: 5,
          focus: 5,
          painRelief: 5,
          creativity: 5,
          sleepQuality: 5,
        },
        activities,
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(entry.activities).toEqual(activities);
    });

    it('accepts short notes', () => {
      const entry: JournalEntry = {
        id: 'entry-1',
        productId: 'prod-1',
        notes: 'Good',
        effects: {
          relaxation: 7,
          focus: 5,
          painRelief: 6,
          creativity: 4,
          sleepQuality: 8,
        },
        activities: [],
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(entry.notes).toBe('Good');
    });

    it('accepts long detailed notes', () => {
      const entry: JournalEntry = {
        id: 'entry-1',
        productId: 'prod-1',
        notes:
          'This strain provided excellent relaxation without making me too drowsy. I was able to focus on my book for over an hour, which is unusual for me. The pain relief was moderate but effective. I felt more creative than usual and had some great ideas for my project. Sleep came easily and I woke up feeling refreshed.',
        effects: {
          relaxation: 9,
          focus: 8,
          painRelief: 6,
          creativity: 7,
          sleepQuality: 9,
        },
        activities: ['reading', 'creative_work'],
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(entry.notes.length).toBeGreaterThan(100);
      expect(entry.notes).toContain('relaxation');
    });

    it('accepts ISO date string for createdAt', () => {
      const entry: JournalEntry = {
        id: 'entry-1',
        productId: 'prod-1',
        notes: 'Test',
        effects: {
          relaxation: 5,
          focus: 5,
          painRelief: 5,
          creativity: 5,
          sleepQuality: 5,
        },
        activities: [],
        createdAt: '2026-01-23T15:30:45.123Z',
      };

      expect(entry.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('type compatibility', () => {
    it('can filter stash items by status', () => {
      const items: StashItem[] = [
        {
          id: '1',
          name: 'Item 1',
          strainType: 'Sativa',
          purchaseDate: '2026-01-20T10:00:00Z',
          status: 'in_stock',
        },
        {
          id: '2',
          name: 'Item 2',
          strainType: 'Indica',
          purchaseDate: '2026-01-15T10:00:00Z',
          status: 'consumed',
        },
        {
          id: '3',
          name: 'Item 3',
          strainType: 'Hybrid',
          purchaseDate: '2026-01-22T10:00:00Z',
          status: 'in_stock',
        },
      ];

      const inStock = items.filter(item => item.status === 'in_stock');
      const consumed = items.filter(item => item.status === 'consumed');

      expect(inStock).toHaveLength(2);
      expect(consumed).toHaveLength(1);
    });

    it('can filter stash items by strain type', () => {
      const items: StashItem[] = [
        {
          id: '1',
          name: 'Sativa 1',
          strainType: 'Sativa',
          purchaseDate: '2026-01-20T10:00:00Z',
          status: 'in_stock',
        },
        {
          id: '2',
          name: 'Indica 1',
          strainType: 'Indica',
          purchaseDate: '2026-01-20T10:00:00Z',
          status: 'in_stock',
        },
        {
          id: '3',
          name: 'Sativa 2',
          strainType: 'Sativa',
          purchaseDate: '2026-01-20T10:00:00Z',
          status: 'in_stock',
        },
      ];

      const sativas = items.filter(item => item.strainType === 'Sativa');
      expect(sativas).toHaveLength(2);
    });

    it('JournalEntry can reference StashItem by productId', () => {
      const stashItem: StashItem = {
        id: 'stash-123',
        name: 'Blue Dream',
        strainType: 'Hybrid',
        purchaseDate: '2026-01-20T10:00:00Z',
        status: 'in_stock',
      };

      const journalEntry: JournalEntry = {
        id: 'entry-456',
        productId: stashItem.id,
        notes: 'First try of this strain',
        effects: {
          relaxation: 8,
          focus: 6,
          painRelief: 5,
          creativity: 7,
          sleepQuality: 9,
        },
        activities: ['meditation'],
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(journalEntry.productId).toBe(stashItem.id);
    });

    it('can calculate average effects from multiple journal entries', () => {
      const entries: JournalEntry[] = [
        {
          id: 'entry-1',
          productId: 'prod-1',
          notes: 'Entry 1',
          effects: {
            relaxation: 8,
            focus: 6,
            painRelief: 7,
            creativity: 5,
            sleepQuality: 9,
          },
          activities: [],
          createdAt: '2026-01-20T10:00:00Z',
        },
        {
          id: 'entry-2',
          productId: 'prod-1',
          notes: 'Entry 2',
          effects: {
            relaxation: 6,
            focus: 8,
            painRelief: 5,
            creativity: 7,
            sleepQuality: 7,
          },
          activities: [],
          createdAt: '2026-01-21T10:00:00Z',
        },
      ];

      const avgRelaxation =
        entries.reduce((sum, e) => sum + e.effects.relaxation, 0) / entries.length;

      expect(avgRelaxation).toBe(7);
    });

    it('can find common activities across entries', () => {
      const entries: JournalEntry[] = [
        {
          id: 'entry-1',
          productId: 'prod-1',
          notes: 'Test',
          effects: {
            relaxation: 5,
            focus: 5,
            painRelief: 5,
            creativity: 5,
            sleepQuality: 5,
          },
          activities: ['reading', 'meditation'],
          createdAt: '2026-01-20T10:00:00Z',
        },
        {
          id: 'entry-2',
          productId: 'prod-1',
          notes: 'Test',
          effects: {
            relaxation: 5,
            focus: 5,
            painRelief: 5,
            creativity: 5,
            sleepQuality: 5,
          },
          activities: ['meditation', 'exercise'],
          createdAt: '2026-01-21T10:00:00Z',
        },
      ];

      const allActivities = entries.flatMap(e => e.activities);
      const uniqueActivities = [...new Set(allActivities)];

      expect(uniqueActivities).toContain('meditation');
      expect(uniqueActivities).toHaveLength(3);
    });

    it('can sort entries by createdAt date', () => {
      const entries: JournalEntry[] = [
        {
          id: 'entry-2',
          productId: 'prod-1',
          notes: 'Second',
          effects: {
            relaxation: 5,
            focus: 5,
            painRelief: 5,
            creativity: 5,
            sleepQuality: 5,
          },
          activities: [],
          createdAt: '2026-01-22T10:00:00Z',
        },
        {
          id: 'entry-1',
          productId: 'prod-1',
          notes: 'First',
          effects: {
            relaxation: 5,
            focus: 5,
            painRelief: 5,
            creativity: 5,
            sleepQuality: 5,
          },
          activities: [],
          createdAt: '2026-01-20T10:00:00Z',
        },
      ];

      const sorted = entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

      expect(sorted[0].notes).toBe('First');
      expect(sorted[1].notes).toBe('Second');
    });
  });
});
