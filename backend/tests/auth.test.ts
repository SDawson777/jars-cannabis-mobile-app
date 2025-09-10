import { api } from './helpers/supertest';

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
      };

      const response = await api()
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await api()
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await api()
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('password');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'securePassword123',
      };

      const response = await api()
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', loginData.email);
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const response = await api()
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('credentials');
    });

    it('should reject login with missing email', async () => {
      const loginData = {
        password: 'securePassword123',
      };

      await api()
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token',
      };

      const response = await api()
        .post('/api/auth/refresh')
        .send(refreshData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });

    it('should reject refresh with invalid token', async () => {
      const refreshData = {
        refreshToken: 'invalid-refresh-token',
      };

      await api()
        .post('/api/auth/refresh')
        .send(refreshData)
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      await api()
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const response = await api()
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
    });

    it('should reject request without token', async () => {
      await api()
        .get('/api/auth/me')
        .expect(401);
    });
  });
});