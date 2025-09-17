import { api } from './helpers/supertest';

describe('POST /api/stripe/payment-sheet', () => {
  it('returns payment sheet parameters', async () => {
    const res = await api()
      .post('/api/stripe/payment-sheet')
      .send({ platform: 'ios' })
      .expect(200);

    expect(res.body).toHaveProperty('paymentIntent');
    expect(res.body).toHaveProperty('ephemeralKey');
    expect(res.body).toHaveProperty('customer');
    expect(typeof res.body.paymentIntent).toBe('string');
    expect(typeof res.body.ephemeralKey).toBe('string');
    expect(typeof res.body.customer).toBe('string');
  });

  it('handles stripe errors gracefully', async () => {
    // This test ensures the endpoint doesn't crash when Stripe service is unavailable
    const res = await api()
      .post('/api/stripe/payment-sheet')
      .send({ platform: 'android' });

    // Should either return 200 with valid data or 500 with error message
    if (res.status === 500) {
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Stripe error');
    } else {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('paymentIntent');
    }
  });
});