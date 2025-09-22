import { api } from './helpers/supertest';

describe('Profile round-trip', () => {
  it('returns and updates name and phone', async () => {
    // initial GET should return the mocked user
    const getRes = await api().get('/api/v1/profile').set('Authorization', 'Bearer valid-token').expect(200);
    expect(getRes.body).toHaveProperty('id');
    expect(getRes.body).toHaveProperty('email');

    // update profile
    const payload = { name: 'Updated Name', phone: '+15551234567' };
    const putRes = await api().put('/api/v1/profile').set('Authorization', 'Bearer valid-token').send(payload).expect(200);
    expect(putRes.body).toHaveProperty('name', payload.name);
    expect(putRes.body).toHaveProperty('phone', payload.phone);

    // GET again should reflect updates
    const getRes2 = await api().get('/api/v1/profile').set('Authorization', 'Bearer valid-token').expect(200);
    expect(getRes2.body).toHaveProperty('name', payload.name);
    expect(getRes2.body).toHaveProperty('phone', payload.phone);
  });
});
