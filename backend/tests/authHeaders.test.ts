import { api } from './helpers/supertest';

describe('Authentication Headers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for Bearer token authentication on protected routes
   * Validates that Authorization: Bearer <jwt> is required on protected endpoints
   */
  describe('Bearer Token Authentication', () => {
    const protectedRoutes = [
      // Profile routes
      { method: 'get', path: '/api/v1/profile', description: 'Profile endpoint' },
      { method: 'put', path: '/api/v1/profile', description: 'Update profile endpoint' },
      { method: 'post', path: '/api/v1/profile/push-token', description: 'Push token endpoint' },
      {
        method: 'get',
        path: '/api/v1/profile/preferences',
        description: 'Get preferences endpoint',
      },
      {
        method: 'put',
        path: '/api/v1/profile/preferences',
        description: 'Update preferences endpoint',
      },
      {
        method: 'get',
        path: '/api/v1/profile/data-preferences',
        description: 'Get data preferences endpoint',
      },
      {
        method: 'put',
        path: '/api/v1/profile/data-preferences',
        description: 'Update data preferences endpoint',
      },

      // Cart routes
      { method: 'get', path: '/api/v1/cart', description: 'Get cart endpoint' },
      { method: 'post', path: '/api/v1/cart/items', description: 'Add cart item endpoint' },
      { method: 'post', path: '/api/v1/cart/update', description: 'Update cart endpoint' },
      {
        method: 'put',
        path: '/api/v1/cart/items/test-item',
        description: 'Update cart item endpoint',
      },
      {
        method: 'delete',
        path: '/api/v1/cart/items/test-item',
        description: 'Delete cart item endpoint',
      },
      { method: 'delete', path: '/api/v1/cart', description: 'Clear cart endpoint' },
      { method: 'post', path: '/api/v1/cart/apply-coupon', description: 'Apply coupon endpoint' },

      // Auth routes (user info)
      { method: 'get', path: '/api/v1/auth/me', description: 'Get current user endpoint' },

      // Awards routes
      { method: 'get', path: '/api/v1/awards', description: 'Get awards endpoint' },
      {
        method: 'post',
        path: '/api/v1/awards/test-award/redeem',
        description: 'Redeem award endpoint',
      },
      {
        method: 'get',
        path: '/api/v1/awards/test-award',
        description: 'Get specific award endpoint',
      },

      // Journal routes
      {
        method: 'get',
        path: '/api/v1/journal/entries',
        description: 'Get journal entries endpoint',
      },
      {
        method: 'post',
        path: '/api/v1/journal/entries',
        description: 'Create journal entry endpoint',
      },
      {
        method: 'put',
        path: '/api/v1/journal/entries/test-entry',
        description: 'Update journal entry endpoint',
      },

      // Order routes
      { method: 'post', path: '/api/v1/orders', description: 'Create order endpoint' },
      { method: 'get', path: '/api/v1/orders', description: 'Get orders endpoint' },
      {
        method: 'get',
        path: '/api/v1/orders/test-order',
        description: 'Get specific order endpoint',
      },
      {
        method: 'put',
        path: '/api/v1/orders/test-order/cancel',
        description: 'Cancel order endpoint',
      },
      {
        method: 'get',
        path: '/api/v1/orders/test-order/tracking',
        description: 'Order tracking endpoint',
      },
      {
        method: 'post',
        path: '/api/v1/orders/test-order/rate',
        description: 'Rate order endpoint',
      },
    ];

    describe('Missing Authorization Header', () => {
      protectedRoutes.forEach(({ method, path, description }) => {
        it(`should reject ${method.toUpperCase()} ${path} (${description}) without Authorization header`, async () => {
          await (api() as any)
            [method](path)
            .expect(401)
            .expect((res: any) => {
              expect(res.body).toHaveProperty('error');
              expect(res.body.error).toMatch(
                /Missing token|Missing or invalid Authorization header/i
              );
            });
        });
      });
    });

    describe('Invalid Authorization Header Format', () => {
      const invalidHeaders = [
        { header: 'invalid-token', description: 'token without Bearer prefix' },
        { header: 'Bearer', description: 'Bearer without token' },
        { header: 'Bearer ', description: 'Bearer with only space' },
        { header: 'Basic dGVzdA==', description: 'Basic auth instead of Bearer' },
        { header: 'Token abc123', description: 'Token prefix instead of Bearer' },
        { header: '', description: 'empty string' },
      ];

      invalidHeaders.forEach(({ header, description }) => {
        it(`should reject requests with ${description}`, async () => {
          // Test a few representative routes with invalid headers
          const testRoutes = [
            { method: 'get', path: '/api/v1/profile' },
            { method: 'get', path: '/api/v1/cart' },
            { method: 'get', path: '/api/v1/auth/me' },
          ];

          for (const { method, path } of testRoutes) {
            await (api() as any)
              [method](path)
              .set('Authorization', header)
              .expect(401)
              .expect((res: any) => {
                expect(res.body).toHaveProperty('error');
                expect(res.body.error).toMatch(
                  /Missing token|Missing or invalid Authorization header|Invalid token/i
                );
              });
          }
        });
      });
    });

    describe('Invalid JWT Tokens', () => {
      const invalidTokens = [
        { token: 'invalid-jwt-token', description: 'malformed JWT' },
        {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
          description: 'JWT with invalid payload',
        },
        { token: 'expired-token', description: 'expired token' },
        { token: '123456', description: 'non-JWT token' },
      ];

      invalidTokens.forEach(({ token, description }) => {
        it(`should reject requests with ${description}`, async () => {
          // Test representative routes with invalid tokens
          const testRoutes = [
            { method: 'get', path: '/api/v1/profile' },
            { method: 'get', path: '/api/v1/cart' },
          ];

          for (const { method, path } of testRoutes) {
            await (api() as any)
              [method](path)
              .set('Authorization', `Bearer ${token}`)
              .expect(401)
              .expect((res: any) => {
                expect(res.body).toHaveProperty('error');
                expect(res.body.error).toMatch(/Invalid token|Invalid or expired token/i);
              });
          }
        });
      });
    });

    describe('Valid JWT Tokens', () => {
      it('should accept requests with valid Bearer token', async () => {
        // Test routes that should succeed with valid tokens
        const validToken = 'valid-token';

        // Test profile endpoint - should return user data
        await api().get('/api/v1/profile').set('Authorization', `Bearer ${validToken}`).expect(200);

        // Test cart endpoint - should return cart data
        await api().get('/api/v1/cart').set('Authorization', `Bearer ${validToken}`).expect(200);

        // Test auth/me endpoint - should return current user
        await api().get('/api/v1/auth/me').set('Authorization', `Bearer ${validToken}`).expect(200);
      });

      it('should accept requests with signed valid token', async () => {
        const signedToken = 'signed-valid-token';

        await api()
          .get('/api/v1/profile')
          .set('Authorization', `Bearer ${signedToken}`)
          .expect(200);

        await api().get('/api/v1/cart').set('Authorization', `Bearer ${signedToken}`).expect(200);
      });
    });
  });

  describe('Authorization Header Case Sensitivity', () => {
    it('should accept Authorization header with correct case', async () => {
      await api().get('/api/v1/profile').set('Authorization', 'Bearer valid-token').expect(200);
    });

    it('should accept authorization header with lowercase', async () => {
      await api().get('/api/v1/profile').set('authorization', 'Bearer valid-token').expect(200);
    });

    it('should reject requests with incorrect Bearer case', async () => {
      await api()
        .get('/api/v1/profile')
        .set('Authorization', 'bearer valid-token') // lowercase 'bearer'
        .expect(401);
    });
  });

  describe('Multiple Authentication Scenarios', () => {
    it('should handle requests with multiple Authorization headers gracefully', async () => {
      // This test verifies behavior when multiple auth headers are present
      // Express typically uses the first one, but behavior may vary
      await api()
        .get('/api/v1/profile')
        .set('Authorization', 'Bearer valid-token')
        .set('Authorization', 'Bearer invalid-token')
        .expect((res: any) => {
          // Should either succeed (first header used) or fail (conflict handling)
          expect([200, 401]).toContain(res.status);
        });
    });

    it('should prioritize Authorization header over other auth methods', async () => {
      await api()
        .get('/api/v1/profile')
        .set('Authorization', 'Bearer valid-token')
        .set('Cookie', 'auth=some-cookie-value')
        .expect(200);
    });
  });

  describe('Protected Route Access Control', () => {
    it('should allow access to protected resources with valid token', async () => {
      const validToken = 'valid-token';

      // Test that we can access user-specific resources
      const profileResponse = await api()
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(profileResponse.body).toHaveProperty('email');
      expect(profileResponse.body).toHaveProperty('id');
    });

    it('should prevent access to protected resources without authentication', async () => {
      // Ensure we cannot access sensitive endpoints without auth
      await api().put('/api/v1/profile').send({ name: 'Hacker Attempt' }).expect(401);

      await api().delete('/api/v1/cart').expect(401);

      await api().post('/api/v1/orders').send({ items: [] }).expect(401);
    });
  });

  describe('Public Endpoints', () => {
    const publicRoutes = [
      { method: 'get', path: '/api/v1/health', description: 'Health check endpoint' },
      { method: 'post', path: '/api/v1/auth/register', description: 'Registration endpoint' },
      { method: 'post', path: '/api/v1/auth/login', description: 'Login endpoint' },
      {
        method: 'post',
        path: '/api/v1/auth/forgot-password',
        description: 'Forgot password endpoint',
      },
      { method: 'get', path: '/api/v1/products', description: 'Products endpoint' },
      // Note: /api/v1/stores endpoint excluded due to Prisma mock limitations in test environment
    ];

    publicRoutes.forEach(({ method, path, description }) => {
      it(`should allow access to ${method.toUpperCase()} ${path} (${description}) without authentication`, async () => {
        const response = await (api() as any)[method](path);

        // Public endpoints should not return 401 (may return other errors like 400, 404, 500, etc.)
        // In test environment, database errors (500) are acceptable for endpoints that require DB
        expect(response.status).not.toBe(401);
      });
    });
  });
});
