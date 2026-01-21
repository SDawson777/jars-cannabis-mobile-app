// src/__tests__/api/phase4Client.test.ts
import { phase4Client, getForYou } from '../../api/phase4Client';
import { clientGet } from '../../api/http';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('../../utils/auth', () => ({
  getAuthToken: jest.fn().mockReturnValue(null),
}));

describe('phase4Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('phase4Client instance', () => {
    it('should be defined', () => {
      expect(phase4Client).toBeDefined();
    });

    it('should have baseURL configured', () => {
      expect(phase4Client.defaults.baseURL).toBeDefined();
    });

    it('should have Content-Type header set', () => {
      expect(phase4Client.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should have get method', () => {
      expect(typeof phase4Client.get).toBe('function');
    });

    it('should have post method', () => {
      expect(typeof phase4Client.post).toBe('function');
    });
  });

  describe('getForYou', () => {
    it('should fetch recommendations without storeId', async () => {
      const mockItems = { items: [{ id: 'prod-1', name: 'Product 1' }] };
      (clientGet as jest.Mock).mockResolvedValue(mockItems);

      const result = await getForYou();

      expect(clientGet).toHaveBeenCalledWith(phase4Client, '/recommendations/for-you');
      expect(result).toEqual(mockItems);
    });

    it('should fetch recommendations with storeId', async () => {
      const mockItems = { items: [{ id: 'prod-2', name: 'Product 2' }] };
      (clientGet as jest.Mock).mockResolvedValue(mockItems);

      const result = await getForYou('store-123');

      expect(clientGet).toHaveBeenCalledWith(
        phase4Client,
        '/recommendations/for-you?storeId=store-123'
      );
      expect(result).toEqual(mockItems);
    });

    it('should return empty items array when no recommendations', async () => {
      const mockItems = { items: [] };
      (clientGet as jest.Mock).mockResolvedValue(mockItems);

      const result = await getForYou();

      expect(result.items).toEqual([]);
    });
  });
});
