// src/hooks/useServiceAvailability.ts
// Hook to check availability of external services (Stripe, AI, etc.)

import { useQuery } from '@tanstack/react-query';

import { API_BASE_URL } from '../utils/apiConfig';
import { fetchJson } from '../utils/apiClient';

export interface ServiceStatus {
  available: boolean;
  message: string | null;
}

export interface ServiceAvailability {
  services: {
    stripe: ServiceStatus;
    ai: ServiceStatus;
    firebase: ServiceStatus;
    database: ServiceStatus;
  };
  paymentsEnabled: boolean;
  aiEnabled: boolean;
}

async function fetchServiceAvailability(): Promise<ServiceAvailability> {
  try {
    return await fetchJson<ServiceAvailability>(`${API_BASE_URL}/config/services`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (_error) {
    // Return default availability if config endpoint fails
    // Assume services are available unless explicitly told otherwise
    return {
      services: {
        stripe: { available: true, message: null },
        ai: { available: true, message: null },
        firebase: { available: true, message: null },
        database: { available: true, message: null },
      },
      paymentsEnabled: true,
      aiEnabled: true,
    };
  }
}

/**
 * Hook to check service availability.
 * Uses React Query with 5-minute stale time to avoid excessive requests.
 */
export function useServiceAvailability() {
  const query = useQuery({
    queryKey: ['serviceAvailability'],
    queryFn: fetchServiceAvailability,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    retry: 1,
  });

  return {
    isLoading: query.isLoading,
    services: query.data?.services,
    paymentsEnabled: query.data?.paymentsEnabled ?? true,
    aiEnabled: query.data?.aiEnabled ?? true,
    stripeAvailable: query.data?.services?.stripe?.available ?? true,
    stripeMessage: query.data?.services?.stripe?.message,
    aiAvailable: query.data?.services?.ai?.available ?? true,
    aiMessage: query.data?.services?.ai?.message,
    refetch: query.refetch,
  };
}
