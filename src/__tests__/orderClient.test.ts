import * as auth from '../utils/auth';
import * as http from '../api/http';

jest.mock('../utils/auth', () => ({
  getAuthToken: jest.fn(),
}));

jest.mock('../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(successHandler => {
          // Store the handler for testing
          return successHandler;
        }),
      },
    },
  })),
}));

describe('orderClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchOrders', () => {
    it('should fetch orders with page parameter', async () => {
      const mockOrdersResponse = {
        orders: [{ id: '1', total: 50 }],
        pagination: { page: 1, nextPage: 2 },
      };
      (http.clientGet as jest.Mock).mockResolvedValue(mockOrdersResponse);
      (auth.getAuthToken as jest.Mock).mockResolvedValue('test-token');

      const { fetchOrders } = require('../clients/orderClient');
      const result = await fetchOrders(1);

      expect(http.clientGet).toHaveBeenCalled();
      expect(result.orders).toBeDefined();
    });

    it('should support abort signal', async () => {
      const controller = new AbortController();
      (http.clientGet as jest.Mock).mockResolvedValue({ orders: [] });
      (auth.getAuthToken as jest.Mock).mockResolvedValue('token');

      const { fetchOrders } = require('../clients/orderClient');
      await fetchOrders(1, controller.signal);

      expect(http.clientGet).toHaveBeenCalledWith(
        expect.anything(),
        '/orders',
        expect.objectContaining({ signal: controller.signal })
      );
    });

    it('should handle empty orders', async () => {
      (http.clientGet as jest.Mock).mockResolvedValue({ orders: [] });
      (auth.getAuthToken as jest.Mock).mockResolvedValue('token');

      const { fetchOrders } = require('../clients/orderClient');
      const result = await fetchOrders(1);

      expect(result.orders).toEqual([]);
    });
  });

  describe('createOrder', () => {
    it('should POST order payload', async () => {
      const mockOrder = { id: 'order-123', status: 'pending' };
      (http.clientPost as jest.Mock).mockResolvedValue({ order: mockOrder });
      (auth.getAuthToken as jest.Mock).mockResolvedValue('token');

      const { createOrder } = require('../clients/orderClient');
      const payload = {
        deliveryMethod: 'pickup',
        contact: { name: 'John', phone: '123', email: 'john@example.com' },
        paymentMethod: 'card',
      };
      const result = await createOrder(payload);

      expect(http.clientPost).toHaveBeenCalledWith(
        expect.anything(),
        '/orders',
        payload,
        expect.anything()
      );
      expect(result).toEqual(mockOrder);
    });

    it('should handle nested data response', async () => {
      const mockOrder = { id: 'order-456' };
      (http.clientPost as jest.Mock).mockResolvedValue({ data: { order: mockOrder } });
      (auth.getAuthToken as jest.Mock).mockResolvedValue('token');

      const { createOrder } = require('../clients/orderClient');
      const result = await createOrder({
        deliveryMethod: 'delivery',
        deliveryAddress: { city: 'NYC', state: 'NY', zipCode: '10001' },
        contact: { name: 'Jane', phone: '456', email: 'jane@example.com' },
        paymentMethod: 'pay_at_pickup',
      });

      expect(result).toEqual(mockOrder);
    });
  });
});
