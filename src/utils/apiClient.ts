import NetInfo from '@react-native-community/netinfo';

export type ApiError = {
  message: string;
  code?: string | number;
  correlationId?: string;
  status?: number;
};

type FetchOptions = RequestInit & {
  retries?: number;
  retryDelayMs?: number;
  onUnauthorized?: () => void;
};

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function fetchJson<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const { retries = 1, retryDelayMs = 400, onUnauthorized, signal, ...rest } = options;

  // Offline fast-fail
  try {
    const net = await NetInfo.fetch();
    if (!net.isConnected) throw { message: 'Offline', code: 'offline' } as ApiError;
  } catch (_err) {
    // NetInfo may fail on web; ignore and continue
  }

  let attempt = 0;
  while (true) {
    try {
      const resp = await fetch(url, { signal, ...rest });

      if (resp.status === 401) {
        onUnauthorized?.();
        throw { message: 'Unauthorized', status: 401 } as ApiError;
      }

      if (!resp.ok) {
        // Try parse structured error
        let body: any = null;
        try {
          body = await resp.json();
        } catch (_e) {
          body = { error: resp.statusText || 'Unknown error' };
        }
        const err: ApiError = {
          message: (body && (body.error || body.message)) || 'Request failed',
          code: body?.code,
          correlationId: body?.correlationId,
          status: resp.status,
        };
        throw err;
      }

      // OK
      return (await resp.json()) as T;
    } catch (err: any) {
      // Abort errors shouldn't be retried
      if (err && err.name === 'AbortError') throw err;

      attempt += 1;
      if (attempt > retries) {
        // Normalize to ApiError
        if ((err as ApiError)?.message) throw err;
        throw { message: err?.message || 'Network error' } as ApiError;
      }

      await delay(retryDelayMs * attempt);
      continue;
    }
  }
}

// A small hook to observe online/offline state in components
import { useEffect, useState } from 'react';

export function useOffline() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  useEffect(() => {
    let mounted = true;
    NetInfo.fetch().then((s) => mounted && setIsOnline(!!s.isConnected));
    const unsub = NetInfo.addEventListener((s) => mounted && setIsOnline(!!s.isConnected));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);
  return { isOnline, isOffline: !isOnline };
}

export default fetchJson;
