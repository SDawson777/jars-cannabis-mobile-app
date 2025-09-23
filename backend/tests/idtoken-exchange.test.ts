import { api } from './helpers/supertest';

describe('Auth integration', () => {
  it('registers (or logs in) and can access protected profile endpoint', async () => {
    const email = `int-test-${Date.now()}@example.com`;
    const password = 'securePassword123';

    // Register
    const reg = await api().post('/api/v1/auth/register').send({ email, password }).expect(201);
    expect(reg.body).toHaveProperty('token');
    const token = reg.body.token as string;

    // Access protected profile
    const profileRes = await api()
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(profileRes.body).toHaveProperty('email');
  });
});
