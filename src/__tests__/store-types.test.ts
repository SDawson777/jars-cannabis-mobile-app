import type { StoreAmenity, StoreData, StoreReview } from '../@types/store';

describe('store types', () => {
  describe('StoreAmenity', () => {
    it('accepts curbside amenity', () => {
      const amenity: StoreAmenity = 'curbside';
      expect(amenity).toBe('curbside');
    });

    it('accepts atm amenity', () => {
      const amenity: StoreAmenity = 'atm';
      expect(amenity).toBe('atm');
    });

    it('accepts accessible amenity', () => {
      const amenity: StoreAmenity = 'accessible';
      expect(amenity).toBe('accessible');
    });

    it('accepts parking amenity', () => {
      const amenity: StoreAmenity = 'parking';
      expect(amenity).toBe('parking');
    });

    it('accepts wifi amenity', () => {
      const amenity: StoreAmenity = 'wifi';
      expect(amenity).toBe('wifi');
    });

    it('accepts pet_friendly amenity', () => {
      const amenity: StoreAmenity = 'pet_friendly';
      expect(amenity).toBe('pet_friendly');
    });

    it('accepts delivery amenity', () => {
      const amenity: StoreAmenity = 'delivery';
      expect(amenity).toBe('delivery');
    });

    it('accepts online_ordering amenity', () => {
      const amenity: StoreAmenity = 'online_ordering';
      expect(amenity).toBe('online_ordering');
    });

    it('can be used in arrays', () => {
      const amenities: StoreAmenity[] = ['curbside', 'parking', 'wifi'];
      expect(amenities).toHaveLength(3);
      expect(amenities).toContain('wifi');
    });
  });

  describe('StoreData', () => {
    it('has correct structure with required fields', () => {
      const store: StoreData = {
        id: 'store-123',
        name: 'Nimbus Denver Downtown',
        slug: 'denver-downtown',
        latitude: 39.7392,
        longitude: -104.9903,
        address: '123 Main St',
      };

      expect(store.id).toBe('store-123');
      expect(store.name).toBe('Nimbus Denver Downtown');
      expect(store.slug).toBe('denver-downtown');
      expect(store.latitude).toBe(39.7392);
      expect(store.longitude).toBe(-104.9903);
      expect(store.address).toBe('123 Main St');
    });

    it('accepts optional city, state, and zip', () => {
      const withAddress: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zip: '80202',
      };

      const withoutAddress: StoreData = {
        id: '2',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
      };

      expect(withAddress.city).toBe('Denver');
      expect(withAddress.state).toBe('CO');
      expect(withAddress.zip).toBe('80202');
      expect(withoutAddress.city).toBeUndefined();
      expect(withoutAddress.state).toBeUndefined();
      expect(withoutAddress.zip).toBeUndefined();
    });

    it('accepts optional phone', () => {
      const withPhone: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        phone: '555-1234',
      };

      const withoutPhone: StoreData = {
        id: '2',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
      };

      expect(withPhone.phone).toBe('555-1234');
      expect(withoutPhone.phone).toBeUndefined();
    });

    it('accepts optional websiteUrl', () => {
      const withWebsite: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        websiteUrl: 'https://nimbuscannabis.com',
      };

      expect(withWebsite.websiteUrl).toBe('https://nimbuscannabis.com');
    });

    it('accepts optional openNow boolean', () => {
      const openStore: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        openNow: true,
      };

      const closedStore: StoreData = {
        id: '2',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        openNow: false,
      };

      expect(openStore.openNow).toBe(true);
      expect(closedStore.openNow).toBe(false);
    });

    it('accepts optional todayHours', () => {
      const store: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        todayHours: '9:00 AM - 9:00 PM',
      };

      expect(store.todayHours).toBe('9:00 AM - 9:00 PM');
    });

    it('accepts optional weeklyHours array', () => {
      const store: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        weeklyHours: [
          { day: 'Monday', open: '9:00 AM', close: '9:00 PM' },
          { day: 'Tuesday', open: '9:00 AM', close: '9:00 PM', note: 'Happy hour 4-6 PM' },
        ],
      };

      expect(store.weeklyHours).toHaveLength(2);
      expect(store.weeklyHours?.[0].day).toBe('Monday');
      expect(store.weeklyHours?.[1].note).toBe('Happy hour 4-6 PM');
    });

    it('accepts optional amenities array', () => {
      const store: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        amenities: ['curbside', 'parking', 'wifi', 'accessible'],
      };

      expect(store.amenities).toHaveLength(4);
      expect(store.amenities).toContain('wifi');
    });

    it('accepts optional dealsActive boolean', () => {
      const storeWithDeals: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        dealsActive: true,
      };

      expect(storeWithDeals.dealsActive).toBe(true);
    });

    it('accepts optional inventorySummary', () => {
      const store: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        inventorySummary: '200+ products in stock',
      };

      expect(store.inventorySummary).toBe('200+ products in stock');
    });

    it('accepts optional rating and reviewCount', () => {
      const store: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        rating: 4.5,
        reviewCount: 128,
      };

      expect(store.rating).toBe(4.5);
      expect(store.reviewCount).toBe(128);
    });

    it('accepts optional heroImageUrl', () => {
      const store: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        heroImageUrl: 'https://cdn.example.com/store-hero.jpg',
      };

      expect(store.heroImageUrl).toContain('store-hero.jpg');
    });

    it('accepts optional promo', () => {
      const store: StoreData = {
        id: '1',
        name: 'Store',
        slug: 'store',
        latitude: 0,
        longitude: 0,
        address: '123 Main St',
        promo: '20% off all flower this week!',
      };

      expect(store.promo).toBe('20% off all flower this week!');
    });

    it('accepts valid latitude and longitude coordinates', () => {
      const store: StoreData = {
        id: '1',
        name: 'Denver Store',
        slug: 'denver-store',
        latitude: 39.7392,
        longitude: -104.9903,
        address: '123 Main St',
      };

      expect(store.latitude).toBeGreaterThanOrEqual(-90);
      expect(store.latitude).toBeLessThanOrEqual(90);
      expect(store.longitude).toBeGreaterThanOrEqual(-180);
      expect(store.longitude).toBeLessThanOrEqual(180);
    });
  });

  describe('StoreReview', () => {
    it('has correct structure with all required fields', () => {
      const review: StoreReview = {
        id: 'review-123',
        storeId: 'store-456',
        user: {
          id: 'user-789',
          name: 'John Doe',
        },
        rating: 5,
        comment: 'Great store with friendly staff!',
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(review.id).toBe('review-123');
      expect(review.storeId).toBe('store-456');
      expect(review.user.id).toBe('user-789');
      expect(review.user.name).toBe('John Doe');
      expect(review.rating).toBe(5);
      expect(review.comment).toBe('Great store with friendly staff!');
      expect(review.createdAt).toBe('2026-01-23T10:00:00Z');
    });

    it('accepts user with optional avatarUrl', () => {
      const withAvatar: StoreReview = {
        id: 'review-1',
        storeId: 'store-1',
        user: {
          id: 'user-1',
          name: 'Jane Doe',
          avatarUrl: 'https://cdn.example.com/avatar.jpg',
        },
        rating: 4,
        comment: 'Good experience',
        createdAt: '2026-01-23T10:00:00Z',
      };

      const withoutAvatar: StoreReview = {
        id: 'review-2',
        storeId: 'store-1',
        user: {
          id: 'user-2',
          name: 'Bob Smith',
        },
        rating: 5,
        comment: 'Excellent',
        createdAt: '2026-01-23T11:00:00Z',
      };

      expect(withAvatar.user.avatarUrl).toBe('https://cdn.example.com/avatar.jpg');
      expect(withoutAvatar.user.avatarUrl).toBeUndefined();
    });

    it('accepts rating from 1 to 5', () => {
      const ratings = [1, 2, 3, 4, 5];

      ratings.forEach(rating => {
        const review: StoreReview = {
          id: `review-${rating}`,
          storeId: 'store-1',
          user: { id: 'user-1', name: 'User' },
          rating,
          comment: `${rating} star review`,
          createdAt: '2026-01-23T10:00:00Z',
        };

        expect(review.rating).toBe(rating);
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      });
    });

    it('accepts various comment lengths', () => {
      const shortComment: StoreReview = {
        id: 'review-1',
        storeId: 'store-1',
        user: { id: 'user-1', name: 'User' },
        rating: 5,
        comment: 'Great!',
        createdAt: '2026-01-23T10:00:00Z',
      };

      const longComment: StoreReview = {
        id: 'review-2',
        storeId: 'store-1',
        user: { id: 'user-1', name: 'User' },
        rating: 5,
        comment:
          'This is a much longer comment with lots of detail about my experience at the store. The staff was incredibly helpful and knowledgeable.',
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(shortComment.comment).toBe('Great!');
      expect(longComment.comment.length).toBeGreaterThan(50);
    });

    it('accepts ISO date string for createdAt', () => {
      const review: StoreReview = {
        id: 'review-1',
        storeId: 'store-1',
        user: { id: 'user-1', name: 'User' },
        rating: 5,
        comment: 'Good',
        createdAt: '2026-01-23T15:30:45.123Z',
      };

      expect(review.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('type compatibility', () => {
    it('StoreData can have array of amenities', () => {
      const store: StoreData = {
        id: '1',
        name: 'Full Service Store',
        slug: 'full-service',
        latitude: 39.7392,
        longitude: -104.9903,
        address: '123 Main St',
        amenities: ['curbside', 'delivery', 'parking', 'wifi', 'atm', 'accessible'],
      };

      expect(store.amenities).toContain('wifi');
      expect(store.amenities?.filter(a => a.includes('delivery'))).toHaveLength(1);
    });

    it('can filter stores by amenities', () => {
      const stores: StoreData[] = [
        {
          id: '1',
          name: 'Store 1',
          slug: 'store-1',
          latitude: 0,
          longitude: 0,
          address: 'Address 1',
          amenities: ['wifi', 'parking'],
        },
        {
          id: '2',
          name: 'Store 2',
          slug: 'store-2',
          latitude: 0,
          longitude: 0,
          address: 'Address 2',
          amenities: ['curbside'],
        },
      ];

      const wifiStores = stores.filter(s => s.amenities?.includes('wifi'));
      expect(wifiStores).toHaveLength(1);
    });

    it('can sort stores by rating', () => {
      const stores: StoreData[] = [
        {
          id: '1',
          name: 'Store 1',
          slug: 'store-1',
          latitude: 0,
          longitude: 0,
          address: 'Address',
          rating: 4.2,
        },
        {
          id: '2',
          name: 'Store 2',
          slug: 'store-2',
          latitude: 0,
          longitude: 0,
          address: 'Address',
          rating: 4.8,
        },
      ];

      const sorted = stores.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      expect(sorted[0].rating).toBe(4.8);
    });

    it('StoreReview references StoreData by storeId', () => {
      const store: StoreData = {
        id: 'store-123',
        name: 'Test Store',
        slug: 'test-store',
        latitude: 0,
        longitude: 0,
        address: 'Address',
      };

      const review: StoreReview = {
        id: 'review-456',
        storeId: store.id,
        user: { id: 'user-1', name: 'User' },
        rating: 5,
        comment: 'Great store',
        createdAt: '2026-01-23T10:00:00Z',
      };

      expect(review.storeId).toBe(store.id);
    });
  });
});
