import { api } from './helpers/supertest';

describe('GET /api/content/legal', () => {
  it('returns structured legal content with state notices and timestamps', async () => {
    const res = await api().get('/api/content/legal').expect(200);
    expect(res.body).toHaveProperty('terms');
    expect(res.body).toHaveProperty('privacy');
    expect(res.body).toHaveProperty('accessibility');
    expect(res.body).toHaveProperty('stateNotices');
    expect(typeof res.body.stateNotices).toBe('object');
    expect(res.body).toHaveProperty('lastUpdated');
    expect(typeof res.body.lastUpdated).toBe('object');
  });
});
