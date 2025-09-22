import { api } from './helpers/supertest';

describe('Addresses API', () => {

  test('GET returns empty list for user with no addresses', async () => {
    const res = await api().get('/api/v1/addresses').set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('POST creates an address and default flag clears others', async () => {
    const payload1 = { line1: '123 Main St', city: 'Denver', state: 'CO', zipCode: '80202', country: 'US', fullName: 'Test User', phone: '303-555-1212', isDefault: false };
    const r1 = await api().post('/api/v1/addresses').set('Authorization', 'Bearer valid-token').send(payload1);
    expect(r1.status).toBe(201);
    expect(r1.body.id).toBeTruthy();

    const payload2 = { line1: '456 Elm St', city: 'Boulder', state: 'CO', zipCode: '80301', country: 'US', fullName: 'Test User', phone: '303-555-1313', isDefault: true };
    const r2 = await api().post('/api/v1/addresses').set('Authorization', 'Bearer valid-token').send(payload2);
    expect(r2.status).toBe(201);
    expect(r2.body.isDefault).toBe(true);

    const list = await api().get('/api/v1/addresses').set('Authorization', 'Bearer valid-token');
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(2);
    const defaults = list.body.filter((a: any) => a.isDefault);
    expect(defaults.length).toBe(1);
  });

  test('PUT updates address and enforces ownership', async () => {
    const payload = { line1: '789 Pine St', city: 'Aurora', state: 'CO', zipCode: '80012', country: 'US', fullName: 'Owner', phone: '303-555-1414', isDefault: false };
    const created = await api().post('/api/v1/addresses').set('Authorization', 'Bearer valid-token').send(payload);
    expect(created.status).toBe(201);
    const id = created.body.id;

    const upd = await api().put(`/api/v1/addresses/${id}`).set('Authorization', 'Bearer valid-token').send({ fullName: 'Updated Name', isDefault: true });
    expect(upd.status).toBe(200);
    expect(upd.body.fullName).toBe('Updated Name');
    expect(upd.body.isDefault).toBe(true);

    const bad = await api().put(`/api/v1/addresses/${id}`).set('Authorization', 'Bearer invalid-token').send({ fullName: 'Hacker' });
    expect(bad.status).toBe(401);
  });

  test('DELETE removes an address and enforces ownership', async () => {
    const payload = { line1: '111 Delete St', city: 'Denver', state: 'CO', zipCode: '80203', country: 'US', fullName: 'ToDelete', phone: '303-555-1515', isDefault: false };
    const created = await api().post('/api/v1/addresses').set('Authorization', 'Bearer valid-token').send(payload);
    expect(created.status).toBe(201);
    const id = created.body.id;

    const del = await api().delete(`/api/v1/addresses/${id}`).set('Authorization', 'Bearer valid-token');
    expect(del.status).toBe(200);
    expect(del.body.success).toBe(true);

    const notFound = await api().delete(`/api/v1/addresses/${id}`).set('Authorization', 'Bearer valid-token');
    expect(notFound.status).toBe(404);

    const created2 = await api().post('/api/v1/addresses').set('Authorization', 'Bearer valid-token').send(payload);
    const id2 = created2.body.id;
    const bad = await api().delete(`/api/v1/addresses/${id2}`).set('Authorization', 'Bearer invalid-token');
    expect(bad.status).toBe(401);
  });

});
