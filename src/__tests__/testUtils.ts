import type { StoreData } from '../@types/store';

export const makeStore = (overrides: Partial<StoreData> = {}): StoreData => ({
  id: '1',
  name: 'Midtown',
  slug: 'midtown',
  latitude: 0,
  longitude: 0,
  address: '123 Main St',
  city: 'Phoenix',
  state: 'AZ',
  zip: '85001',
  phone: '555-555-5555',
  ...overrides,
});
