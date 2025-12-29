/**
 * Centralized fetch helper for the app.
 *
 * Features:
 * - Retry logic for transient failures
 * - Normalized ApiError envelope
 * - Per-request and global unauthorized (401) handlers
 * - Offline fast-fail via NetInfo
 *
 * Use `fetchJson(url, { retries, retryDelayMs, onUnauthorized })`.
 */
import NetInfo from '@react-native-community/netinfo';

export type ApiError = {
  message: string;
  code?: string | number;
  correlationId?: string;
  status?: number;
};

type FetchOptions = Record<string, any> & {
  retries?: number;
  retryDelayMs?: number;
  onUnauthorized?: () => void;
};

async function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export async function fetchJson<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const { retries = 1, retryDelayMs = 400, onUnauthorized, signal, ...rest } = options;

  // Offline fast-fail: call NetInfo.fetch and only throw when it explicitly reports offline.
  let netInfoState: any | undefined;
  try {
    netInfoState = await NetInfo.fetch();
  } catch (_err) {
    // NetInfo may fail on some platforms (web/testing). In that case, don't assume offline.
    netInfoState = undefined;
  }
  if (netInfoState && netInfoState.isConnected === false) {
    throw { message: 'Offline', code: 'offline' } as ApiError;
  }

  let attempt = 0;
  while (true) {
    try {
      // Avoid passing `signal: undefined` into fetch to preserve call-site shapes in tests.
      const opts: any = { ...rest };
      if (signal) opts.signal = signal;
      const resp = Object.keys(opts).length ? await fetch(url, opts) : await fetch(url as any);

      // Defensive: if fetch resolves to a falsy/undefined response, normalize error
      if (!resp) {
        throw { message: 'No response from fetch', code: 'no_response' } as ApiError;
      }

      if (resp.status === 401) {
        // Call per-request handler first, then global handler if present
        onUnauthorized?.();
        if (typeof onUnauthorizedGlobal === 'function') onUnauthorizedGlobal();
        throw { message: 'Unauthorized', status: 401 } as ApiError;
      }

      if (resp.status === 403) {
        // Permission denied - trigger permission modal handler if registered
        if (typeof onForbiddenGlobal === 'function') onForbiddenGlobal();
        throw { message: 'Permission denied', status: 403 } as ApiError;
      }

      if (resp.status >= 500) {
        // Server error - trigger toast handler if registered
        if (typeof onServerErrorGlobal === 'function') onServerErrorGlobal(resp.status);
        throw { message: 'Server error', status: resp.status } as ApiError;
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
    NetInfo.fetch().then(s => mounted && setIsOnline(!!s.isConnected));
    const unsub = NetInfo.addEventListener(s => mounted && setIsOnline(!!s.isConnected));
    return () => {
      mounted = false;
      // NetInfo returns a subscription object with a `remove` method
      if (typeof unsub === 'function') {
        // Back-compat: older versions returned a function
        (unsub as unknown as () => void)();
      } else if (unsub && typeof (unsub as any).remove === 'function') {
        (unsub as any).remove();
      }
    };
  }, []);
  return { isOnline, isOffline: !isOnline };
}

export default fetchJson;

// Global handler registration for 401 -> allow AuthProvider to register auto-logout
let onUnauthorizedGlobal: (() => void) | null = null;
let onForbiddenGlobal: (() => void) | null = null;
let onServerErrorGlobal: ((status: number) => void) | null = null;

export function setOnUnauthorizedGlobal(fn: (() => void) | null) {
  onUnauthorizedGlobal = fn;
}

export function getOnUnauthorizedGlobal() {
  return onUnauthorizedGlobal;
}

export function setOnForbiddenGlobal(fn: (() => void) | null) {
  onForbiddenGlobal = fn;
}

export function setOnServerErrorGlobal(fn: ((status: number) => void) | null) {
  onServerErrorGlobal = fn;
}
