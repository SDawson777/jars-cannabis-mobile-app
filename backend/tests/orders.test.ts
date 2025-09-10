import { api } from './helpers/supertest';

describe('Orders Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    it('should get user orders successfully', async () => {
      const response = await api()
        .get('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.orders)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      await api()
        .get('/api/orders')
        .expect(401);
    });

    it('should filter orders by status', async () => {
      const response = await api()
        .get('/api/orders?status=pending')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.orders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            status: 'pending'
          })
        ])
      );
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order by ID successfully', async () => {
      const orderId = 'test-order-id';

      const response = await api()
        .get(`/api/orders/${orderId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('id', orderId);
      expect(response.body.order).toHaveProperty('items');
      expect(response.body.order).toHaveProperty('total');
      expect(response.body.order).toHaveProperty('status');
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
      expect(response.body.error).toContain('not found');
    });

    it('should not allow access to other users orders', async () => {
      const orderId = 'other-users-order-id';

      const response = await api()
        .get(`/api/orders/${orderId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('access');
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