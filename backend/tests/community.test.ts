import { api } from './helpers/supertest';

describe('GET /api/community/posts', () => {
  it('returns a list of posts with expected shape', async () => {
    const res = await api().get('/api/community/posts').expect(200);
    const body = res.body || {};
    const posts = body.posts || body;
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
    const p = posts[0];
    expect(p).toHaveProperty('id');
    expect(p).toHaveProperty('user');
    expect(p).toHaveProperty('time');
    expect(p).toHaveProperty('text');
  });
});
