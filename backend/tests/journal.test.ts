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

  it('GET /journal/entries orders by updatedAt desc', async () => {
    // Create first entry
    const res1 = await api()
      .post('/api/v1/journal/entries')
      .set('Authorization', 'Bearer valid-token')
      .send({ productId: 'test-product-1', rating: 3, notes: 'first entry' })
      .expect(201);

    // Wait a bit then create second entry
    await new Promise(resolve => setTimeout(resolve, 50));
    const res2 = await api()
      .post('/api/v1/journal/entries')
      .set('Authorization', 'Bearer valid-token')
      .send({ productId: 'test-product-2', rating: 4, notes: 'second entry' })
      .expect(201);

    // Update first entry (this should make it most recent)
    await new Promise(resolve => setTimeout(resolve, 50));
    await api()
      .put(`/api/v1/journal/entries/${res1.body.id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ notes: 'updated first entry' })
      .expect(200);

    // Get entries and verify ordering
    const getRes = await api()
      .get('/api/v1/journal/entries')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(getRes.body).toHaveLength(2);
    // The updated entry should be first (most recent updatedAt)
    expect(getRes.body[0].id).toBe(res1.body.id); // Updated entry should be first
    expect(getRes.body[1].id).toBe(res2.body.id);
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

  it('PUT updates note field when provided and updates updatedAt', async () => {
    const create = await api()
      .post('/api/v1/journal/entries')
      .set('Authorization', 'Bearer valid-token')
      .send({ productId: 'test-product-id', rating: 3, notes: 'initial' })
      .expect(201);

    const originalUpdatedAt = create.body.updatedAt;
    const id = create.body.id;

    // Ensure we have an updatedAt field
    expect(originalUpdatedAt).toBeDefined();

    // Wait to ensure updatedAt changes
    await new Promise(resolve => setTimeout(resolve, 50));

    const upd = await api()
      .put(`/api/v1/journal/entries/${id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ note: 'updated legacy' })
      .expect(200);

    expect(upd.body).toHaveProperty('notes', 'updated legacy');
    expect(upd.body.updatedAt).toBeDefined();
    expect(upd.body.updatedAt).not.toBe(originalUpdatedAt);

    const upd2 = await api()
      .put(`/api/v1/journal/entries/${id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ notes: 'updated preferred' })
      .expect(200);

    expect(upd2.body).toHaveProperty('notes', 'updated preferred');
  });

  it('PUT accepts partial updates', async () => {
    const create = await api()
      .post('/api/v1/journal/entries')
      .set('Authorization', 'Bearer valid-token')
      .send({ productId: 'test-product-id', rating: 3, notes: 'initial', tags: ['sleep'] })
      .expect(201);

    const id = create.body.id;

    // Update only rating
    const upd1 = await api()
      .put(`/api/v1/journal/entries/${id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ rating: 5 })
      .expect(200);

    expect(upd1.body.rating).toBe(5);
    expect(upd1.body.notes).toBe('initial'); // Should remain unchanged
    expect(upd1.body.tags).toEqual(['sleep']); // Should remain unchanged

    // Update only tags
    const upd2 = await api()
      .put(`/api/v1/journal/entries/${id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ tags: ['focus', 'creativity'] })
      .expect(200);

    expect(upd2.body.rating).toBe(5); // Should remain unchanged
    expect(upd2.body.notes).toBe('initial'); // Should remain unchanged
    expect(upd2.body.tags).toEqual(['focus', 'creativity']);
  });
});
