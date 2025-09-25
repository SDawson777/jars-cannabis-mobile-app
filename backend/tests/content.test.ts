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

describe('GET /api/content/articles', () => {
  it('returns an array of CMS-like articles', async () => {
    const res = await api().get('/api/content/articles').expect(200);
    const items = res.body.items || res.body; // support both shapes
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    const a = items[0];
    expect(a).toHaveProperty('__id');
    expect(a).toHaveProperty('title');
    expect(a).toHaveProperty('slug');
    expect(a).toHaveProperty('publishedAt');
    expect(a).toHaveProperty('body');
  });
});

describe('GET /api/content/articles/:slug', () => {
  it('returns a single CMS-like article', async () => {
    const res = await api().get('/api/content/articles/demo-article').expect(200);
    const a = res.body;
    expect(a).toHaveProperty('__id');
    expect(a).toHaveProperty('title');
    expect(a).toHaveProperty('slug', 'demo-article');
    expect(a).toHaveProperty('publishedAt');
    expect(a).toHaveProperty('body');
  });

  it('supports preview header without error', async () => {
    await api().get('/api/content/articles/preview-article').set('X-Preview', 'true').expect(200);
  });
});
