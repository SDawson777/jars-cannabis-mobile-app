// src/hooks/useMapbox.ts
// Map, geolocation, and geofencing hooks using Mapbox

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email?: string;
  coordinates: Coordinates;
  hours: StoreHours;
  isOpen: boolean;
  distance?: number; // in miles
  duration?: number; // estimated travel time in minutes
  trafficLevel?: 'low' | 'moderate' | 'heavy';
  amenities: string[];
  services: ('pickup' | 'delivery' | 'inStore')[];
  rating?: number;
  reviewCount?: number;
  image?: string;
}

export interface StoreHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface Geofence {
  id: string;
  storeId: string;
  storeName: string;
  coordinates: Coordinates;
  radiusMeters: number;
  triggerOnEntry: boolean;
  triggerOnExit: boolean;
  isActive: boolean;
}

export interface GeofenceEvent {
  id: string;
  geofenceId: string;
  storeId: string;
  storeName: string;
  eventType: 'entry' | 'exit' | 'dwell';
  timestamp: string;
  coordinates: Coordinates;
  deal?: LocalDeal;
}

export interface LocalDeal {
  id: string;
  storeId: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'bogo';
  discountValue: number;
  minimumPurchase?: number;
  expiresAt: string;
  code?: string;
  image?: string;
}

export interface Route {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  steps: RouteStep[];
  trafficLevel: 'low' | 'moderate' | 'heavy';
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    instruction: string;
    bearing_after: number;
    bearing_before: number;
    location: [number, number];
  };
}

export interface MapSettings {
  style: 'streets' | 'outdoors' | 'light' | 'dark' | 'satellite';
  showTraffic: boolean;
  showStores: boolean;
  show3DBuildings: boolean;
  units: 'imperial' | 'metric';
  defaultZoom: number;
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  type: 'store' | 'address' | 'poi';
  distance?: number;
}

// ============================================
// Location Hook
// ============================================

/**
 * Hook for managing user location with high accuracy
 */
export function useUserLocation(options?: {
  enableHighAccuracy?: boolean;
  watchPosition?: boolean;
  maximumAge?: number;
  timeout?: number;
}) {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In React Native, use expo-location or react-native-geolocation-service
      interface GeoPositionCoords {
        latitude: number;
        longitude: number;
      }
      interface GeoPosition {
        coords: GeoPositionCoords;
      }

      const position = await new Promise<GeoPosition>((resolve, reject) => {
        const nav = globalThis.navigator as
          | {
              geolocation?: {
                getCurrentPosition: (
                  s: (p: GeoPosition) => void,
                  e: (e: { message: string }) => void,
                  o: object
                ) => void;
              };
            }
          | undefined;

        if (nav?.geolocation) {
          nav.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: options?.enableHighAccuracy ?? true,
            timeout: options?.timeout ?? 15000,
            maximumAge: options?.maximumAge ?? 60000,
          });
        } else {
          reject(new Error('Geolocation not supported'));
        }
      });

      const coords: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(coords);
      logEvent('location_obtained', { method: 'request' });
      return coords;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options?.enableHighAccuracy, options?.timeout, options?.maximumAge]);

  const startWatching = useCallback(() => {
    const nav = globalThis.navigator as
      | {
          geolocation?: {
            watchPosition: (
              s: (p: { coords: { latitude: number; longitude: number } }) => void,
              e: (e: { message: string }) => void,
              o: object
            ) => number;
            clearWatch: (id: number) => void;
          };
        }
      | undefined;

    if (nav?.geolocation && watchIdRef.current === null) {
      watchIdRef.current = nav.geolocation.watchPosition(
        position => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        err => {
          setError(err.message);
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 15000,
          maximumAge: options?.maximumAge ?? 10000,
        }
      );
      setIsWatching(true);
    }
  }, [options?.enableHighAccuracy, options?.timeout, options?.maximumAge]);

  const stopWatching = useCallback(() => {
    const nav = globalThis.navigator as
      | {
          geolocation?: { clearWatch: (id: number) => void };
        }
      | undefined;

    if (nav?.geolocation && watchIdRef.current !== null) {
      nav.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsWatching(false);
    }
  }, []);

  useEffect(() => {
    if (options?.watchPosition) {
      startWatching();
    }
    return () => stopWatching();
  }, [options?.watchPosition, startWatching, stopWatching]);

  return {
    location,
    error,
    isLoading,
    isWatching,
    requestLocation,
    startWatching,
    stopWatching,
  };
}

// ============================================
// Store Locator Hooks
// ============================================

/**
 * Hook to fetch nearby stores with distance and traffic info
 */
export function useNearbyStores(options?: {
  coordinates?: Coordinates;
  radiusMiles?: number;
  services?: ('pickup' | 'delivery' | 'inStore')[];
  limit?: number;
}) {
  return useQuery<Store[], Error>({
    queryKey: ['stores', 'nearby', options],
    queryFn: async () => {
      const res = await clientGet<{ stores: Store[] }>(phase4Client, '/stores/nearby', {
        params: {
          lat: options?.coordinates?.latitude,
          lng: options?.coordinates?.longitude,
          radius: options?.radiusMiles || 25,
          services: options?.services?.join(','),
          limit: options?.limit || 20,
        },
      });
      return res.stores;
    },
    enabled: !!options?.coordinates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single store with full details
 */
export function useStore(storeId: string) {
  return useQuery<Store, Error>({
    queryKey: ['stores', 'detail', storeId],
    queryFn: async () => {
      return await clientGet<Store>(phase4Client, `/stores/${storeId}`);
    },
    enabled: !!storeId,
  });
}

/**
 * Hook to search for stores or addresses
 */
export function useMapSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const search = useQuery<SearchResult[], Error>({
    queryKey: ['map', 'search', query],
    queryFn: async () => {
      const res = await clientGet<{ results: SearchResult[] }>(phase4Client, '/map/search', {
        params: { q: query },
      });
      return res.results;
    },
    enabled: query.length >= 2,
  });

  useEffect(() => {
    if (search.data) {
      setResults(search.data);
    }
  }, [search.data]);

  return {
    query,
    setQuery,
    results,
    isSearching: search.isLoading,
    error: search.error,
  };
}

// ============================================
// Routing Hooks
// ============================================

/**
 * Hook to get directions to a store with live traffic
 */
export function useDirections(options: {
  origin?: Coordinates;
  destination?: Coordinates;
  mode?: 'driving' | 'walking' | 'cycling';
}) {
  return useQuery<Route, Error>({
    queryKey: ['map', 'directions', options],
    queryFn: async () => {
      return await clientGet<Route>(phase4Client, '/map/directions', {
        params: {
          originLat: options.origin?.latitude,
          originLng: options.origin?.longitude,
          destLat: options.destination?.latitude,
          destLng: options.destination?.longitude,
          mode: options.mode || 'driving',
        },
      });
    },
    enabled: !!options.origin && !!options.destination,
    refetchInterval: 60000, // Refresh traffic every minute
  });
}

/**
 * Hook to get estimated travel time to multiple stores
 */
export function useTravelTimes(options: { origin?: Coordinates; storeIds: string[] }) {
  return useQuery<
    Record<string, { distance: number; duration: number; trafficLevel: string }>,
    Error
  >({
    queryKey: ['map', 'travel-times', options],
    queryFn: async () => {
      return await clientGet<
        Record<string, { distance: number; duration: number; trafficLevel: string }>
      >(phase4Client, '/map/travel-times', {
        params: {
          originLat: options.origin?.latitude,
          originLng: options.origin?.longitude,
          storeIds: options.storeIds.join(','),
        },
      });
    },
    enabled: !!options.origin && options.storeIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================
// Geofencing Hooks
// ============================================

/**
 * Hook to manage geofences for stores
 */
export function useGeofences() {
  return useQuery<Geofence[], Error>({
    queryKey: ['geofences'],
    queryFn: async () => {
      const res = await clientGet<{ geofences: Geofence[] }>(phase4Client, '/geofences');
      return res.geofences;
    },
  });
}

/**
 * Hook to register/update geofences
 */
export function useRegisterGeofence() {
  const queryClient = useQueryClient();

  return useMutation<
    Geofence,
    Error,
    {
      storeId: string;
      radiusMeters?: number;
      triggerOnEntry?: boolean;
      triggerOnExit?: boolean;
    }
  >({
    mutationFn: async (params: {
      storeId: string;
      radiusMeters?: number;
      triggerOnEntry?: boolean;
      triggerOnExit?: boolean;
    }) => {
      return await clientPost<typeof params, Geofence>(phase4Client, '/geofences', params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] });
      logEvent('geofence_registered', {});
    },
  });
}

/**
 * Hook to handle geofence events (entry/exit)
 */
export function useGeofenceEvents() {
  const queryClient = useQueryClient();
  const [recentEvents, setRecentEvents] = useState<GeofenceEvent[]>([]);

  const reportEvent = useMutation<
    GeofenceEvent,
    Error,
    {
      geofenceId: string;
      eventType: 'entry' | 'exit' | 'dwell';
      coordinates: Coordinates;
    }
  >({
    mutationFn: async (event: {
      geofenceId: string;
      eventType: 'entry' | 'exit' | 'dwell';
      coordinates: Coordinates;
    }) => {
      const result = await clientPost<typeof event, GeofenceEvent>(
        phase4Client,
        '/geofences/events',
        event
      );
      logEvent('geofence_triggered', {
        eventType: event.eventType,
        geofenceId: event.geofenceId,
      });
      return result;
    },
    onSuccess: (event: GeofenceEvent) => {
      setRecentEvents(prev => [event, ...prev].slice(0, 10));
      queryClient.invalidateQueries({ queryKey: ['deals', 'local'] });
    },
  });

  return {
    recentEvents,
    reportEvent: reportEvent.mutate,
    isReporting: reportEvent.isPending,
  };
}

/**
 * Hook to fetch local deals when entering a geofence
 */
export function useLocalDeals(storeId?: string) {
  return useQuery<LocalDeal[], Error>({
    queryKey: ['deals', 'local', storeId],
    queryFn: async () => {
      const res = await clientGet<{ deals: LocalDeal[] }>(phase4Client, '/deals/local', {
        params: { storeId },
      });
      return res.deals;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================
// Map Settings Hooks
// ============================================

/**
 * Hook to manage map display settings
 */
export function useMapSettings() {
  const [settings, setSettings] = useState<MapSettings>({
    style: 'streets',
    showTraffic: true,
    showStores: true,
    show3DBuildings: false,
    units: 'imperial',
    defaultZoom: 12,
  });

  const updateSettings = useCallback((updates: Partial<MapSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    logEvent('map_settings_updated', updates);
  }, []);

  return {
    settings,
    updateSettings,
  };
}

/**
 * Hook to calculate distance between two points
 */
export function useDistance(from?: Coordinates, to?: Coordinates) {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (from && to) {
      // Haversine formula
      const R = 3959; // Earth's radius in miles
      const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
      const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((from.latitude * Math.PI) / 180) *
          Math.cos((to.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      setDistance(R * c);
    } else {
      setDistance(null);
    }
  }, [from, to]);

  return distance;
}

// ============================================
// Mapbox Token Hook
// ============================================

/**
 * Hook to get Mapbox access token (from environment)
 */
export function useMapboxToken() {
  // In production, this would come from environment variables
  // MAPBOX_TOKEN should be set in the app config
  const token = process.env.MAPBOX_TOKEN || process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';

  return {
    token,
    isConfigured: !!token,
  };
}
