// src/hooks/useAgeVerification.ts
// Robust age verification with ID verification and location gating

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

// ============================================
// Types
// ============================================

export interface VerificationStatus {
  userId: string;
  ageVerified: boolean;
  idVerified: boolean;
  locationVerified: boolean;
  verificationMethod?: 'id_scan' | 'database' | 'manual' | 'self_attestation';
  verifiedAt?: string;
  expiresAt?: string;
  state?: string;
  restrictions: string[];
}

export interface IDVerificationRequest {
  documentType: 'drivers_license' | 'passport' | 'state_id' | 'military_id';
  frontImageData: string; // Base64
  backImageData?: string; // Base64 (for driver's license)
  selfieImageData?: string; // Base64 for liveness check
}

export interface IDVerificationResult {
  success: boolean;
  verified: boolean;
  documentType: string;
  extractedData?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    age?: number;
    state?: string;
    expirationDate?: string;
    documentNumber?: string;
  };
  checks: {
    ageCheck: boolean;
    expirationCheck: boolean;
    livenessCheck?: boolean;
    documentAuthenticityCheck?: boolean;
  };
  failureReasons?: string[];
  verificationId: string;
}

export interface LocationGateStatus {
  allowed: boolean;
  state?: string;
  city?: string;
  county?: string;
  restrictions: {
    type: 'recreational' | 'medical_only' | 'prohibited';
    minAge: number;
    purchaseLimits?: {
      flower?: string;
      concentrate?: string;
      edibles?: string;
    };
    deliveryAllowed: boolean;
    curbsideAllowed: boolean;
  };
  nearestLegalLocation?: {
    city: string;
    state: string;
    distance: number;
  };
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// ============================================
// Verification Status Hooks
// ============================================

/**
 * Hook to get current verification status
 */
export function useVerificationStatus() {
  return useQuery<VerificationStatus, Error>({
    queryKey: ['verification', 'status'],
    queryFn: async () => {
      return await clientGet<VerificationStatus>(
        phase4Client,
        '/verification/status'
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if user can purchase
 */
export function useCanPurchase() {
  const { data: status, isLoading } = useVerificationStatus();
  
  return {
    canPurchase: status?.ageVerified && status?.locationVerified,
    requiresIdVerification: status && !status.idVerified,
    requiresLocationVerification: status && !status.locationVerified,
    restrictions: status?.restrictions || [],
    isLoading,
  };
}

// ============================================
// ID Verification Hooks
// ============================================

/**
 * Hook to submit ID for verification
 */
export function useSubmitIDVerification() {
  const queryClient = useQueryClient();
  
  return useMutation<IDVerificationResult, Error, IDVerificationRequest>({
    mutationFn: async (request: IDVerificationRequest) => {
      const result = await clientPost<IDVerificationRequest, IDVerificationResult>(
        phase4Client,
        '/verification/id/submit',
        request
      );
      logEvent('id_verification_submitted', { 
        documentType: request.documentType,
        success: result.success,
        verified: result.verified,
      });
      return result;
    },
    onSuccess: (data: IDVerificationResult) => {
      if (data.verified) {
        queryClient.invalidateQueries({ queryKey: ['verification', 'status'] });
      }
    },
  });
}

/**
 * Hook to check ID verification status (for async verification)
 */
export function useIDVerificationStatus(verificationId: string) {
  return useQuery<IDVerificationResult, Error>({
    queryKey: ['verification', 'id', verificationId],
    queryFn: async () => {
      return await clientGet<IDVerificationResult>(
        phase4Client,
        `/verification/id/${verificationId}`
      );
    },
    enabled: !!verificationId,
    refetchInterval: (query: { state: { data?: IDVerificationResult } }) => {
      // Poll every 2 seconds if still pending
      const data = query.state.data;
      if (data && !data.success && !data.verified) {
        return 2000;
      }
      return false;
    },
  });
}

/**
 * Hook for self-attestation (basic age verification)
 */
export function useSelfAttestation() {
  const queryClient = useQueryClient();
  
  return useMutation<{ verified: boolean; expiresAt: string }, Error, { 
    dateOfBirth: string;
    agreedToTerms: boolean;
  }>({
    mutationFn: async (data: { dateOfBirth: string; agreedToTerms: boolean }) => {
      const result = await clientPost<typeof data, { verified: boolean; expiresAt: string }>(
        phase4Client,
        '/verification/self-attest',
        data
      );
      logEvent('self_attestation_submitted', { verified: result.verified });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification', 'status'] });
    },
  });
}

// ============================================
// Location Gating Hooks
// ============================================

/**
 * Hook to check location-based restrictions
 */
export function useLocationGate(location?: GeoLocation) {
  return useQuery<LocationGateStatus, Error>({
    queryKey: ['verification', 'location', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) {
        throw new Error('Location required');
      }
      return await clientGet<LocationGateStatus>(
        phase4Client,
        '/verification/location/check',
        { params: { lat: location.latitude, lng: location.longitude } }
      );
    },
    enabled: !!location,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to verify and store location
 */
export function useVerifyLocation() {
  const queryClient = useQueryClient();
  
  return useMutation<LocationGateStatus, Error, GeoLocation>({
    mutationFn: async (location: GeoLocation) => {
      const result = await clientPost<GeoLocation, LocationGateStatus>(
        phase4Client,
        '/verification/location/verify',
        location
      );
      logEvent('location_verified', { 
        allowed: result.allowed,
        state: result.state,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification', 'status'] });
    },
  });
}

/**
 * Hook to get user's current location
 */
export function useCurrentLocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In React Native, we'd use expo-location or react-native-geolocation
      // This is a placeholder for the actual implementation
      interface GeoPositionCoords {
        latitude: number;
        longitude: number;
        accuracy: number | null;
      }
      interface GeoPosition {
        coords: GeoPositionCoords;
      }
      const position = await new Promise<GeoPosition>((resolve, reject) => {
        const nav = globalThis.navigator as { geolocation?: { getCurrentPosition: (s: (p: GeoPosition) => void, e: (e: Error) => void, o: object) => void } } | undefined;
        if (nav && 'geolocation' in nav && nav.geolocation) {
          nav.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        } else {
          reject(new Error('Geolocation not supported'));
        }
      });
      
      const newLocation: GeoLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
      };
      
      setLocation(newLocation);
      return newLocation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    location,
    error,
    isLoading,
    requestLocation,
  };
}

// ============================================
// State Regulations Hook
// ============================================

/**
 * Hook to get regulations for a specific state
 */
export function useStateRegulationsForVerification(stateCode: string) {
  return useQuery<{
    state: string;
    stateCode: string;
    legalStatus: 'recreational' | 'medical' | 'decriminalized' | 'illegal';
    minAge: number;
    medicalCardRequired: boolean;
    purchaseLimits: Record<string, string>;
    deliveryRules: {
      allowed: boolean;
      hoursOfOperation?: string;
      idRequiredAtDelivery: boolean;
    };
    restrictions: string[];
  }, Error>({
    queryKey: ['verification', 'regulations', stateCode],
    queryFn: async () => {
      return await clientGet(
        phase4Client,
        `/verification/regulations/${stateCode}`
      );
    },
    enabled: !!stateCode,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// ============================================
// Verification Session Hooks
// ============================================

const VERIFICATION_SESSION_KEY = '@nimbus/verification_session';

/**
 * Hook to manage verification session locally
 */
export function useVerificationSession() {
  const [session, setSession] = useState<{
    ageVerified: boolean;
    verifiedAt?: string;
    expiresAt?: string;
  } | null>(null);
  
  useEffect(() => {
    // Load session from storage
    AsyncStorage.getItem(VERIFICATION_SESSION_KEY).then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        // Check if not expired
        if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          setSession(parsed);
        } else {
          AsyncStorage.removeItem(VERIFICATION_SESSION_KEY);
        }
      }
    });
  }, []);
  
  const saveSession = useCallback(async (verified: boolean, expiresAt: string) => {
    const newSession = {
      ageVerified: verified,
      verifiedAt: new Date().toISOString(),
      expiresAt,
    };
    await AsyncStorage.setItem(VERIFICATION_SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);
  
  const clearSession = useCallback(async () => {
    await AsyncStorage.removeItem(VERIFICATION_SESSION_KEY);
    setSession(null);
  }, []);
  
  return {
    session,
    isVerified: session?.ageVerified ?? false,
    saveSession,
    clearSession,
  };
}

// ============================================
// Delivery Address Verification Hook
// ============================================

/**
 * Hook to verify if delivery is allowed to an address
 */
export function useDeliveryAddressVerification() {
  return useMutation<{
    allowed: boolean;
    reason?: string;
    restrictions?: string[];
    alternativeOptions?: string[];
  }, Error, {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }>({
    mutationFn: async (address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    }) => {
      const result = await clientPost<typeof address, {
        allowed: boolean;
        reason?: string;
        restrictions?: string[];
        alternativeOptions?: string[];
      }>(
        phase4Client,
        '/verification/delivery-address',
        address
      );
      logEvent('delivery_address_verified', { 
        allowed: result.allowed,
        state: address.state,
      });
      return result;
    },
  });
}
