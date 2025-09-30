import { api } from './helpers/supertest';

describe('Request Correlation ID Middleware', () => {
  it('attaches X-Request-Id header on health endpoint', async () => {
    const res = await api().get('/api/v1/health').expect(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.headers['x-request-id']).toBe('string');
    expect(res.headers['x-request-id'].length).toBeGreaterThan(10);
  });

  it('respects incoming x-request-id header when provided', async () => {
    const customId = 'test-correlation-123';
    const res = await api().get('/api/v1/health').set('x-request-id', customId).expect(200);
    expect(res.headers['x-request-id']).toBe(customId);
  });
});
