import {
  orderClient,
  fetchOrders,
  createOrder,
  CreateOrderPayload,
} from '../../clients/orderClient';
import * as http from '../../api/http';
import * as auth from '../../utils/auth';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('../../utils/auth', () => ({
  getAuthToken: jest.fn(),
}));

describe('orderClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth.getAuthToken as jest.Mock).mockResolvedValue('test-token');
  });

  describe('orderClient instance', () => {
    it('should be an axios instance', () => {
      expect(orderClient).toBeDefined();
      expect(typeof orderClient.get).toBe('function');
      expect(typeof orderClient.post).toBe('function');
    });
  });

  describe('fetchOrders', () => {
    it('should fetch orders with default page', async () => {
      const mockOrders = {
        orders: [
          { id: 'order-1', status: 'completed' },
          { id: 'order-2', status: 'pending' },
        ],
        pagination: { page: 1, limit: 10, nextPage: 2 },
      };
      (http.clientGet as jest.Mock).mockResolvedValueOnce(mockOrders);

      const result = await fetchOrders();

      expect(http.clientGet).toHaveBeenCalledWith(
        orderClient,
        '/orders',
        expect.objectContaining({ params: { page: 1 } })
      );
      expect(result.orders).toHaveLength(2);
      expect(result.nextPage).toBe(2);
    });

    it('should fetch orders with custom page', async () => {
      const mockOrders = {
        orders: [{ id: 'order-3', status: 'pending' }],
        pagination: { page: 2, limit: 10 },
      };
      (http.clientGet as jest.Mock).mockResolvedValueOnce(mockOrders);

      const result = await fetchOrders(2);

      expect(http.clientGet).toHaveBeenCalledWith(
        orderClient,
        '/orders',
        expect.objectContaining({ params: { page: 2 } })
      );
      expect(result.orders).toHaveLength(1);
    });

    it('should handle nested data response', async () => {
      const mockOrders = {
        data: {
          orders: [{ id: 'order-1' }],
          pagination: { nextPage: 2 },
        },
      };
      (http.clientGet as jest.Mock).mockResolvedValueOnce(mockOrders);

      const result = await fetchOrders();

      expect(result.orders).toHaveLength(1);
      expect(result.nextPage).toBe(2);
    });

    it('should return empty orders when none returned', async () => {
      (http.clientGet as jest.Mock).mockResolvedValueOnce({});

      const result = await fetchOrders();

      expect(result.orders).toEqual([]);
      expect(result.nextPage).toBeUndefined();
    });

    it('should pass abort signal', async () => {
      const controller = new AbortController();
      (http.clientGet as jest.Mock).mockResolvedValueOnce({ orders: [] });

      await fetchOrders(1, controller.signal);

      expect(http.clientGet).toHaveBeenCalledWith(
        orderClient,
        '/orders',
        expect.objectContaining({ signal: controller.signal })
      );
    });
  });

  describe('createOrder', () => {
    const mockPayload: CreateOrderPayload = {
      storeId: 'store-1',
      deliveryMethod: 'pickup',
      contact: { name: 'John', phone: '555-1234', email: 'john@example.com' },
      paymentMethod: 'card',
    };

    const mockOrder = {
      id: 'order-new',
      storeId: 'store-1',
      status: 'pending',
    };

    it('should create an order', async () => {
      (http.clientPost as jest.Mock).mockResolvedValueOnce({ order: mockOrder });

      const result = await createOrder(mockPayload);

      expect(http.clientPost).toHaveBeenCalledWith(
        orderClient,
        '/orders',
        mockPayload,
        expect.anything()
      );
      expect(result).toEqual(mockOrder);
    });

    it('should handle nested data response', async () => {
      (http.clientPost as jest.Mock).mockResolvedValueOnce({
        data: { order: mockOrder },
      });

      const result = await createOrder(mockPayload);

      expect(result).toEqual(mockOrder);
    });

    it('should create delivery order with address', async () => {
      const deliveryPayload: CreateOrderPayload = {
        ...mockPayload,
        deliveryMethod: 'delivery',
        deliveryAddress: {
          line1: '123 Main St',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202',
        },
      };
      (http.clientPost as jest.Mock).mockResolvedValueOnce({ order: mockOrder });

      await createOrder(deliveryPayload);

      expect(http.clientPost).toHaveBeenCalledWith(
        orderClient,
        '/orders',
        deliveryPayload,
        expect.anything()
      );
    });
  });
});
