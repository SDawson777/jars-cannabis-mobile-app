import { getJSON, postJSON, clientGet, clientPost, clientPut } from '../api/http';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

// Mock axios directly
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  })),
}));

// Import after mocking
import { api } from '../api/http';

const mockedApi = api as jest.Mocked<AxiosInstance>;

describe('http utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getJSON', () => {
    it('should fetch and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await getJSON('/test-endpoint');

      expect(result).toEqual(mockData);
      expect(mockedApi.get).toHaveBeenCalledWith('/test-endpoint', undefined);
    });

    it('should pass config options', async () => {
      const config: AxiosRequestConfig = { params: { filter: 'active' } };
      (mockedApi.get as jest.Mock).mockResolvedValue({ data: [] });

      await getJSON('/test', config);

      expect(mockedApi.get).toHaveBeenCalledWith('/test', config);
    });
  });

  describe('postJSON', () => {
    it('should post data and return response', async () => {
      const requestData = { name: 'New Item' };
      const responseData = { id: 1, name: 'New Item' };
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await postJSON('/items', requestData);

      expect(result).toEqual(responseData);
      expect(mockedApi.post).toHaveBeenCalledWith('/items', requestData, undefined);
    });

    it('should handle empty request body', async () => {
      (mockedApi.post as jest.Mock).mockResolvedValue({ data: { success: true } });

      const result = await postJSON('/trigger');

      expect(result).toEqual({ success: true });
    });
  });

  describe('clientGet', () => {
    it('should fetch data from a custom client', async () => {
      const mockClient = {
        get: jest.fn().mockResolvedValue({ data: { result: 'ok' } }),
      } as unknown as AxiosInstance;

      const result = await clientGet(mockClient, '/custom-endpoint');

      expect(result).toEqual({ result: 'ok' });
      expect(mockClient.get).toHaveBeenCalledWith('/custom-endpoint', undefined);
    });

    it('should pass config to custom client', async () => {
      const config: AxiosRequestConfig = { headers: { Authorization: 'Bearer token' } };
      const mockClient = {
        get: jest.fn().mockResolvedValue({ data: {} }),
      } as unknown as AxiosInstance;

      await clientGet(mockClient, '/secure', config);

      expect(mockClient.get).toHaveBeenCalledWith('/secure', config);
    });
  });

  describe('clientPost', () => {
    it('should post data to a custom client', async () => {
      const mockClient = {
        post: jest.fn().mockResolvedValue({ data: { created: true } }),
      } as unknown as AxiosInstance;

      const result = await clientPost(mockClient, '/create', { name: 'Test' });

      expect(result).toEqual({ created: true });
      expect(mockClient.post).toHaveBeenCalledWith('/create', { name: 'Test' });
    });

    it('should pass config when provided', async () => {
      const config: AxiosRequestConfig = { timeout: 5000 };
      const mockClient = {
        post: jest.fn().mockResolvedValue({ data: {} }),
      } as unknown as AxiosInstance;

      await clientPost(mockClient, '/endpoint', { data: 1 }, config);

      expect(mockClient.post).toHaveBeenCalledWith('/endpoint', { data: 1 }, config);
    });
  });

  describe('clientPut', () => {
    it('should put data to a custom client', async () => {
      const mockClient = {
        put: jest.fn().mockResolvedValue({ data: { updated: true } }),
      } as unknown as AxiosInstance;

      const result = await clientPut(mockClient, '/update/1', { name: 'Updated' });

      expect(result).toEqual({ updated: true });
      expect(mockClient.put).toHaveBeenCalledWith('/update/1', { name: 'Updated' });
    });

    it('should pass config when provided', async () => {
      const config: AxiosRequestConfig = { headers: { 'X-Custom': 'value' } };
      const mockClient = {
        put: jest.fn().mockResolvedValue({ data: {} }),
      } as unknown as AxiosInstance;

      await clientPut(mockClient, '/update', { id: 1 }, config);

      expect(mockClient.put).toHaveBeenCalledWith('/update', { id: 1 }, config);
    });
  });
});
