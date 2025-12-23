import fetchJson, { setOnUnauthorizedGlobal } from '../utils/apiClient';
import NetInfo from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo');

describe('fetchJson', () => {
  beforeEach(() => {
    (NetInfo.fetch as jest.Mock).mockReset();
    (NetInfo.addEventListener as jest.Mock).mockReset?.();
    setOnUnauthorizedGlobal(null);
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
});
