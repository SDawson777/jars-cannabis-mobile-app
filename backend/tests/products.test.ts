import { api } from './helpers/supertest';

describe('Products Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should get all products successfully', async () => {
      const response = await api().get('/api/products').expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter products by category', async () => {
      const response = await api().get('/api/products?category=flower').expect(200);

      expect(response.body.products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: 'flower',
          }),
        ])
      );
    });

    it('should filter products by price range', async () => {
      const response = await api().get('/api/products?minPrice=10&maxPrice=50').expect(200);

      expect(response.body.products.length).toBeGreaterThanOrEqual(0);
    });

    it('should search products by name', async () => {
      const response = await api().get('/api/products?search=og').expect(200);

      expect(response.body.products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringMatching(/og/i),
          }),
        ])
      );
    });

    it('should paginate products correctly', async () => {
      const response = await api().get('/api/products?page=1&limit=5').expect(200);

      expect(response.body.products.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 5);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by ID successfully', async () => {
      const productId = 'test-product-id';

      const response = await api().get(`/api/products/${productId}`).expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('id', productId);
      expect(response.body.product).toHaveProperty('name');
      expect(response.body.product).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await api().get('/api/products/non-existent-id').expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should include related products in response', async () => {
      const productId = 'test-product-id';

      const response = await api().get(`/api/products/${productId}`).expect(200);

      expect(response.body).toHaveProperty('relatedProducts');
      expect(Array.isArray(response.body.relatedProducts)).toBe(true);
    });
  });

  describe('GET /api/products/slug/:slug', () => {
    it('should get product by slug successfully', async () => {
      const productSlug = 'blue-dream-flower';

      const response = await api().get(`/api/products/slug/${productSlug}`).expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('slug', productSlug);
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await api().get('/api/products/slug/non-existent-slug').expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/products/categories', () => {
    it('should get all product categories', async () => {
      const response = await api().get('/api/products/categories').expect(200);

      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            count: expect.any(Number),
          }),
        ])
      );
    });
  });

  describe('GET /api/products/featured', () => {
    it('should get featured products', async () => {
      const response = await api().get('/api/products/featured').expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            featured: true,
          }),
        ])
      );
    });
  });

  describe('POST /api/products/:id/reviews', () => {
    it('should add review to product with valid auth', async () => {
      const productId = 'test-product-id';
      const reviewData = {
        rating: 5,
        comment: 'Great product!',
        recommend: true,
      };

      const response = await api()
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', 'Bearer valid-token')
        .send(reviewData)
        .expect(201);

      expect(response.body).toHaveProperty('review');
      expect(response.body.review).toHaveProperty('rating', reviewData.rating);
    });

    it('should reject review without authentication', async () => {
      const productId = 'test-product-id';
      const reviewData = {
        rating: 5,
        comment: 'Great product!',
      };

      await api().post(`/api/products/${productId}/reviews`).send(reviewData).expect(401);
    });

    it('should reject review with invalid rating', async () => {
      const productId = 'test-product-id';
      const reviewData = {
        rating: 6, // Invalid rating (should be 1-5)
        comment: 'Great product!',
      };

      const response = await api()
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', 'Bearer valid-token')
        .send(reviewData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
