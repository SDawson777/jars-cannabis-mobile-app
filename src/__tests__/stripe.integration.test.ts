import { fetchPaymentSheetParams } from '../src/api/stripe';

describe('Stripe Payment Sheet Integration', () => {
  // Mock fetch globally for this test
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should call the correct API endpoint with /api/v1 prefix', async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        paymentIntent: 'pi_test_123',
        ephemeralKey: 'ek_test_456',
        customer: 'cus_test_789'
      })
    });

    // Set environment variable to test URL construction
    const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://test-api.example.com';

    try {
      const result = await fetchPaymentSheetParams();

      // Verify the correct URL was called
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/v1/stripe/payment-sheet',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: expect.any(String) })
        }
      );

      // Verify response structure
      expect(result).toEqual({
        paymentIntent: 'pi_test_123',
        ephemeralKey: 'ek_test_456',
        customer: 'cus_test_789'
      });
    } finally {
      // Restore original environment
      if (originalEnv) {
        process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
      } else {
        delete process.env.EXPO_PUBLIC_API_BASE_URL;
      }
    }
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(fetchPaymentSheetParams()).rejects.toThrow('Failed to load payment parameters');
  });

  it('should use default localhost URL when env var is not set', async () => {
    // Clear environment variable
    const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        paymentIntent: 'pi_test_123',
        ephemeralKey: 'ek_test_456',
        customer: 'cus_test_789'
      })
    });

    try {
      await fetchPaymentSheetParams();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/stripe/payment-sheet',
        expect.any(Object)
      );
    } finally {
      // Restore original environment
      if (originalEnv) {
        process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
      }
    }
  });
});