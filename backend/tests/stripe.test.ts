import { api } from './helpers/supertest';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: { create: jest.fn().mockResolvedValue({ id: 'cus_test' }) },
    ephemeralKeys: { create: jest.fn().mockResolvedValue({ secret: 'eph_test' }) },
    paymentIntents: { create: jest.fn().mockResolvedValue({ client_secret: 'pi_secret_test' }) },
  }));
});

describe('Stripe routes', () => {
  it('should return payment sheet credentials', async () => {
    const res = await api().post('/api/v1/stripe/payment-sheet').expect(200);

    expect(res.body).toHaveProperty('paymentIntent');
    expect(res.body).toHaveProperty('ephemeralKey');
    expect(res.body).toHaveProperty('customer');
    expect(typeof res.body.paymentIntent).toBe('string');
    expect(typeof res.body.ephemeralKey).toBe('string');
    expect(typeof res.body.customer).toBe('string');
  });
});
