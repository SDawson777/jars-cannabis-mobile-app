import { renderHook, waitFor } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';

import fetchJson, {
  useOffline,
  setOnUnauthorizedGlobal,
  getOnUnauthorizedGlobal,
  setOnForbiddenGlobal,
  setOnServerErrorGlobal,
} from '../../utils/apiClient';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

describe('fetchJson', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    global.fetch = jest.fn();
    setOnUnauthorizedGlobal(null);
    setOnForbiddenGlobal(null);
    setOnServerErrorGlobal(null);
  });

  it('should return JSON on successful response', async () => {
    const mockData = { success: true, data: 'test' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchJson('/api/test');

    expect(result).toEqual(mockData);
  });

  it('should throw offline error when not connected', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

    await expect(fetchJson('/api/test')).rejects.toEqual({
      message: 'Offline',
      code: 'offline',
    });
  });

  it('should throw 401 error and call onUnauthorized', async () => {
    const onUnauthorized = jest.fn();
    const mockResponse = {
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(fetchJson('/api/test', { onUnauthorized, retries: 0 })).rejects.toMatchObject({
      status: 401,
    });

    expect(onUnauthorized).toHaveBeenCalled();
  });

  it('should call global unauthorized handler on 401', async () => {
    const globalHandler = jest.fn();
    setOnUnauthorizedGlobal(globalHandler);

    const mockResponse = {
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(fetchJson('/api/test', { retries: 0 })).rejects.toMatchObject({ status: 401 });

    expect(globalHandler).toHaveBeenCalled();
  });

  it('should throw 403 error and call global forbidden handler', async () => {
    const forbiddenHandler = jest.fn();
    setOnForbiddenGlobal(forbiddenHandler);

    const mockResponse = {
      ok: false,
      status: 403,
      json: () => Promise.resolve({}),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(fetchJson('/api/test', { retries: 0 })).rejects.toMatchObject({ status: 403 });

    expect(forbiddenHandler).toHaveBeenCalled();
  });

  it('should throw 500 error and call global server error handler', async () => {
    const serverErrorHandler = jest.fn();
    setOnServerErrorGlobal(serverErrorHandler);

    const mockResponse = {
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(fetchJson('/api/test', { retries: 0 })).rejects.toMatchObject({ status: 500 });

    expect(serverErrorHandler).toHaveBeenCalledWith(500);
  });

  it('should retry on failure', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      });

    const result = await fetchJson('/api/test', { retries: 2, retryDelayMs: 10 });

    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should parse error from response body', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Bad request', code: 'INVALID_INPUT' }),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(fetchJson('/api/test', { retries: 0 })).rejects.toMatchObject({
      message: 'Bad request',
      code: 'INVALID_INPUT',
      status: 400,
    });
  });

  it('should handle non-JSON error response', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.reject(new Error('Not JSON')),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    await expect(fetchJson('/api/test', { retries: 0 })).rejects.toMatchObject({
      message: 'Not Found',
      status: 404,
    });
  });
});

describe('useOffline hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (NetInfo.addEventListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
  });

  it('should return online status when connected', async () => {
    const { result } = renderHook(() => useOffline());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });
  });

  it('should subscribe to network changes', () => {
    renderHook(() => useOffline());

    expect(NetInfo.addEventListener).toHaveBeenCalled();
  });
});

describe('global handler registration', () => {
  it('should set and get global unauthorized handler', () => {
    const handler = jest.fn();
    setOnUnauthorizedGlobal(handler);

    expect(getOnUnauthorizedGlobal()).toBe(handler);
  });

  it('should allow clearing global handler', () => {
    const handler = jest.fn();
    setOnUnauthorizedGlobal(handler);
    setOnUnauthorizedGlobal(null);

    expect(getOnUnauthorizedGlobal()).toBe(null);
  });
});
