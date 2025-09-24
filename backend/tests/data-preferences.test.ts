import { api } from './helpers/supertest';

describe('Profile Data Preferences', () => {
  it('GET returns defaults initially', async () => {
    const res = await api()
      .get('/api/profile/data-preferences')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      personalizedAds: false,
      emailTracking: false,
      shareWithPartners: false,
    });
  });

  it('PUT validates and rejects unknown keys', async () => {
    const bad = await api()
      .put('/api/profile/data-preferences')
      .set('Authorization', 'Bearer valid-token')
      .send({ personalizedAds: true, badKey: true });
    expect(bad.status).toBe(400);
  });

  it('PUT saves values and GET returns them', async () => {
    const put = await api()
      .put('/api/profile/data-preferences')
      .set('Authorization', 'Bearer valid-token')
      .send({ personalizedAds: true, emailTracking: true, shareWithPartners: false });
    expect(put.status).toBe(200);
    expect(put.body.personalizedAds).toBe(true);

    const res2 = await api()
      .get('/api/profile/data-preferences')
      .set('Authorization', 'Bearer valid-token');
    expect(res2.status).toBe(200);
    expect(res2.body).toMatchObject({
      personalizedAds: true,
      emailTracking: true,
      shareWithPartners: false,
    });
  });
});
