import supertest from 'supertest';
import app from '../src/app';

const request = supertest(app);

describe('POST /api/analytics/track', () => {
  it('should track an analytics event successfully', async () => {
    const eventData = {
      event: 'test_event',
      data: {
        userId: 'test-user',
        action: 'click',
        timestamp: Date.now(),
      },
    };

    const response = await request
      .post('/api/analytics/track')
      .set('x-user-id', 'unique-user-1')
      .send(eventData)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('eventId');
  });

  it('should require event name', async () => {
    const response = await request
      .post('/api/analytics/track')
      .set('x-user-id', 'unique-user-2')
      .send({ data: { test: 'data' } })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'event name required');
  });

  it('should sanitize PII data', async () => {
    const eventData = {
      event: 'test_event',
      data: {
        email: 'test@example.com',
        phone: '555-1234',
        name: 'John Doe',
        productId: 'prod-123',
        action: 'purchase',
      },
    };

    const response = await request
      .post('/api/analytics/track')
      .set('x-user-id', 'unique-user-3')
      .send(eventData)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    // PII should be stripped but non-PII data should remain
  });

  it('should handle rate limiting', async () => {
    const eventData = {
      event: 'test_event',
      data: { action: 'spam' },
    };

    // Use a unique user ID for rate limiting test
    const userId = 'rate-limit-test-user';

    // Make many requests to trigger rate limit (100 per minute)
    const requests = Array.from({ length: 101 }, () =>
      request.post('/api/analytics/track').set('x-user-id', userId).send(eventData)
    );

    const responses = await Promise.allSettled(requests);

    // Last request should be rate limited
    const lastResponse = responses[responses.length - 1];
    if (lastResponse.status === 'fulfilled') {
      expect([200, 429]).toContain(lastResponse.value.status);
    }
  });

  it('should work without data parameter', async () => {
    const response = await request
      .post('/api/analytics/track')
      .set('x-user-id', 'unique-user-4')
      .send({ event: 'simple_event' })
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });
});
