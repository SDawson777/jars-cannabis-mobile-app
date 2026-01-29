import { LRUCache, productPriceCache, getCachedPrice, setCachedPrice } from '../utils/lruCache';

describe('LRUCache', () => {
  describe('basic operations', () => {
    it('stores and retrieves values', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
    });

    it('returns undefined for missing keys', () => {
      const cache = new LRUCache<string, number>(3);
      expect(cache.get('missing')).toBeUndefined();
    });

    it('checks key existence with has()', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    it('returns current size', () => {
      const cache = new LRUCache<string, number>(5);
      expect(cache.size()).toBe(0);
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.size()).toBe(2);
    });

    it('clears all entries', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.size()).toBe(2);
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.has('a')).toBe(false);
    });
  });

  describe('capacity management', () => {
    it('evicts least recently used item when at capacity', () => {
      const cache = new LRUCache<string, number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // Should evict 'a'
      
      expect(cache.has('a')).toBe(false);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    it('respects capacity of 1', () => {
      const cache = new LRUCache<string, number>(1);
      cache.set('a', 1);
      cache.set('b', 2); // Should evict 'a'
      
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(true);
      expect(cache.size()).toBe(1);
    });

    it('handles capacity of 0 gracefully', () => {
      const cache = new LRUCache<string, number>(0);
      cache.set('a', 1);
      expect(cache.size()).toBe(0);
      expect(cache.get('a')).toBeUndefined();
    });

    it('maintains exact capacity when adding multiple items', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4);
      cache.set('e', 5);
      
      expect(cache.size()).toBe(3);
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(false);
      expect(cache.has('c')).toBe(true);
      expect(cache.has('d')).toBe(true);
      expect(cache.has('e')).toBe(true);
    });
  });

  describe('LRU eviction behavior', () => {
    it('moves accessed item to end (most recent)', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      
      // Access 'a', making it most recent
      cache.get('a');
      
      // Add new item, should evict 'b' (now least recent)
      cache.set('d', 4);
      
      expect(cache.has('b')).toBe(false);
      expect(cache.has('a')).toBe(true);
      expect(cache.has('c')).toBe(true);
      expect(cache.has('d')).toBe(true);
    });

    it('updates value without affecting size', () => {
      const cache = new LRUCache<string, number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.size()).toBe(2);
      
      cache.set('a', 10); // Update existing
      expect(cache.size()).toBe(2);
      expect(cache.get('a')).toBe(10);
    });

    it('preserves order when updating existing key', () => {
      const cache = new LRUCache<string, number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      
      // Update 'a', making it most recent
      cache.set('a', 10);
      
      // Add new item, should evict 'b'
      cache.set('c', 3);
      
      expect(cache.has('b')).toBe(false);
      expect(cache.has('a')).toBe(true);
      expect(cache.has('c')).toBe(true);
    });
  });

  describe('type safety', () => {
    it('supports string keys and values', () => {
      const cache = new LRUCache<string, string>(2);
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('supports numeric keys', () => {
      const cache = new LRUCache<number, string>(2);
      cache.set(1, 'one');
      cache.set(2, 'two');
      expect(cache.get(1)).toBe('one');
      expect(cache.get(2)).toBe('two');
    });

    it('supports object values', () => {
      const cache = new LRUCache<string, { name: string; age: number }>(2);
      cache.set('user1', { name: 'Alice', age: 30 });
      const result = cache.get('user1');
      expect(result).toEqual({ name: 'Alice', age: 30 });
    });

    it('stores null values', () => {
      const cache = new LRUCache<string, null>(2);
      cache.set('null-key', null);
      expect(cache.get('null-key')).toBeNull();
      expect(cache.has('null-key')).toBe(true);
    });

    it('distinguishes undefined return from stored undefined', () => {
      // LRU cache doesn't store undefined, so get() returns undefined for missing keys
      const cache = new LRUCache<string, number | undefined>(2);
      expect(cache.get('missing')).toBeUndefined();
      expect(cache.has('missing')).toBe(false);
    });
  });
});

describe('product price cache helpers', () => {
  beforeEach(() => {
    productPriceCache.clear();
  });

  describe('getCachedPrice', () => {
    it('returns undefined when no entry exists', () => {
      expect(getCachedPrice('product-123')).toBeUndefined();
    });

    it('returns cached price within TTL', () => {
      setCachedPrice('product-123', 29.99);
      expect(getCachedPrice('product-123')).toBe(29.99);
    });

    it('returns undefined when cache entry expired', () => {
      // Manually set expired entry
      productPriceCache.set('product-123', {
        price: 29.99,
        timestamp: Date.now() - 31_000, // 31 seconds ago (past 30s TTL)
      });
      
      expect(getCachedPrice('product-123')).toBeUndefined();
    });

    it('returns price if just under TTL threshold', () => {
      productPriceCache.set('product-123', {
        price: 29.99,
        timestamp: Date.now() - 29_000, // 29 seconds ago
      });
      
      expect(getCachedPrice('product-123')).toBe(29.99);
    });
  });

  describe('setCachedPrice', () => {
    it('stores price with current timestamp', () => {
      const before = Date.now();
      setCachedPrice('product-456', 49.99);
      const after = Date.now();
      
      const entry = productPriceCache.get('product-456');
      expect(entry?.price).toBe(49.99);
      expect(entry?.timestamp).toBeGreaterThanOrEqual(before);
      expect(entry?.timestamp).toBeLessThanOrEqual(after);
    });

    it('overwrites existing cached price', () => {
      setCachedPrice('product-789', 19.99);
      setCachedPrice('product-789', 24.99);
      
      expect(getCachedPrice('product-789')).toBe(24.99);
    });

    it('supports zero price', () => {
      setCachedPrice('free-product', 0);
      expect(getCachedPrice('free-product')).toBe(0);
    });

    it('supports decimal prices', () => {
      setCachedPrice('product-decimal', 12.34);
      expect(getCachedPrice('product-decimal')).toBe(12.34);
    });
  });

  describe('cache integration', () => {
    it('respects global cache capacity (100 entries)', () => {
      // Add 101 entries
      for (let i = 0; i < 101; i++) {
        setCachedPrice(`product-${i}`, i * 10);
      }
      
      // First entry should be evicted
      expect(getCachedPrice('product-0')).toBeUndefined();
      
      // Recent entries should exist
      expect(getCachedPrice('product-100')).toBe(1000);
      expect(productPriceCache.size()).toBe(100);
    });

    it('handles multiple products independently', () => {
      setCachedPrice('product-a', 10.0);
      setCachedPrice('product-b', 20.0);
      setCachedPrice('product-c', 30.0);
      
      expect(getCachedPrice('product-a')).toBe(10.0);
      expect(getCachedPrice('product-b')).toBe(20.0);
      expect(getCachedPrice('product-c')).toBe(30.0);
    });

    it('clears all cached prices', () => {
      setCachedPrice('product-1', 10.0);
      setCachedPrice('product-2', 20.0);
      
      productPriceCache.clear();
      
      expect(getCachedPrice('product-1')).toBeUndefined();
      expect(getCachedPrice('product-2')).toBeUndefined();
      expect(productPriceCache.size()).toBe(0);
    });
  });
});
