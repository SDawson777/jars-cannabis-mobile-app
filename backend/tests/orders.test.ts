import { api } from './helpers/supertest';

describe('Orders Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    it('should get user orders successfully with OrdersResponse format', async () => {
      const response = await api()
        .get('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
      
      // Check if each order has the expected structure
      if (response.body.orders.length > 0) {
        const order = response.body.orders[0];
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('createdAt');
        expect(order).toHaveProperty('total');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('store'); // Store name, not object
        expect(order).toHaveProperty('subtotal');
        expect(order).toHaveProperty('taxes'); // Renamed from tax
        expect(order).toHaveProperty('fees'); // Added field
        expect(order).toHaveProperty('items');
        expect(Array.isArray(order.items)).toBe(true);
        
        // Check if items are hydrated with names and prices
        if (order.items.length > 0) {
          const item = order.items[0];
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('name'); // Hydrated from product/variant
          expect(item).toHaveProperty('quantity');
          expect(item).toHaveProperty('price'); // Hydrated from unitPrice
        }
      }
    });

    it('should reject request without authentication', async () => {
      await api()
        .get('/api/orders')
        .expect(401);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order by ID successfully with hydrated data', async () => {
      const orderId = 'test-order-id';

      const response = await api()
        .get(`/api/orders/${orderId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      // Should return the order directly, not wrapped in an object
      expect(response.body).toHaveProperty('id', orderId);
      expect(response.body).toHaveProperty('store'); // Store name string
      expect(response.body).toHaveProperty('taxes'); // Renamed from tax
      expect(response.body).toHaveProperty('fees'); // Added field
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      
      // Check if items are hydrated
      if (response.body.items.length > 0) {
        const item = response.body.items[0];
        expect(item).toHaveProperty('name'); // Should be hydrated
        expect(item).toHaveProperty('price'); // Should be hydrated
      }
    });

    it('should reject request without authentication', async () => {
      const orderId = 'test-order-id';

      await api()
        .get(`/api/orders/${orderId}`)
        .expect(401);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await api()
        .get('/api/orders/non-existent-order')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/orders', () => {
    it('should create order successfully', async () => {
      const orderData = {
        deliveryMethod: 'delivery',
        deliveryAddress: {
          street: '123 Main St',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202'
        },
        paymentMethod: 'card',
        paymentDetails: {
          cardToken: 'valid-card-token'
        },
        tip: 2.50
      };

      const response = await api()
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('id');
      expect(response.body.order).toHaveProperty('status', 'pending');
      expect(response.body.order).toHaveProperty('deliveryMethod', orderData.deliveryMethod);
    });

    it('should reject order without authentication', async () => {
      const orderData = {
        deliveryMethod: 'delivery'
      };

      await api()
        .post('/api/orders')
        .send(orderData)
        .expect(401);
    });

    it('should reject order with empty cart', async () => {
      const orderData = {
        deliveryMethod: 'delivery',
        deliveryAddress: {
          street: '123 Main St',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202'
        }
      };

      const response = await api()
        .post('/api/orders')
        .set('Authorization', 'Bearer empty-cart-token')
        .send(orderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('cart');
    });

    it('should reject order with invalid delivery address', async () => {
      const orderData = {
        deliveryMethod: 'delivery',
        deliveryAddress: {
          street: '123 Main St'
          // Missing required fields
        }
      };

      const response = await api()
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send(orderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('address');
    });

    it('should reject order with invalid payment method', async () => {
      const orderData = {
        deliveryMethod: 'delivery',
        deliveryAddress: {
          street: '123 Main St',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202'
        },
        paymentMethod: 'invalid-method'
      };

      const response = await api()
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send(orderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('payment');
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    it('should cancel order successfully', async () => {
      const orderId = 'test-order-id';

      const response = await api()
        .put(`/api/orders/${orderId}/cancel`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('status', 'cancelled');
      expect(response.body).toHaveProperty('message');
    });

    it('should reject cancel without authentication', async () => {
      const orderId = 'test-order-id';

      await api()
        .put(`/api/orders/${orderId}/cancel`)
        .expect(401);
    });

    it('should reject cancel for non-cancellable order', async () => {
      const orderId = 'delivered-order-id';

      const response = await api()
        .put(`/api/orders/${orderId}/cancel`)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('cancel');
    });
  });

  describe('GET /api/orders/:id/tracking', () => {
    it('should get order tracking information', async () => {
      const orderId = 'test-order-id';

      const response = await api()
        .get(`/api/orders/${orderId}/tracking`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('tracking');
      expect(response.body.tracking).toHaveProperty('status');
      expect(response.body.tracking).toHaveProperty('estimatedDelivery');
      expect(response.body.tracking).toHaveProperty('updates');
      expect(Array.isArray(response.body.tracking.updates)).toBe(true);
    });

    it('should reject tracking request without authentication', async () => {
      const orderId = 'test-order-id';

      await api()
        .get(`/api/orders/${orderId}/tracking`)
        .expect(401);
    });

    it('should return 404 for non-existent order tracking', async () => {
      const response = await api()
        .get('/api/orders/non-existent-order/tracking')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/orders/:id/rate', () => {
    it('should rate completed order successfully', async () => {
      const orderId = 'completed-order-id';
      const ratingData = {
        rating: 5,
        comment: 'Excellent service!',
        driverRating: 5,
        productRatings: [
          { productId: 'product-1', rating: 4 },
          { productId: 'product-2', rating: 5 }
        ]
      };

      const response = await api()
        .post(`/api/orders/${orderId}/rate`)
        .set('Authorization', 'Bearer valid-token')
        .send(ratingData)
        .expect(201);

      expect(response.body).toHaveProperty('rating');
      expect(response.body.rating).toHaveProperty('rating', ratingData.rating);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject rating without authentication', async () => {
      const orderId = 'completed-order-id';
      const ratingData = {
        rating: 5,
        comment: 'Great!'
      };

      await api()
        .post(`/api/orders/${orderId}/rate`)
        .send(ratingData)
        .expect(401);
    });

    it('should reject rating for non-completed order', async () => {
      const orderId = 'pending-order-id';
      const ratingData = {
        rating: 5,
        comment: 'Great!'
      };

      const response = await api()
        .post(`/api/orders/${orderId}/rate`)
        .set('Authorization', 'Bearer valid-token')
        .send(ratingData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('completed');
    });
  });
});