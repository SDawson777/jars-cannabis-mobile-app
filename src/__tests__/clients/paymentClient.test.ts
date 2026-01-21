import * as paymentClient from '../../clients/paymentClient';
import * as apiClient from '../../utils/apiClient';
import * as auth from '../../utils/auth';

jest.mock('../../utils/apiClient', () => ({
  fetchJson: jest.fn(),
}));

jest.mock('../../utils/auth', () => ({
  getAuthToken: jest.fn(),
}));

describe('paymentClient', () => {
  const mockPaymentMethod = {
    id: 'pm-1',
    cardBrand: 'visa',
    cardLast4: '4242',
  };

  const mockPayload = {
    cardBrand: 'visa',
    cardLast4: '4242',
    holderName: 'John Doe',
    expiry: '12/25',
    isDefault: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth.getAuthToken as jest.Mock).mockResolvedValue('test-token');
  });

  describe('addPaymentMethod', () => {
    it('should add a payment method with auth token', async () => {
      (apiClient.fetchJson as jest.Mock).mockResolvedValueOnce(mockPaymentMethod);

      const result = await paymentClient.addPaymentMethod(mockPayload);

      expect(apiClient.fetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/payment-methods'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockPayload),
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should work without auth token', async () => {
      (auth.getAuthToken as jest.Mock).mockResolvedValue(null);
      (apiClient.fetchJson as jest.Mock).mockResolvedValueOnce(mockPaymentMethod);

      await paymentClient.addPaymentMethod(mockPayload);

      expect(apiClient.fetchJson).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      );
    });
  });

  describe('updatePaymentMethod', () => {
    it('should update a payment method', async () => {
      (apiClient.fetchJson as jest.Mock).mockResolvedValueOnce(mockPaymentMethod);

      const result = await paymentClient.updatePaymentMethod('pm-1', mockPayload);

      expect(apiClient.fetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/payment-methods/pm-1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(mockPayload),
        })
      );
      expect(result).toEqual(mockPaymentMethod);
    });
  });

  describe('getPaymentMethods', () => {
    it('should fetch payment methods', async () => {
      const mockMethods = [mockPaymentMethod];
      (apiClient.fetchJson as jest.Mock).mockResolvedValueOnce(mockMethods);

      const result = await paymentClient.getPaymentMethods();

      expect(apiClient.fetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/payment-methods'),
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockMethods);
    });

    it('should pass abort signal', async () => {
      const controller = new AbortController();
      (apiClient.fetchJson as jest.Mock).mockResolvedValueOnce([]);

      await paymentClient.getPaymentMethods(controller.signal);

      expect(apiClient.fetchJson).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });
  });
});
