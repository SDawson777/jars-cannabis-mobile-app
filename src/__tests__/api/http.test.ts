// src/__tests__/api/http.test.ts

import {
  api,
  getJSON,
  postJSON,
  clientGet,
  clientPost,
  clientPut,
  clientPatch,
  clientDelete,
} from '../../api/http';

jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
  return {
    create: jest.fn(() => mockAxiosInstance),
    ...mockAxiosInstance,
  };
});

describe('http API utility', () => {
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('api instance', () => {
    it('should be defined', () => {
      expect(api).toBeDefined();
      expect(typeof api.get).toBe('function');
      expect(typeof api.post).toBe('function');
    });
  });

  describe('getJSON', () => {
    it('should make a GET request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      (api.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await getJSON('/test');

      expect(api.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockData);
    });

    it('should pass config options', async () => {
      const mockData = { success: true };
      const config = { headers: { Authorization: 'Bearer token' } };
      (api.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await getJSON('/test', config);

      expect(api.get).toHaveBeenCalledWith('/test', config);
      expect(result).toEqual(mockData);
    });
  });

  describe('postJSON', () => {
    it('should make a POST request and return data', async () => {
      const requestData = { name: 'New Item' };
      const responseData = { id: 1, name: 'New Item' };
      (api.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await postJSON('/items', requestData);

      expect(api.post).toHaveBeenCalledWith('/items', requestData, undefined);
      expect(result).toEqual(responseData);
    });
  });

  describe('clientGet', () => {
    it('should make a GET request using provided client', async () => {
      const mockData = { products: [] };
      mockClient.get.mockResolvedValue({ data: mockData });

      const result = await clientGet(mockClient, '/products');

      expect(mockClient.get).toHaveBeenCalledWith('/products', undefined);
      expect(result).toEqual(mockData);
    });

    it('should pass config to client', async () => {
      const mockData = { product: {} };
      const config = { params: { id: 1 } };
      mockClient.get.mockResolvedValue({ data: mockData });

      const result = await clientGet(mockClient, '/products/1', config);

      expect(mockClient.get).toHaveBeenCalledWith('/products/1', config);
      expect(result).toEqual(mockData);
    });
  });

  describe('clientPost', () => {
    it('should make a POST request using provided client', async () => {
      const requestData = { quantity: 2 };
      const responseData = { cartId: 'abc123' };
      mockClient.post.mockResolvedValue({ data: responseData });

      const result = await clientPost(mockClient, '/cart', requestData);

      expect(mockClient.post).toHaveBeenCalledWith('/cart', requestData);
      expect(result).toEqual(responseData);
    });

    it('should pass config when provided', async () => {
      const requestData = { quantity: 2 };
      const responseData = { cartId: 'abc123' };
      const config = { headers: { 'X-Custom': 'value' } };
      mockClient.post.mockResolvedValue({ data: responseData });

      const result = await clientPost(mockClient, '/cart', requestData, config);

      expect(mockClient.post).toHaveBeenCalledWith('/cart', requestData, config);
      expect(result).toEqual(responseData);
    });
  });

  describe('clientPut', () => {
    it('should make a PUT request using provided client', async () => {
      const requestData = { name: 'Updated' };
      const responseData = { id: 1, name: 'Updated' };
      mockClient.put.mockResolvedValue({ data: responseData });

      const result = await clientPut(mockClient, '/items/1', requestData);

      expect(mockClient.put).toHaveBeenCalledWith('/items/1', requestData);
      expect(result).toEqual(responseData);
    });

    it('should pass config when provided', async () => {
      const requestData = { name: 'Updated' };
      const responseData = { id: 1, name: 'Updated' };
      const config = { timeout: 5000 };
      mockClient.put.mockResolvedValue({ data: responseData });

      const result = await clientPut(mockClient, '/items/1', requestData, config);

      expect(mockClient.put).toHaveBeenCalledWith('/items/1', requestData, config);
      expect(result).toEqual(responseData);
    });
  });

  describe('clientPatch', () => {
    it('should make a PATCH request using provided client', async () => {
      const requestData = { status: 'active' };
      const responseData = { id: 1, status: 'active' };
      mockClient.patch.mockResolvedValue({ data: responseData });

      const result = await clientPatch(mockClient, '/items/1', requestData);

      expect(mockClient.patch).toHaveBeenCalledWith('/items/1', requestData);
      expect(result).toEqual(responseData);
    });

    it('should pass config when provided', async () => {
      const requestData = { status: 'active' };
      const responseData = { id: 1, status: 'active' };
      const config = { validateStatus: () => true };
      mockClient.patch.mockResolvedValue({ data: responseData });

      const result = await clientPatch(mockClient, '/items/1', requestData, config);

      expect(mockClient.patch).toHaveBeenCalledWith('/items/1', requestData, config);
      expect(result).toEqual(responseData);
    });
  });

  describe('clientDelete', () => {
    it('should make a DELETE request using provided client', async () => {
      const responseData = { success: true };
      mockClient.delete.mockResolvedValue({ data: responseData });

      const result = await clientDelete(mockClient, '/items/1');

      expect(mockClient.delete).toHaveBeenCalledWith('/items/1', undefined);
      expect(result).toEqual(responseData);
    });

    it('should pass config to delete request', async () => {
      const responseData = { deleted: true };
      const config = { headers: { Authorization: 'Bearer token' } };
      mockClient.delete.mockResolvedValue({ data: responseData });

      const result = await clientDelete(mockClient, '/items/1', config);

      expect(mockClient.delete).toHaveBeenCalledWith('/items/1', config);
      expect(result).toEqual(responseData);
    });
  });
});
