/**
 * React Query configuration with offline persistence and background sync
 */
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Create persister for offline storage
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'NIMBUS_REACT_QUERY_CACHE',
  throttleTime: 1000,
});

// Custom network mode resolver
const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? true;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      gcTime: 1000 * 60 * 5,
      // Stale after 1 minute
      staleTime: 1000 * 60,
      // Retry failed queries 2 times
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Network mode: support offline
      networkMode: 'offlineFirst',
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on window focus for mobile
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Network mode for mutations
      networkMode: 'offlineFirst',
    },
  },
});

// Register online/offline detection
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    // When back online, invalidate and refetch
    queryClient.invalidateQueries();
  }
});

export default queryClient;
