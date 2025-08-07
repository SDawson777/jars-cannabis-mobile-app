import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCartStore, hydrateCartStore } from '../../../stores/useCartStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('cart store persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useCartStore.setState({ items: [] });
  });

  it('rehydrates items from AsyncStorage', async () => {
    useCartStore.getState().addItem({ id: '1', name: 'Test', price: 10, quantity: 2 });
    await new Promise(res => setTimeout(res, 0));
    const stored = await AsyncStorage.getItem('cart');
    jest.resetModules();
    const AsyncStorage2 = require('@react-native-async-storage/async-storage');
    if (stored) await AsyncStorage2.setItem('cart', stored);
    const {
      useCartStore: rehydratedStore,
      hydrateCartStore: rehydrate,
    } = require('../../../stores/useCartStore');
    await rehydrate();
    expect(rehydratedStore.getState().items).toEqual([
      { id: '1', name: 'Test', price: 10, quantity: 2, available: true },
    ]);
  });
});
