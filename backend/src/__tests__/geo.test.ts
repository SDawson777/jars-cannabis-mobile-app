import { haversineMeters } from '../utils/geo';

describe('haversineMeters', () => {
  describe('same location', () => {
    it('returns 0 for identical coordinates', () => {
      const point = { lat: 39.7392, lng: -104.9903 }; // Denver
      const distance = haversineMeters(point, point);
      expect(distance).toBe(0);
    });

    it('returns 0 when both coordinates are origin', () => {
      const origin = { lat: 0, lng: 0 };
      const distance = haversineMeters(origin, origin);
      expect(distance).toBe(0);
    });
  });

  describe('known distances', () => {
    it('calculates distance between Denver and Boulder (~42km)', () => {
      const denver = { lat: 39.7392, lng: -104.9903 };
      const boulder = { lat: 40.015, lng: -105.2705 };

      const distance = haversineMeters(denver, boulder);

      // Expected ~42km (42000m), allow 1km variance
      expect(distance).toBeGreaterThan(41_000);
      expect(distance).toBeLessThan(43_000);
    });

    it('calculates distance between New York and Los Angeles (~3940km)', () => {
      const newYork = { lat: 40.7128, lng: -74.006 };
      const losAngeles = { lat: 34.0522, lng: -118.2437 };

      const distance = haversineMeters(newYork, losAngeles);

      // Expected ~3944km (3944000m), allow 5km variance
      expect(distance).toBeGreaterThan(3_939_000);
      expect(distance).toBeLessThan(3_949_000);
    });

    it('calculates distance between London and Paris (~340km)', () => {
      const london = { lat: 51.5074, lng: -0.1278 };
      const paris = { lat: 48.8566, lng: 2.3522 };

      const distance = haversineMeters(london, paris);

      // Expected ~340km (340000m), allow 2km variance
      expect(distance).toBeGreaterThan(338_000);
      expect(distance).toBeLessThan(342_000);
    });

    it('calculates short distance (~1km)', () => {
      const pointA = { lat: 39.7392, lng: -104.9903 };
      const pointB = { lat: 39.7482, lng: -104.9903 }; // ~1km north

      const distance = haversineMeters(pointA, pointB);

      // Expected ~1km (1000m), allow 100m variance
      expect(distance).toBeGreaterThan(900);
      expect(distance).toBeLessThan(1100);
    });
  });

  describe('cardinal directions', () => {
    const center = { lat: 0, lng: 0 };

    it('calculates distance going north', () => {
      const north = { lat: 1, lng: 0 };
      const distance = haversineMeters(center, north);

      // 1 degree latitude ~= 111km
      expect(distance).toBeGreaterThan(110_000);
      expect(distance).toBeLessThan(112_000);
    });

    it('calculates distance going south', () => {
      const south = { lat: -1, lng: 0 };
      const distance = haversineMeters(center, south);

      expect(distance).toBeGreaterThan(110_000);
      expect(distance).toBeLessThan(112_000);
    });

    it('calculates distance going east', () => {
      const east = { lat: 0, lng: 1 };
      const distance = haversineMeters(center, east);

      expect(distance).toBeGreaterThan(110_000);
      expect(distance).toBeLessThan(112_000);
    });

    it('calculates distance going west', () => {
      const west = { lat: 0, lng: -1 };
      const distance = haversineMeters(center, west);

      expect(distance).toBeGreaterThan(110_000);
      expect(distance).toBeLessThan(112_000);
    });
  });

  describe('symmetry', () => {
    it('returns same distance regardless of order', () => {
      const denver = { lat: 39.7392, lng: -104.9903 };
      const boulder = { lat: 40.015, lng: -105.2705 };

      const distanceAB = haversineMeters(denver, boulder);
      const distanceBA = haversineMeters(boulder, denver);

      expect(distanceAB).toBeCloseTo(distanceBA, 1);
    });

    it('handles negative coordinates symmetrically', () => {
      const pointA = { lat: -33.8688, lng: 151.2093 }; // Sydney
      const pointB = { lat: 35.6762, lng: 139.6503 }; // Tokyo

      const distanceAB = haversineMeters(pointA, pointB);
      const distanceBA = haversineMeters(pointB, pointA);

      expect(distanceAB).toBeCloseTo(distanceBA, 1);
    });
  });

  describe('edge cases', () => {
    it('handles coordinates at equator', () => {
      const pointA = { lat: 0, lng: 0 };
      const pointB = { lat: 0, lng: 1 };

      const distance = haversineMeters(pointA, pointB);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(200_000); // Reasonable max
    });

    it('handles coordinates at North Pole', () => {
      const pointA = { lat: 90, lng: 0 };
      const pointB = { lat: 89, lng: 0 };

      const distance = haversineMeters(pointA, pointB);

      expect(distance).toBeGreaterThan(110_000);
      expect(distance).toBeLessThan(112_000);
    });

    it('handles coordinates at South Pole', () => {
      const pointA = { lat: -90, lng: 0 };
      const pointB = { lat: -89, lng: 0 };

      const distance = haversineMeters(pointA, pointB);

      expect(distance).toBeGreaterThan(110_000);
      expect(distance).toBeLessThan(112_000);
    });

    it('handles 180° longitude difference', () => {
      const pointA = { lat: 0, lng: -180 };
      const pointB = { lat: 0, lng: 180 };

      const distance = haversineMeters(pointA, pointB);

      // Should be 0 (same meridian)
      expect(distance).toBeCloseTo(0, 0);
    });

    it('handles nearly antipodal points', () => {
      const pointA = { lat: 40, lng: 0 };
      const pointB = { lat: -40, lng: 180 };

      const distance = haversineMeters(pointA, pointB);

      // Should be close to half Earth's circumference (~20000km)
      expect(distance).toBeGreaterThan(15_000_000);
      expect(distance).toBeLessThan(20_100_000);
    });
  });

  describe('precision', () => {
    it('handles very small distances (<100m)', () => {
      const pointA = { lat: 39.7392, lng: -104.9903 };
      const pointB = { lat: 39.7393, lng: -104.9903 }; // ~111m north

      const distance = haversineMeters(pointA, pointB);

      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(120);
    });

    it('returns consistent results for repeated calculations', () => {
      const pointA = { lat: 39.7392, lng: -104.9903 };
      const pointB = { lat: 40.015, lng: -105.2705 };

      const distance1 = haversineMeters(pointA, pointB);
      const distance2 = haversineMeters(pointA, pointB);
      const distance3 = haversineMeters(pointA, pointB);

      expect(distance1).toBe(distance2);
      expect(distance2).toBe(distance3);
    });

    it('handles decimal precision', () => {
      const pointA = { lat: 39.123456, lng: -104.987654 };
      const pointB = { lat: 39.234567, lng: -104.876543 };

      const distance = haversineMeters(pointA, pointB);

      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
      expect(isFinite(distance)).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('calculates distance between nearby stores (~5km)', () => {
      const store1 = { lat: 39.7392, lng: -104.9903 };
      const store2 = { lat: 39.7842, lng: -104.9903 }; // ~5km north

      const distance = haversineMeters(store1, store2);

      expect(distance).toBeGreaterThan(4_900);
      expect(distance).toBeLessThan(5_100);
    });

    it('calculates distance for delivery radius check (~10km)', () => {
      const store = { lat: 39.7392, lng: -104.9903 };
      const customer = { lat: 39.8292, lng: -104.9903 }; // ~10km north

      const distance = haversineMeters(store, customer);
      const DELIVERY_RADIUS_M = 10_000;

      expect(distance).toBeLessThanOrEqual(DELIVERY_RADIUS_M * 1.1); // Within 10% tolerance
      expect(distance).toBeGreaterThan(DELIVERY_RADIUS_M * 0.9);
    });

    it('calculates cross-country distance for service area check', () => {
      const eastCoast = { lat: 40.7128, lng: -74.006 }; // New York
      const westCoast = { lat: 37.7749, lng: -122.4194 }; // San Francisco

      const distance = haversineMeters(eastCoast, westCoast);

      // ~4100km - well outside any reasonable service area
      expect(distance).toBeGreaterThan(4_000_000);
    });
  });
});
