import fetchJson, {
  setOnUnauthorizedGlobal,
  setOnForbiddenGlobal,
  setOnServerErrorGlobal,
  getOnUnauthorizedGlobal,
  useOffline,
} from '../utils/apiClient';
import NetInfo from '@react-native-community/netinfo';
import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@react-native-community/netinfo');

describe('fetchJson', () => {
  beforeEach(() => {
    (NetInfo.fetch as jest.Mock).mockReset();
    (NetInfo.addEventListener as jest.Mock).mockReset?.();
    setOnUnauthorizedGlobal(null);
    setOnForbiddenGlobal(null);
    setOnServerErrorGlobal(null);
    // @ts-ignore
    global.fetch = jest.fn();
  });

  it('returns parsed JSON on success', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ a: 1 }) });

    const res = await fetchJson('/ok');
    expect(res).toEqual({ a: 1 });
    // fetch may be called with or without an options object depending on environment
    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0][0]).toBe('/ok');
    if (calls[0].length > 1) expect(typeof calls[0][1]).toBe('object');
  });

  it('throws offline error when NetInfo reports offline', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

    await expect(fetchJson('/offline')).rejects.toMatchObject({
      message: 'Offline',
      code: 'offline',
    });
  });

  it('invokes per-request and global unauthorized handlers on 401', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ error: 'no' }),
    });

    const perReq = jest.fn();
    const globalHandler = jest.fn();
    setOnUnauthorizedGlobal(globalHandler);

    await expect(fetchJson('/401', { onUnauthorized: perReq })).rejects.toMatchObject({
      message: 'Unauthorized',
      status: 401,
    });
    expect(perReq).toHaveBeenCalled();
    expect(globalHandler).toHaveBeenCalled();
  });

  it('retries on transient failures', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    const f = global.fetch as jest.Mock;
    f.mockRejectedValueOnce(new Error('network'));
    f.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    const res = await fetchJson('/retry', { retries: 2, retryDelayMs: 1 });
    expect(res).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('throws on 403 forbidden and calls global handler', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 403,
      ok: false,
      json: async () => ({ error: 'forbidden' }),
    });

    const forbiddenHandler = jest.fn();
    setOnForbiddenGlobal(forbiddenHandler);

    await expect(fetchJson('/forbidden')).rejects.toMatchObject({
      message: 'Permission denied',
      status: 403,
    });
    expect(forbiddenHandler).toHaveBeenCalled();
  });

  it('throws on 500+ server error and calls global handler', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 500,
      ok: false,
      json: async () => ({ error: 'server error' }),
    });

    const serverErrorHandler = jest.fn();
    setOnServerErrorGlobal(serverErrorHandler);

    await expect(fetchJson('/server-error')).rejects.toMatchObject({
      message: 'Server error',
      status: 500,
    });
    expect(serverErrorHandler).toHaveBeenCalledWith(500);
  });

  it('handles non-ok responses with structured error body', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 400,
      ok: false,
      json: async () => ({
        error: 'Bad request',
        code: 'VALIDATION_ERROR',
        correlationId: 'abc123',
      }),
    });

    await expect(fetchJson('/bad-request')).rejects.toMatchObject({
      message: 'Bad request',
      code: 'VALIDATION_ERROR',
      correlationId: 'abc123',
      status: 400,
    });
  });

  it('handles non-ok responses when json parsing fails', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 400,
      ok: false,
      statusText: 'Bad Request',
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await expect(fetchJson('/bad-json')).rejects.toMatchObject({
      message: 'Bad Request',
      status: 400,
    });
  });

  it('throws no_response error when fetch returns falsy', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (global.fetch as jest.Mock).mockResolvedValue(undefined);

    await expect(fetchJson('/no-response')).rejects.toMatchObject({
      message: 'No response from fetch',
      code: 'no_response',
    });
  });

  it('does not retry on AbortError', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    (global.fetch as jest.Mock).mockRejectedValue(abortError);

    await expect(fetchJson('/abort', { retries: 3, retryDelayMs: 1 })).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('normalizes error when retries exhausted', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failed'));

    await expect(fetchJson('/fail', { retries: 1, retryDelayMs: 1 })).rejects.toMatchObject({
      message: 'Network failed',
    });
  });

  it('passes signal to fetch when provided', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ data: 'ok' }) });

    const controller = new AbortController();
    await fetchJson('/with-signal', { signal: controller.signal });

    expect(global.fetch).toHaveBeenCalledWith(
      '/with-signal',
      expect.objectContaining({ signal: controller.signal })
    );
  });

  it('continues when NetInfo.fetch throws', async () => {
    (NetInfo.fetch as jest.Mock).mockRejectedValue(new Error('NetInfo failed'));
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ data: 'ok' }) });

    const result = await fetchJson('/netinfo-fail');
    expect(result).toEqual({ data: 'ok' });
  });

  it('getOnUnauthorizedGlobal returns the registered handler', () => {
    expect(getOnUnauthorizedGlobal()).toBeNull();

    const handler = jest.fn();
    setOnUnauthorizedGlobal(handler);

    expect(getOnUnauthorizedGlobal()).toBe(handler);
  });
});

describe('useOffline', () => {
  beforeEach(() => {
    (NetInfo.fetch as jest.Mock).mockReset();
    (NetInfo.addEventListener as jest.Mock).mockReset();
  });

  it('returns online state initially', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (NetInfo.addEventListener as jest.Mock).mockReturnValue({ remove: jest.fn() });

    const { result } = renderHook(() => useOffline());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });
  });

  it('updates state when network changes', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    let listener: ((state: any) => void) | undefined;
    (NetInfo.addEventListener as jest.Mock).mockImplementation(cb => {
      listener = cb;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useOffline());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });

    act(() => {
      listener?.({ isConnected: false });
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('handles legacy function-style unsubscribe', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    const unsubFn = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubFn);

    const { unmount } = renderHook(() => useOffline());

    await waitFor(() => expect(NetInfo.fetch).toHaveBeenCalled());

    unmount();
    expect(unsubFn).toHaveBeenCalled();
  });
});
