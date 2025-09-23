import type { StoreData } from '../@types/store';

export const makeStore = (overrides: Partial<StoreData> = {}): StoreData => ({
  id: '1',
  name: 'Midtown',
  slug: 'midtown',
  latitude: 0,
  longitude: 0,
  address: '123 Main St',
  city: 'Phoenix',
  _state: 'AZ',
  zip: '85001',
  phone: '555-555-5555',
  ...overrides,
});

// Minimal smoke test so this file is treated as a test suite by Jest
test('makeStore returns an object with id', () => {
  const s = makeStore();
  expect(s.id).toBe('1');
});
