import { api } from './helpers/supertest';

describe('POST /api/cart/update', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await api().post('/api/cart/update').send({ items: [] });
    expect(res.status).toBe(401);
  });

  it('updates cart when authenticated', async () => {
    const payload = { items: [{ productId: 'p1', quantity: 2 }] };
    const res = await api()
      .post('/api/cart/update')
      .set('Authorization', 'Bearer valid-token')
      .send(payload)
      .expect(200);

    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body.total).toBeGreaterThanOrEqual(0);
  });
});
