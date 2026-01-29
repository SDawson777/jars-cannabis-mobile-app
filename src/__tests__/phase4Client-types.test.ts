import type {
  LoyaltyStatusShape,
  LoyaltyBadge,
  AddressShape,
  JournalEntry,
  AwardsStatus,
} from '../api/phase4Client';

describe('phase4Client API types', () => {
  describe('LoyaltyStatusShape', () => {
    it('creates a valid loyalty status with points', () => {
      const status: LoyaltyStatusShape = {
        points: 150,
      };

      expect(status.points).toBe(150);
    });

    it('supports optional level', () => {
      const status: LoyaltyStatusShape = {
        points: 500,
        level: 'Silver',
      };

      expect(status.level).toBe('Silver');
    });

    it('supports optional tier', () => {
      const status: LoyaltyStatusShape = {
        points: 1000,
        tier: 'Gold',
      };

      expect(status.tier).toBe('Gold');
    });

    it('supports both level and tier', () => {
      const status: LoyaltyStatusShape = {
        points: 2500,
        level: 'Platinum',
        tier: 'VIP',
      };

      expect(status.points).toBe(2500);
      expect(status.level).toBe('Platinum');
      expect(status.tier).toBe('VIP');
    });

    it('handles zero points', () => {
      const status: LoyaltyStatusShape = {
        points: 0,
      };

      expect(status.points).toBe(0);
    });

    it('handles large point values', () => {
      const status: LoyaltyStatusShape = {
        points: 999999,
        level: 'Diamond',
      };

      expect(status.points).toBe(999999);
    });
  });

  describe('LoyaltyBadge', () => {
    it('creates a valid badge with required fields', () => {
      const badge: LoyaltyBadge = {
        id: 'badge-1',
        name: 'First Purchase',
      };

      expect(badge.id).toBe('badge-1');
      expect(badge.name).toBe('First Purchase');
    });

    it('supports optional description', () => {
      const badge: LoyaltyBadge = {
        id: 'badge-2',
        name: 'Loyal Customer',
        description: 'Made 10 purchases',
      };

      expect(badge.description).toBe('Made 10 purchases');
    });

    it('creates multiple badges', () => {
      const badges: LoyaltyBadge[] = [
        { id: 'badge-1', name: 'Newcomer', description: 'First purchase' },
        { id: 'badge-2', name: 'Explorer', description: 'Tried 5 products' },
        { id: 'badge-3', name: 'Connoisseur', description: 'Tried 20 products' },
      ];

      expect(badges).toHaveLength(3);
      expect(badges.every(b => b.id && b.name)).toBe(true);
    });

    it('supports badges with emoji names', () => {
      const badge: LoyaltyBadge = {
        id: 'badge-star',
        name: '⭐ Star Member',
        description: 'Achieved 1000 points',
      };

      expect(badge.name).toContain('⭐');
    });
  });

  describe('AddressShape', () => {
    it('creates a valid address with required fields', () => {
      const address: AddressShape = {
        id: 'addr-1',
        line1: '123 Main Street',
      };

      expect(address.id).toBe('addr-1');
      expect(address.line1).toBe('123 Main Street');
    });

    it('supports optional label', () => {
      const address: AddressShape = {
        id: 'addr-2',
        label: 'Home',
        line1: '456 Oak Avenue',
      };

      expect(address.label).toBe('Home');
    });

    it('supports optional line2', () => {
      const address: AddressShape = {
        id: 'addr-3',
        line1: '789 Elm Street',
        line2: 'Apt 4B',
      };

      expect(address.line2).toBe('Apt 4B');
    });

    it('supports full address with all fields', () => {
      const address: AddressShape = {
        id: 'addr-4',
        label: 'Work',
        line1: '101 Business Blvd',
        line2: 'Suite 200',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
      };

      expect(address.city).toBe('San Francisco');
      expect(address.state).toBe('CA');
      expect(address.zip).toBe('94102');
    });

    it('handles addresses without line2', () => {
      const address: AddressShape = {
        id: 'addr-5',
        line1: '222 Simple St',
        city: 'Oakland',
        state: 'CA',
        zip: '94601',
      };

      expect(address.line2).toBeUndefined();
      expect(address.city).toBe('Oakland');
    });

    it('supports multiple addresses', () => {
      const addresses: AddressShape[] = [
        { id: '1', label: 'Home', line1: '123 Home St', city: 'SF', state: 'CA', zip: '94102' },
        {
          id: '2',
          label: 'Work',
          line1: '456 Work Ave',
          city: 'Oakland',
          state: 'CA',
          zip: '94601',
        },
      ];

      expect(addresses).toHaveLength(2);
      expect(addresses[0].label).toBe('Home');
      expect(addresses[1].label).toBe('Work');
    });
  });

  describe('JournalEntry', () => {
    it('creates a minimal journal entry', () => {
      const entry: JournalEntry = {
        id: 'entry-1',
      };

      expect(entry.id).toBe('entry-1');
    });

    it('supports productId', () => {
      const entry: JournalEntry = {
        id: 'entry-2',
        productId: 'product-blue-dream',
      };

      expect(entry.productId).toBe('product-blue-dream');
    });

    it('supports rating', () => {
      const entry: JournalEntry = {
        id: 'entry-3',
        productId: 'product-123',
        rating: 5,
      };

      expect(entry.rating).toBe(5);
    });

    it('supports notes', () => {
      const entry: JournalEntry = {
        id: 'entry-4',
        productId: 'product-456',
        notes: 'Great for relaxation. Helped me unwind after a long day.',
      };

      expect(entry.notes).toContain('relaxation');
    });

    it('supports tags', () => {
      const entry: JournalEntry = {
        id: 'entry-5',
        productId: 'product-789',
        tags: ['relaxation', 'evening', 'pain-relief'],
      };

      expect(entry.tags).toHaveLength(3);
      expect(entry.tags).toContain('pain-relief');
    });

    it('supports createdAt timestamp', () => {
      const entry: JournalEntry = {
        id: 'entry-6',
        productId: 'product-abc',
        createdAt: '2026-01-20T18:30:00Z',
      };

      expect(entry.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('supports full journal entry with all fields', () => {
      const entry: JournalEntry = {
        id: 'entry-7',
        productId: 'product-xyz',
        rating: 4,
        notes: 'Nice balanced high. Perfect for creative activities.',
        tags: ['creative', 'daytime', 'hybrid'],
        createdAt: '2026-01-20T14:00:00Z',
      };

      expect(entry.id).toBe('entry-7');
      expect(entry.rating).toBe(4);
      expect(entry.tags).toHaveLength(3);
    });

    it('can filter entries by product', () => {
      const entries: JournalEntry[] = [
        { id: '1', productId: 'product-a', rating: 5 },
        { id: '2', productId: 'product-b', rating: 4 },
        { id: '3', productId: 'product-a', rating: 4 },
      ];

      const productAEntries = entries.filter(e => e.productId === 'product-a');

      expect(productAEntries).toHaveLength(2);
    });

    it('can calculate average rating', () => {
      const entries: JournalEntry[] = [
        { id: '1', rating: 5 },
        { id: '2', rating: 4 },
        { id: '3', rating: 5 },
        { id: '4', rating: 3 },
      ];

      const ratingsWithValues = entries.filter(e => e.rating !== undefined).map(e => e.rating!);
      const average = ratingsWithValues.reduce((sum, r) => sum + r, 0) / ratingsWithValues.length;

      expect(average).toBe(4.25);
    });

    it('can sort entries by date', () => {
      const entries: JournalEntry[] = [
        { id: '1', createdAt: '2026-01-22T10:00:00Z' },
        { id: '2', createdAt: '2026-01-20T10:00:00Z' },
        { id: '3', createdAt: '2026-01-21T10:00:00Z' },
      ];

      const sorted = [...entries].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      expect(sorted[0].id).toBe('1');
      expect(sorted[2].id).toBe('2');
    });
  });

  describe('AwardsStatus', () => {
    it('creates a valid awards status', () => {
      const status: AwardsStatus = {
        total: 10,
        available: 3,
      };

      expect(status.total).toBe(10);
      expect(status.available).toBe(3);
    });

    it('supports optional total', () => {
      const status: AwardsStatus = {
        available: 2,
      };

      expect(status.total).toBeUndefined();
      expect(status.available).toBe(2);
    });

    it('supports optional available', () => {
      const status: AwardsStatus = {
        total: 15,
      };

      expect(status.total).toBe(15);
      expect(status.available).toBeUndefined();
    });

    it('handles zero values', () => {
      const status: AwardsStatus = {
        total: 0,
        available: 0,
      };

      expect(status.total).toBe(0);
      expect(status.available).toBe(0);
    });

    it('can calculate claimed awards', () => {
      const status: AwardsStatus = {
        total: 12,
        available: 5,
      };

      const claimed = (status.total ?? 0) - (status.available ?? 0);

      expect(claimed).toBe(7);
    });

    it('can check if any awards are available', () => {
      const status1: AwardsStatus = { available: 3 };
      const status2: AwardsStatus = { available: 0 };

      expect((status1.available ?? 0) > 0).toBe(true);
      expect((status2.available ?? 0) > 0).toBe(false);
    });
  });

  describe('type compatibility', () => {
    it('loyalty status can be used in profile', () => {
      interface UserProfile {
        id: string;
        loyalty: LoyaltyStatusShape;
      }

      const profile: UserProfile = {
        id: 'user-1',
        loyalty: {
          points: 500,
          level: 'Gold',
        },
      };

      expect(profile.loyalty.points).toBe(500);
    });

    it('badges can be stored in an array', () => {
      interface BadgeCollection {
        earned: LoyaltyBadge[];
        available: LoyaltyBadge[];
      }

      const collection: BadgeCollection = {
        earned: [{ id: 'badge-1', name: 'First Purchase' }],
        available: [{ id: 'badge-2', name: 'Explorer' }],
      };

      expect(collection.earned).toHaveLength(1);
    });

    it('addresses can be categorized', () => {
      interface AddressBook {
        primary?: AddressShape;
        secondary: AddressShape[];
      }

      const book: AddressBook = {
        primary: { id: '1', label: 'Home', line1: '123 Main St' },
        secondary: [{ id: '2', label: 'Work', line1: '456 Work Ave' }],
      };

      expect(book.primary?.label).toBe('Home');
    });

    it('journal entries can be paginated', () => {
      interface JournalResponse {
        entries: JournalEntry[];
        total: number;
        page: number;
      }

      const response: JournalResponse = {
        entries: [
          { id: '1', productId: 'product-1', rating: 5 },
          { id: '2', productId: 'product-2', rating: 4 },
        ],
        total: 50,
        page: 1,
      };

      expect(response.entries).toHaveLength(2);
      expect(response.total).toBe(50);
    });
  });
});
