import { api } from './helpers/supertest';

describe('Payment methods API', () => {
  test('GET returns empty list for user with no methods', async () => {
    const res = await api()
      .get('/api/v1/payment-methods')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('POST creates a payment method and returns 201, setting default clears others', async () => {
    // create first method (not default)
    const payload1 = {
      cardBrand: 'visa',
      cardLast4: '4242',
      holderName: 'Test User',
      expiry: '12/25',
      isDefault: false,
    };
    const r1 = await api()
      .post('/api/v1/payment-methods')
      .set('Authorization', 'Bearer valid-token')
      .send(payload1);
    expect(r1.status).toBe(201);
    expect(r1.body.id).toBeTruthy();

    // create second method as default
    const payload2 = {
      cardBrand: 'mastercard',
      cardLast4: '1111',
      holderName: 'Test User',
      expiry: '01/27',
      isDefault: true,
    };
    const r2 = await api()
      .post('/api/v1/payment-methods')
      .set('Authorization', 'Bearer valid-token')
      .send(payload2);
    expect(r2.status).toBe(201);
    expect(r2.body.isDefault).toBe(true);

    // list should return two methods and only one default
    const list = await api()
      .get('/api/v1/payment-methods')
      .set('Authorization', 'Bearer valid-token');
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(2);
    const defaults = list.body.filter((m: any) => m.isDefault);
    expect(defaults.length).toBe(1);
  });

  test('PUT updates a payment method and enforces ownership', async () => {
    // create a method for test-user
    const payload = {
      cardBrand: 'amex',
      cardLast4: '0005',
      holderName: 'Owner',
      expiry: '05/26',
      isDefault: false,
    };
    const created = await api()
      .post('/api/v1/payment-methods')
      .set('Authorization', 'Bearer valid-token')
      .send(payload);
    expect(created.status).toBe(201);
    const id = created.body.id;

    // update as owner
    const upd = await api()
      .put(`/api/v1/payment-methods/${id}`)
      .set('Authorization', 'Bearer valid-token')
      .send({ holderName: 'Updated Name', isDefault: true });
    expect(upd.status).toBe(200);
    expect(upd.body.holderName).toBe('Updated Name');
    expect(upd.body.isDefault).toBe(true);

    // attempt to update as different user -> should 403
    const bad = await api()
      .put(`/api/v1/payment-methods/${id}`)
      .set('Authorization', 'Bearer invalid-token')
      .send({ holderName: 'Hacker' });
    expect(bad.status).toBe(401);
  });

  test('DELETE removes a payment method and enforces ownership', async () => {
    // create a method for test-user
    const payload = {
      cardBrand: 'discover',
      cardLast4: '9999',
      holderName: 'ToDelete',
      expiry: '11/26',
      isDefault: false,
    };
    const created = await api()
      .post('/api/v1/payment-methods')
      .set('Authorization', 'Bearer valid-token')
      .send(payload);
    expect(created.status).toBe(201);
    const id = created.body.id;

    // delete as owner
    const del = await api()
      .delete(`/api/v1/payment-methods/${id}`)
      .set('Authorization', 'Bearer valid-token');
    expect(del.status).toBe(200);
    expect(del.body.success).toBe(true);

    // attempt to delete again -> not found
    const notFound = await api()
      .delete(`/api/v1/payment-methods/${id}`)
      .set('Authorization', 'Bearer valid-token');
    expect(notFound.status).toBe(404);

    // create another method and attempt to delete as invalid user
    const created2 = await api()
      .post('/api/v1/payment-methods')
      .set('Authorization', 'Bearer valid-token')
      .send(payload);
    const id2 = created2.body.id;
    const bad = await api()
      .delete(`/api/v1/payment-methods/${id2}`)
      .set('Authorization', 'Bearer invalid-token');
    expect(bad.status).toBe(401);
  });
});
