import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

import { API_BASE_URL } from './apiConfig';
import { clearAuthToken } from './auth';
import logger from '../lib/logger';

export interface ErrorEnvelope {
  message: string;
  code?: string;
  correlationId?: string;
  status: number;
  offline?: boolean;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  correlationId?: string;
  offline?: boolean;

  constructor({ message, status, code, correlationId, offline }: ErrorEnvelope) {
    super(message);
    this.status = status;
    this.code = code;
    this.correlationId = correlationId;
    this.offline = offline;
  }
}

export interface ApiRequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  retries?: number;
}

type UnauthorizedHandler = () => Promise<void> | void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

async function handleUnauthorized() {
  await clearAuthToken();
  if (unauthorizedHandler) await unauthorizedHandler();
}

function normalizeUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
}

function buildErrorEnvelope(status: number, payload: any, offline = false): ErrorEnvelope {
  const message =
    payload?.error?.message || payload?.error || payload?.message || 'Request failed';
  const code = payload?.code || payload?.error?.code;
  const correlationId = payload?.correlationId || payload?.error?.correlationId;
  return { message, status, code, correlationId, offline };
}

export async function apiRequest<T>(options: ApiRequestOptions): Promise<T> {
  const { path, method = 'GET', body, headers, signal, retries = 1 } = options;

  const connection = await NetInfo.fetch();
  if (!connection.isConnected) {
    throw new ApiError(buildErrorEnvelope(0, { message: 'Offline' }, true));
  }

  const url = normalizeUrl(path);
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });

      const payload = await response.json().catch(() => undefined);

      if (response.status === 401) {
        await handleUnauthorized();
        throw new ApiError(buildErrorEnvelope(response.status, payload));
      }

      if (!response.ok) {
        throw new ApiError(buildErrorEnvelope(response.status, payload));
      }

      return (payload as T) ?? ({} as T);
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
      lastError = err;
      if (attempt >= retries) break;
      await new Promise(res => setTimeout(res, 300 * (attempt + 1)));
      attempt += 1;
    }
  }

  if (lastError instanceof ApiError) throw lastError;
  logger.warn('apiRequest.fallback_error', { error: String(lastError) });
  throw new ApiError(buildErrorEnvelope(0, { message: 'Network error' }));
}

export function useApiConnectivity() {
  const [state, setState] = useState<Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe: unknown = NetInfo.addEventListener(status => {
      setState({
        isConnected: status.isConnected,
        isInternetReachable: status.isInternetReachable,
      });
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        (unsubscribe as () => void)();
      } else if (unsubscribe && typeof (unsubscribe as any).remove === 'function') {
        (unsubscribe as any).remove();
      }
    };
  }, []);

  return {
    isOffline: state.isConnected === false || state.isInternetReachable === false,
    details: state,
  };
}
