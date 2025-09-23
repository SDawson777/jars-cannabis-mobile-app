import { api } from './helpers/supertest';

describe('GET /personalization/home', () => {
  it('returns a ForYouTodayPayload shaped response', async () => {
    const res = await api()
      .get('/api/v1/personalization/home')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('greeting');
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
    if (res.body.products.length > 0) {
      expect(res.body.products[0]).toHaveProperty('id');
      expect(res.body.products[0]).toHaveProperty('name');
      expect(res.body.products[0]).toHaveProperty('price');
    }
  });

  it('honors the limit query parameter', async () => {
    const res = await api()
      .get('/api/v1/personalization/home?limit=1')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeLessThanOrEqual(1);
  });

  it('prioritizes store-stocked products when storeId is provided', async () => {
    const res = await api()
      .get('/api/v1/personalization/home?storeId=store_1&limit=2')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    // seeded storeProducts marks prod_db_1 as in-stock for store_1, so it should appear in results
    const ids = res.body.products.map((p: any) => p.id);
    expect(ids).toContain('prod_db_1');
  });
});
