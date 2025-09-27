import request from 'supertest';
import app from '../src/app';

describe('Readiness & Health Endpoints', () => {
  it('returns ok on /health', async () => {
    const res = await request(app).get('/api/v1/health').expect(200);
    expect(res.body).toEqual({ ok: true });
    expect(res.headers['x-request-id']).toBeDefined();
  });
  it('returns ready status with checks', async () => {
    const res = await request(app).get('/api/v1/ready').expect(200);
    expect(res.body.ready).toBe(true);
    expect(res.body.checks).toHaveProperty('uptimeSec');
    expect(res.body.checks).toHaveProperty('db', 'ok');
  });
});
