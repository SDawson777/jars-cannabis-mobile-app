// src/__tests__/stores/useCartStore.test.ts
import { useCartStore, CartItem, hydrateCartStore } from '../../../stores/useCartStore';

// Reset store state before each test
beforeEach(() => {
  useCartStore.setState({ items: [], appliedCoupon: undefined });
});

describe('useCartStore', () => {
  describe('initial state', () => {
    it('should start with empty items array', () => {
      const { items } = useCartStore.getState();
      expect(items).toEqual([]);
    });

    it('should start with no applied coupon', () => {
      const { appliedCoupon } = useCartStore.getState();
      expect(appliedCoupon).toBeUndefined();
    });
  });

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      const item: CartItem = {
        id: 'prod-1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 29.99,
        quantity: 1,
      };

      useCartStore.getState().addItem(item);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Test Product');
      expect(items[0].price).toBe(29.99);
    });

    it('should increment quantity for existing item', () => {
      const item: CartItem = {
        id: 'prod-1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 29.99,
        quantity: 1,
      };

      useCartStore.getState().addItem(item);
      useCartStore.getState().addItem({ ...item, quantity: 2 });

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(3);
    });

    it('should add separate items for different variants', () => {
      const item1: CartItem = {
        id: 'prod-1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 29.99,
        quantity: 1,
        variantId: 'variant-a',
      };

      const item2: CartItem = {
        id: 'prod-1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 34.99,
        quantity: 1,
        variantId: 'variant-b',
      };

      useCartStore.getState().addItem(item1);
      useCartStore.getState().addItem(item2);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(2);
    });
  });

  describe('updateQuantity', () => {
    it('should update the quantity of an item', () => {
      const item: CartItem = {
        id: 'prod-1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 29.99,
        quantity: 1,
      };

      useCartStore.getState().addItem(item);
      useCartStore.getState().updateQuantity('prod-1', 5);

      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(5);
    });

    it('should not affect other items', () => {
      const item1: CartItem = {
        id: 'prod-1',
        productId: 'prod-1',
        name: 'Product 1',
        price: 29.99,
        quantity: 1,
      };
      const item2: CartItem = {
        id: 'prod-2',
        productId: 'prod-2',
        name: 'Product 2',
        price: 19.99,
        quantity: 2,
      };

      useCartStore.getState().addItem(item1);
      useCartStore.getState().addItem(item2);
      useCartStore.getState().updateQuantity('prod-1', 10);

      const { items } = useCartStore.getState();
      expect(items.find(i => i.id === 'prod-1')?.quantity).toBe(10);
      expect(items.find(i => i.id === 'prod-2')?.quantity).toBe(2);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      const item: CartItem = {
        id: 'prod-1',
        productId: 'prod-1',
        name: 'Test Product',
        price: 29.99,
        quantity: 1,
      };

      useCartStore.getState().addItem(item);
      expect(useCartStore.getState().items).toHaveLength(1);

      useCartStore.getState().removeItem('prod-1');
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('should only remove the specified item', () => {
      useCartStore.getState().addItem({
        id: 'prod-1',
        productId: 'prod-1',
        name: 'Product 1',
        price: 29.99,
        quantity: 1,
      });
      useCartStore.getState().addItem({
        id: 'prod-2',
        productId: 'prod-2',
        name: 'Product 2',
        price: 19.99,
        quantity: 1,
      });

      useCartStore.getState().removeItem('prod-1');

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('prod-2');
    });
  });

  describe('setItems', () => {
    it('should replace all items in the cart', () => {
      useCartStore.getState().addItem({
        id: 'old-1',
        productId: 'old-1',
        name: 'Old Item',
        price: 10,
        quantity: 1,
      });

      const newItems: CartItem[] = [
        { id: 'new-1', productId: 'new-1', name: 'New Item 1', price: 20, quantity: 2 },
        { id: 'new-2', productId: 'new-2', name: 'New Item 2', price: 30, quantity: 3 },
      ];

      useCartStore.getState().setItems(newItems);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(2);
      expect(items[0].name).toBe('New Item 1');
      expect(items[1].name).toBe('New Item 2');
    });

    it('should ensure productId is set', () => {
      const newItems: CartItem[] = [
        { id: 'item-1', productId: 'item-1', name: 'Item', price: 20, quantity: 1 },
      ];

      useCartStore.getState().setItems(newItems);

      const { items } = useCartStore.getState();
      expect(items[0].productId).toBe('item-1');
    });
  });

  describe('setAppliedCoupon', () => {
    it('should set the applied coupon', () => {
      useCartStore.getState().setAppliedCoupon('SAVE10');
      expect(useCartStore.getState().appliedCoupon).toBe('SAVE10');
    });

    it('should clear the coupon when undefined', () => {
      useCartStore.getState().setAppliedCoupon('SAVE10');
      useCartStore.getState().setAppliedCoupon(undefined);
      expect(useCartStore.getState().appliedCoupon).toBeUndefined();
    });
  });

  describe('clearCart', () => {
    it('should clear all items and coupon', () => {
      useCartStore.getState().addItem({
        id: 'prod-1',
        productId: 'prod-1',
        name: 'Test',
        price: 10,
        quantity: 1,
      });
      useCartStore.getState().setAppliedCoupon('SAVE20');

      useCartStore.getState().clearCart();

      const state = useCartStore.getState();
      expect(state.items).toEqual([]);
      expect(state.appliedCoupon).toBeUndefined();
    });
  });

  describe('hydrateCartStore', () => {
    it('should be a function', () => {
      expect(typeof hydrateCartStore).toBe('function');
    });
  });
});
