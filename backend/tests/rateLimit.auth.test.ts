import request from 'supertest';
import app from '../src/app';

describe('Auth Rate Limiting', () => {
  const path = '/api/v1/auth/login';
  it('returns 429 after exceeding limit', async () => {
    // 60 allowed; we'll send 65 quick attempts with missing fields (400) but should rate limit >60
    let lastStatus = 0;
    for (let i = 0; i < 65; i++) {
      const res = await request(app).post(path).send({ email: 'user@example.com' });
      lastStatus = res.status;
      if (res.status === 429) {
        expect(res.body.error).toBe('rate_limited');
        return; // success
      }
    }
    throw new Error(`Did not encounter 429, last status=${lastStatus}`);
  });
});
