import { api } from './helpers/supertest';

describe('Journal endpoints', () => {
  it('GET /journal/entries returns an array (canonical shape)', async () => {
    // ensure store is empty
    const res = await api()
      .get('/api/v1/journal/entries')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST accepts note OR notes and persists notes field', async () => {
    const payloadWithNote = { productId: 'test-product-id', rating: 4, note: 'legacy note' };
    const res1 = await api()
      .post('/api/v1/journal/entries')
      .set('Authorization', 'Bearer valid-token')
      .send(payloadWithNote)
      .expect(201);
    expect(res1.body).toHaveProperty('notes', 'legacy note');

    const payloadWithNotes = { productId: 'test-product-id', rating: 5, notes: 'preferred notes' };
    const res2 = await api()
      .post('/api/v1/journal/entries')
      .set('Authorization', 'Bearer valid-token')
      .send(payloadWithNotes)
      .expect(201);
    expect(res2.body).toHaveProperty('notes', 'preferred notes');
  });

  it('PUT updates note field when provided', async () => {
    const create = await api()
      .post('/api/v1/journal/entries')
      .set('Authorization', 'Bearer valid-token')
      .send({ productId: 'test-product-id', rating: 3, notes: 'initial' })
      .expect(201);
    const id = create.body.id;
    const upd = await api()
      .put(`/api/v1/journal/entries/${id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ note: 'updated legacy' })
      .expect(200);
    expect(upd.body).toHaveProperty('notes', 'updated legacy');
    const upd2 = await api()
      .put(`/api/v1/journal/entries/${id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ notes: 'updated preferred' })
      .expect(200);
    expect(upd2.body).toHaveProperty('notes', 'updated preferred');
  });
});
