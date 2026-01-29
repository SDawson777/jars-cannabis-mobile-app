import { fetchPaymentSheetParams } from '../api/stripe';
import { fetchJson } from '../utils/apiClient';

jest.mock('../utils/apiClient');
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

const mockedFetchJson = fetchJson as jest.MockedFunction<typeof fetchJson>;

describe('stripe API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPaymentSheetParams', () => {
    it('should fetch payment sheet params successfully', async () => {
      const mockParams = {
        paymentIntent: 'pi_test123',
        ephemeralKey: 'ek_test123',
        customer: 'cus_test123',
      };
      mockedFetchJson.mockResolvedValue(mockParams);

      const result = await fetchPaymentSheetParams();

      expect(result).toEqual(mockParams);
      expect(mockedFetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/stripe/payment-sheet'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: 'ios' }),
          retries: 2,
        })
      );
    });

    it('should handle API errors', async () => {
      mockedFetchJson.mockRejectedValue(new Error('Payment sheet error'));

      await expect(fetchPaymentSheetParams()).rejects.toThrow('Payment sheet error');
    });

    it('should include platform in request body', async () => {
      mockedFetchJson.mockResolvedValue({
        paymentIntent: 'pi_123',
        ephemeralKey: 'ek_123',
        customer: 'cus_123',
      });

      await fetchPaymentSheetParams();

      const call = mockedFetchJson.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.platform).toBe('ios');
    });
  });
});
