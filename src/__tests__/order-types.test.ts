import type { OrderItem, Order, OrdersResponse } from '../types/order';

describe('order types', () => {
  describe('OrderItem', () => {
    it('has correct structure with id, name, quantity, and price', () => {
      const item: OrderItem = {
        id: 'item-123',
        name: 'Blue Dream 3.5g',
        quantity: 2,
        price: 29.99,
      };

      expect(item.id).toBe('item-123');
      expect(item.name).toBe('Blue Dream 3.5g');
      expect(item.quantity).toBe(2);
      expect(item.price).toBe(29.99);
    });

    it('accepts integer quantity', () => {
      const item: OrderItem = {
        id: '1',
        name: 'Product',
        quantity: 5,
        price: 10.0,
      };

      expect(item.quantity).toBe(5);
      expect(Number.isInteger(item.quantity)).toBe(true);
    });

    it('accepts decimal price', () => {
      const item: OrderItem = {
        id: '1',
        name: 'Product',
        quantity: 1,
        price: 19.99,
      };

      expect(item.price).toBe(19.99);
      expect(typeof item.price).toBe('number');
    });

    it('accepts single quantity item', () => {
      const item: OrderItem = {
        id: '1',
        name: 'Single Item',
        quantity: 1,
        price: 50.0,
      };

      expect(item.quantity).toBe(1);
    });

    it('accepts various product names', () => {
      const item: OrderItem = {
        id: '1',
        name: 'Premium Sativa Strain - Large (7g) - Limited Edition',
        quantity: 1,
        price: 89.99,
      };

      expect(item.name).toContain('Premium');
      expect(item.name).toContain('7g');
    });
  });

  describe('Order', () => {
    it('has correct structure with all required fields', () => {
      const order: Order = {
        id: 'order-123',
        createdAt: '2026-01-23T10:00:00Z',
        total: 100.0,
        status: 'completed',
        store: 'Nimbus Denver',
        items: [],
        subtotal: 85.0,
        taxes: 10.0,
        fees: 5.0,
      };

      expect(order.id).toBe('order-123');
      expect(order.createdAt).toBe('2026-01-23T10:00:00Z');
      expect(order.total).toBe(100.0);
      expect(order.status).toBe('completed');
      expect(order.store).toBe('Nimbus Denver');
      expect(order.items).toEqual([]);
      expect(order.subtotal).toBe(85.0);
      expect(order.taxes).toBe(10.0);
      expect(order.fees).toBe(5.0);
    });

    it('accepts items array with multiple items', () => {
      const order: Order = {
        id: 'order-456',
        createdAt: '2026-01-23T11:00:00Z',
        total: 79.98,
        status: 'pending',
        store: 'Nimbus Boulder',
        items: [
          { id: '1', name: 'Item 1', quantity: 2, price: 19.99 },
          { id: '2', name: 'Item 2', quantity: 1, price: 39.99 },
        ],
        subtotal: 79.97,
        taxes: 0.0,
        fees: 0.01,
      };

      expect(order.items).toHaveLength(2);
      expect(order.items[0].name).toBe('Item 1');
      expect(order.items[1].name).toBe('Item 2');
    });

    it('accepts various status values', () => {
      const statuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];

      statuses.forEach(status => {
        const order: Order = {
          id: `order-${status}`,
          createdAt: '2026-01-23T10:00:00Z',
          total: 50.0,
          status,
          store: 'Test Store',
          items: [],
          subtotal: 45.0,
          taxes: 5.0,
          fees: 0.0,
        };

        expect(order.status).toBe(status);
      });
    });

    it('accepts ISO date string for createdAt', () => {
      const order: Order = {
        id: 'order-1',
        createdAt: '2026-01-23T15:30:45.123Z',
        total: 100.0,
        status: 'completed',
        store: 'Store',
        items: [],
        subtotal: 90.0,
        taxes: 10.0,
        fees: 0.0,
      };

      expect(order.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('calculates total from subtotal, taxes, and fees', () => {
      const order: Order = {
        id: 'order-1',
        createdAt: '2026-01-23T10:00:00Z',
        total: 115.5,
        status: 'completed',
        store: 'Store',
        items: [],
        subtotal: 100.0,
        taxes: 10.5,
        fees: 5.0,
      };

      expect(order.total).toBe(order.subtotal + order.taxes + order.fees);
    });

    it('accepts zero taxes and fees', () => {
      const order: Order = {
        id: 'order-1',
        createdAt: '2026-01-23T10:00:00Z',
        total: 50.0,
        status: 'completed',
        store: 'Store',
        items: [],
        subtotal: 50.0,
        taxes: 0.0,
        fees: 0.0,
      };

      expect(order.taxes).toBe(0);
      expect(order.fees).toBe(0);
    });

    it('accepts various store names', () => {
      const order: Order = {
        id: 'order-1',
        createdAt: '2026-01-23T10:00:00Z',
        total: 100.0,
        status: 'completed',
        store: 'Nimbus Cannabis - Downtown Denver Location',
        items: [],
        subtotal: 90.0,
        taxes: 10.0,
        fees: 0.0,
      };

      expect(order.store).toContain('Denver');
    });
  });

  describe('OrdersResponse', () => {
    it('has correct structure with orders array', () => {
      const response: OrdersResponse = {
        orders: [
          {
            id: 'order-1',
            createdAt: '2026-01-23T10:00:00Z',
            total: 50.0,
            status: 'completed',
            store: 'Store 1',
            items: [],
            subtotal: 45.0,
            taxes: 5.0,
            fees: 0.0,
          },
          {
            id: 'order-2',
            createdAt: '2026-01-23T11:00:00Z',
            total: 75.0,
            status: 'pending',
            store: 'Store 2',
            items: [],
            subtotal: 70.0,
            taxes: 5.0,
            fees: 0.0,
          },
        ],
      };

      expect(response.orders).toHaveLength(2);
      expect(response.orders[0].id).toBe('order-1');
      expect(response.orders[1].id).toBe('order-2');
    });

    it('accepts empty orders array', () => {
      const response: OrdersResponse = {
        orders: [],
      };

      expect(response.orders).toEqual([]);
      expect(response.orders).toHaveLength(0);
    });

    it('accepts optional nextPage', () => {
      const withNextPage: OrdersResponse = {
        orders: [],
        nextPage: 2,
      };

      const withoutNextPage: OrdersResponse = {
        orders: [],
      };

      expect(withNextPage.nextPage).toBe(2);
      expect(withoutNextPage.nextPage).toBeUndefined();
    });

    it('accepts nextPage as page number', () => {
      const response: OrdersResponse = {
        orders: [],
        nextPage: 5,
      };

      expect(response.nextPage).toBe(5);
      expect(typeof response.nextPage).toBe('number');
    });

    it('accepts multiple pages', () => {
      const page1: OrdersResponse = {
        orders: [
          {
            id: 'order-1',
            createdAt: '2026-01-23T10:00:00Z',
            total: 50.0,
            status: 'completed',
            store: 'Store',
            items: [],
            subtotal: 45.0,
            taxes: 5.0,
            fees: 0.0,
          },
        ],
        nextPage: 2,
      };

      const page2: OrdersResponse = {
        orders: [
          {
            id: 'order-2',
            createdAt: '2026-01-23T11:00:00Z',
            total: 60.0,
            status: 'completed',
            store: 'Store',
            items: [],
            subtotal: 55.0,
            taxes: 5.0,
            fees: 0.0,
          },
        ],
        nextPage: 3,
      };

      expect(page1.nextPage).toBe(2);
      expect(page2.nextPage).toBe(3);
    });

    it('last page has no nextPage', () => {
      const lastPage: OrdersResponse = {
        orders: [
          {
            id: 'order-100',
            createdAt: '2026-01-23T10:00:00Z',
            total: 50.0,
            status: 'completed',
            store: 'Store',
            items: [],
            subtotal: 45.0,
            taxes: 5.0,
            fees: 0.0,
          },
        ],
      };

      expect(lastPage.nextPage).toBeUndefined();
    });
  });

  describe('type compatibility', () => {
    it('Order can contain OrderItems', () => {
      const order: Order = {
        id: 'order-1',
        createdAt: '2026-01-23T10:00:00Z',
        total: 79.98,
        status: 'completed',
        store: 'Store',
        items: [
          { id: '1', name: 'Item 1', quantity: 2, price: 19.99 },
          { id: '2', name: 'Item 2', quantity: 1, price: 39.99 },
        ],
        subtotal: 79.97,
        taxes: 0.0,
        fees: 0.01,
      };

      expect(order.items[0]).toHaveProperty('id');
      expect(order.items[0]).toHaveProperty('name');
      expect(order.items[0]).toHaveProperty('quantity');
      expect(order.items[0]).toHaveProperty('price');
    });

    it('OrdersResponse can contain Orders', () => {
      const response: OrdersResponse = {
        orders: [
          {
            id: 'order-1',
            createdAt: '2026-01-23T10:00:00Z',
            total: 50.0,
            status: 'completed',
            store: 'Store',
            items: [],
            subtotal: 45.0,
            taxes: 5.0,
            fees: 0.0,
          },
        ],
      };

      expect(response.orders[0]).toHaveProperty('id');
      expect(response.orders[0]).toHaveProperty('createdAt');
      expect(response.orders[0]).toHaveProperty('total');
      expect(response.orders[0]).toHaveProperty('status');
      expect(response.orders[0]).toHaveProperty('store');
      expect(response.orders[0]).toHaveProperty('items');
    });

    it('can map and filter orders', () => {
      const response: OrdersResponse = {
        orders: [
          {
            id: 'order-1',
            createdAt: '2026-01-23T10:00:00Z',
            total: 25.0,
            status: 'completed',
            store: 'Store',
            items: [],
            subtotal: 20.0,
            taxes: 5.0,
            fees: 0.0,
          },
          {
            id: 'order-2',
            createdAt: '2026-01-23T11:00:00Z',
            total: 150.0,
            status: 'completed',
            store: 'Store',
            items: [],
            subtotal: 140.0,
            taxes: 10.0,
            fees: 0.0,
          },
        ],
      };

      const largeOrders = response.orders.filter(o => o.total > 100);
      const orderIds = response.orders.map(o => o.id);

      expect(largeOrders).toHaveLength(1);
      expect(orderIds).toEqual(['order-1', 'order-2']);
    });

    it('can calculate total from items', () => {
      const order: Order = {
        id: 'order-1',
        createdAt: '2026-01-23T10:00:00Z',
        total: 79.97,
        status: 'completed',
        store: 'Store',
        items: [
          { id: '1', name: 'Item 1', quantity: 2, price: 19.99 },
          { id: '2', name: 'Item 2', quantity: 1, price: 39.99 },
        ],
        subtotal: 79.97,
        taxes: 0.0,
        fees: 0.0,
      };

      const calculatedSubtotal = order.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      expect(calculatedSubtotal).toBeCloseTo(order.subtotal, 2);
    });
  });
});
