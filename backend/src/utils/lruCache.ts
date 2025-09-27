// Simple LRU cache implementation for product/variant price lookups
export class LRUCache<K, V> {
  private capacity: number;
  private cache = new Map<K, V>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first in iteration order)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global product price cache (small capacity, short-lived entries)
export const productPriceCache = new LRUCache<string, { price: number; timestamp: number }>(100);

// Cache helper with TTL
const CACHE_TTL_MS = 30_000; // 30 seconds

export function getCachedPrice(key: string): number | undefined {
  const entry = productPriceCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.price;
  }
  return undefined;
}

export function setCachedPrice(key: string, price: number): void {
  productPriceCache.set(key, { price, timestamp: Date.now() });
}
