import * as auth from '../utils/auth';
import * as apiClient from '../utils/apiClient';

// Mock the auth module
jest.mock('../utils/auth', () => ({
  getAuthToken: jest.fn(),
}));

jest.mock('../utils/apiClient', () => ({
  fetchJson: jest.fn(),
}));

describe('paymentClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authFetch and payment methods', () => {
    it('should add authorization header when token is available', async () => {
      (auth.getAuthToken as jest.Mock).mockResolvedValue('test-token');
      (apiClient.fetchJson as jest.Mock).mockResolvedValue({ success: true });

      const { addPaymentMethod } = require('../clients/paymentClient');

      await addPaymentMethod({ cardBrand: 'visa', cardLast4: '4242' });

      expect(apiClient.fetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/payment-methods'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle missing token', async () => {
      (auth.getAuthToken as jest.Mock).mockResolvedValue(null);
      (apiClient.fetchJson as jest.Mock).mockResolvedValue([]);

      const { getPaymentMethods } = require('../clients/paymentClient');
      await getPaymentMethods();

      expect(apiClient.fetchJson).toHaveBeenCalled();
    });
  });

  describe('addPaymentMethod', () => {
    it('should POST payment method data', async () => {
      (auth.getAuthToken as jest.Mock).mockResolvedValue('token');
      (apiClient.fetchJson as jest.Mock).mockResolvedValue({ id: 'pm_123', type: 'card' });

      const { addPaymentMethod } = require('../clients/paymentClient');
      await addPaymentMethod({ cardBrand: 'visa', cardLast4: '4242' });

      expect(apiClient.fetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/payment-methods'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('updatePaymentMethod', () => {
    it('should PUT payment method by ID', async () => {
      (auth.getAuthToken as jest.Mock).mockResolvedValue('token');
      (apiClient.fetchJson as jest.Mock).mockResolvedValue({ id: 'pm_123', isDefault: true });

      const { updatePaymentMethod } = require('../clients/paymentClient');
      await updatePaymentMethod('pm_123', {
        cardBrand: 'visa',
        cardLast4: '4242',
        isDefault: true,
      });

      expect(apiClient.fetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/payment-methods/pm_123'),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  describe('getPaymentMethods', () => {
    it('should GET all payment methods', async () => {
      (auth.getAuthToken as jest.Mock).mockResolvedValue('token');
      (apiClient.fetchJson as jest.Mock).mockResolvedValue([{ id: 'pm_1' }, { id: 'pm_2' }]);

      const { getPaymentMethods } = require('../clients/paymentClient');
      await getPaymentMethods();

      expect(apiClient.fetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/payment-methods'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return empty array when no payment methods', async () => {
      (auth.getAuthToken as jest.Mock).mockResolvedValue('token');
      (apiClient.fetchJson as jest.Mock).mockResolvedValue([]);

      const { getPaymentMethods } = require('../clients/paymentClient');
      const result = await getPaymentMethods();

      expect(result).toEqual([]);
    });
  });
});
