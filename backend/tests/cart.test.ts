import { api } from './helpers/supertest';

describe('Cart Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cart', () => {
    it('should get user cart successfully', async () => {
      const response = await api()
        .get('/api/cart')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart).toHaveProperty('items');
      expect(response.body.cart).toHaveProperty('total');
      expect(Array.isArray(response.body.cart.items)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      await api()
        .get('/api/cart')
        .expect(401);
    });
  });

  describe('POST /api/cart/items', () => {
    it('should add item to cart successfully', async () => {
      const itemData = {
        productId: 'test-product-id',
        quantity: 2,
        variant: 'eighth'
      };

      const response = await api()
        .post('/api/cart/items')
        .set('Authorization', 'Bearer valid-token')
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveProperty('item');
      expect(response.body.item).toHaveProperty('productId', itemData.productId);
      expect(response.body.item).toHaveProperty('quantity', itemData.quantity);
      expect(response.body).toHaveProperty('cart');
    });

    it('should reject add item without authentication', async () => {
      const itemData = {
        productId: 'test-product-id',
        quantity: 2
      };

      await api()
        .post('/api/cart/items')
        .send(itemData)
        .expect(401);
    });

    it('should reject add item with invalid quantity', async () => {
      const itemData = {
        productId: 'test-product-id',
        quantity: -1
      };

      const response = await api()
        .post('/api/cart/items')
        .set('Authorization', 'Bearer valid-token')
        .send(itemData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('quantity');
    });

    it('should reject add item with non-existent product', async () => {
      const itemData = {
        productId: 'non-existent-product',
        quantity: 1
      };

      const response = await api()
        .post('/api/cart/items')
        .set('Authorization', 'Bearer valid-token')
        .send(itemData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('product');
    });
  });

  describe('PUT /api/cart/items/:itemId', () => {
    it('should update cart item quantity successfully', async () => {
      const itemId = 'test-cart-item-id';
      const updateData = {
        quantity: 3
      };

      const response = await api()
        .put(`/api/cart/items/${itemId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('item');
      expect(response.body.item).toHaveProperty('quantity', updateData.quantity);
      expect(response.body).toHaveProperty('cart');
    });

    it('should reject update without authentication', async () => {
      const itemId = 'test-cart-item-id';
      const updateData = {
        quantity: 3
      };

      await api()
        .put(`/api/cart/items/${itemId}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 404 for non-existent cart item', async () => {
      const updateData = {
        quantity: 3
      };

      const response = await api()
        .put('/api/cart/items/non-existent-item')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/cart/items/:itemId', () => {
    it('should remove item from cart successfully', async () => {
      const itemId = 'test-cart-item-id';

      const response = await api()
        .delete(`/api/cart/items/${itemId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('cart');
    });

    it('should reject remove without authentication', async () => {
      const itemId = 'test-cart-item-id';

      await api()
        .delete(`/api/cart/items/${itemId}`)
        .expect(401);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await api()
        .delete('/api/cart/items/non-existent-item')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/cart', () => {
    it('should clear cart successfully', async () => {
      const response = await api()
        .delete('/api/cart')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart.items).toHaveLength(0);
    });

    it('should reject clear cart without authentication', async () => {
      await api()
        .delete('/api/cart')
        .expect(401);
    });
  });

  describe('POST /api/cart/apply-coupon', () => {
    it('should apply valid coupon successfully', async () => {
      const couponData = {
        code: 'SAVE10'
      };

      const response = await api()
        .post('/api/cart/apply-coupon')
        .set('Authorization', 'Bearer valid-token')
        .send(couponData)
        .expect(200);

      expect(response.body).toHaveProperty('cart');
      expect(response.body.cart).toHaveProperty('coupon');
      expect(response.body.cart.coupon).toHaveProperty('code', couponData.code);
    });

    it('should reject invalid coupon', async () => {
      const couponData = {
        code: 'INVALID'
      };

      const response = await api()
        .post('/api/cart/apply-coupon')
        .set('Authorization', 'Bearer valid-token')
        .send(couponData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('coupon');
    });
  });
});