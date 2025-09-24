import { api } from './helpers/supertest';

// Basic shape tests for the normalized authenticated awards API.
// Ensures response includes { user, awards } and enforces auth.

describe('GET /api/awards', () => {
  it('rejects unauthenticated requests', async () => {
    await api().get('/api/awards').expect(401);
  });

  it('returns user summary and awards array for authenticated user', async () => {
    const res = await api()
      .get('/api/awards')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id', 'test-user');
    expect(res.body.user).toHaveProperty('points');
    expect(res.body.user).toHaveProperty('tier');
    expect(res.body.user).toHaveProperty('progress');
    expect(typeof res.body.user.points).toBe('number');
    expect(res.body.user.progress).toBeGreaterThanOrEqual(0);
    expect(res.body.user.progress).toBeLessThanOrEqual(1);
    expect(res.body).toHaveProperty('awards');
    expect(Array.isArray(res.body.awards)).toBe(true);
  });
});
