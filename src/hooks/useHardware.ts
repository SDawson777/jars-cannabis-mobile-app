// src/hooks/useHardware.ts
// Hardware integrations: smart scales, consumption trackers, digital wallets

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost, clientDelete } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

export type DeviceType = 'smart_scale' | 'consumption_tracker' | 'vaporizer' | 'dab_rig' | 'other';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface HardwareDevice {
  id: string;
  type: DeviceType;
  name: string;
  manufacturer: string;
  model: string;
  firmwareVersion?: string;
  batteryLevel?: number;
  connectionStatus: ConnectionStatus;
  lastConnected?: string;
  lastSynced?: string;
  capabilities: string[];
  settings?: Record<string, unknown>;
}

export interface SmartScaleReading {
  id: string;
  deviceId: string;
  weight: number;
  unit: 'g' | 'oz' | 'mg';
  timestamp: string;
  productId?: string;
  strainName?: string;
  notes?: string;
}

export interface ConsumptionTrackerReading {
  id: string;
  deviceId: string;
  sessionStart: string;
  sessionEnd?: string;
  duration?: number; // in seconds
  puffs?: number;
  temperature?: number;
  temperatureUnit?: 'C' | 'F';
  totalDosage?: number;
  dosageUnit?: 'mg' | 'ml' | 'puffs';
  strain?: string;
  productId?: string;
  effects?: string[];
  mood?: number;
}

export interface DeviceSyncResult {
  success: boolean;
  readings: (SmartScaleReading | ConsumptionTrackerReading)[];
  syncedAt: string;
  newReadingsCount: number;
  errors?: string[];
}

// ============================================
// Digital Wallet Types
// ============================================

export type WalletProvider = 'apple_wallet' | 'google_wallet';

export interface DigitalPass {
  id: string;
  type: 'loyalty_card' | 'membership' | 'coupon' | 'event_ticket' | 'gift_card';
  provider: WalletProvider;
  name: string;
  description?: string;
  barcode?: {
    type: 'qr' | 'pdf417' | 'code128';
    value: string;
  };
  balance?: number;
  points?: number;
  tier?: string;
  expiresAt?: string;
  isInstalled: boolean;
  passUrl?: string; // URL to add to wallet
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyCard extends DigitalPass {
  type: 'loyalty_card';
  storeId?: string;
  storeName?: string;
  memberId: string;
  points: number;
  tier: string;
  tierProgress?: number;
  nextTierPoints?: number;
  rewards?: Array<{
    id: string;
    name: string;
    pointsCost: number;
    expiresAt?: string;
  }>;
}

// ============================================
// Device Connection Hooks
// ============================================

/**
 * Hook to manage paired hardware devices
 */
export function usePairedDevices() {
  return useQuery<HardwareDevice[], Error>({
    queryKey: ['hardware', 'devices'],
    queryFn: async () => {
      const res = await clientGet<{ devices: HardwareDevice[] }>(
        phase4Client,
        '/hardware/devices'
      );
      return res.devices;
    },
  });
}

/**
 * Hook to scan for available devices
 */
export function useScanDevices() {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<HardwareDevice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startScan = useCallback(async (deviceTypes?: DeviceType[]) => {
    setIsScanning(true);
    setError(null);
    setDiscoveredDevices([]);

    try {
      // In production, this would use react-native-ble-plx or expo-bluetooth
      // For now, simulate device discovery
      logEvent('hardware_scan_started', { deviceTypes });

      // Simulated delay for scanning
      await new Promise((resolve) => {
        scanTimeoutRef.current = setTimeout(resolve, 3000);
      });

      // In real implementation, discovered devices would be streamed
      // via BLE scanning callbacks
      const res = await clientGet<{ devices: HardwareDevice[] }>(
        phase4Client,
        '/hardware/discover',
        { params: { types: deviceTypes?.join(',') } }
      );

      setDiscoveredDevices(res.devices);
      logEvent('hardware_scan_complete', { count: res.devices.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scan failed';
      setError(message);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const stopScan = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    setIsScanning(false);
    logEvent('hardware_scan_stopped', {});
  }, []);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  return {
    isScanning,
    discoveredDevices,
    error,
    startScan,
    stopScan,
  };
}

/**
 * Hook to pair/connect a device
 */
export function usePairDevice() {
  const queryClient = useQueryClient();

  return useMutation<HardwareDevice, Error, {
    deviceId: string;
    name?: string;
  }>({
    mutationFn: async (params: { deviceId: string; name?: string }) => {
      const result = await clientPost<typeof params, HardwareDevice>(
        phase4Client,
        '/hardware/devices/pair',
        params
      );
      logEvent('hardware_device_paired', {
        deviceId: params.deviceId,
        type: result.type,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware', 'devices'] });
    },
  });
}

/**
 * Hook to unpair/remove a device
 */
export function useUnpairDevice() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (deviceId: string) => {
      await clientDelete(phase4Client, `/hardware/devices/${deviceId}`);
      logEvent('hardware_device_unpaired', { deviceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware', 'devices'] });
    },
  });
}

/**
 * Hook to manage device connection state
 */
export function useDeviceConnection(deviceId: string) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setStatus('connecting');
    setError(null);

    try {
      await clientPost<Record<string, never>, void>(
        phase4Client,
        `/hardware/devices/${deviceId}/connect`,
        {}
      );
      setStatus('connected');
      logEvent('hardware_device_connected', { deviceId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      setStatus('error');
    }
  }, [deviceId]);

  const disconnect = useCallback(async () => {
    try {
      await clientPost<Record<string, never>, void>(
        phase4Client,
        `/hardware/devices/${deviceId}/disconnect`,
        {}
      );
      setStatus('disconnected');
      logEvent('hardware_device_disconnected', { deviceId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Disconnect failed';
      setError(message);
    }
  }, [deviceId]);

  return {
    status,
    error,
    connect,
    disconnect,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
  };
}

// ============================================
// Smart Scale Hooks
// ============================================

/**
 * Hook to get readings from a smart scale
 */
export function useScaleReadings(deviceId: string, options?: {
  limit?: number;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<SmartScaleReading[], Error>({
    queryKey: ['hardware', 'scale', deviceId, 'readings', options],
    queryFn: async () => {
      const res = await clientGet<{ readings: SmartScaleReading[] }>(
        phase4Client,
        `/hardware/scales/${deviceId}/readings`,
        { params: options }
      );
      return res.readings;
    },
    enabled: !!deviceId,
  });
}

/**
 * Hook to sync smart scale data to journal
 */
export function useSyncScaleToJournal() {
  const queryClient = useQueryClient();

  return useMutation<DeviceSyncResult, Error, {
    deviceId: string;
    readingIds?: string[];
    autoTagProduct?: boolean;
  }>({
    mutationFn: async (params: { deviceId: string; readingIds?: string[]; autoTagProduct?: boolean }) => {
      const result = await clientPost<typeof params, DeviceSyncResult>(
        phase4Client,
        `/hardware/scales/${params.deviceId}/sync-to-journal`,
        params
      );
      logEvent('scale_synced_to_journal', {
        deviceId: params.deviceId,
        readingsCount: result.newReadingsCount,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      queryClient.invalidateQueries({ queryKey: ['hardware', 'scale'] });
    },
  });
}

/**
 * Hook to tare/zero a smart scale
 */
export function useTareScale() {
  return useMutation<void, Error, string>({
    mutationFn: async (deviceId: string) => {
      await clientPost<Record<string, never>, void>(
        phase4Client,
        `/hardware/scales/${deviceId}/tare`,
        {}
      );
      logEvent('scale_tared', { deviceId });
    },
  });
}

// ============================================
// Consumption Tracker Hooks
// ============================================

/**
 * Hook to get readings from a consumption tracker
 */
export function useTrackerReadings(deviceId: string, options?: {
  limit?: number;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<ConsumptionTrackerReading[], Error>({
    queryKey: ['hardware', 'tracker', deviceId, 'readings', options],
    queryFn: async () => {
      const res = await clientGet<{ readings: ConsumptionTrackerReading[] }>(
        phase4Client,
        `/hardware/trackers/${deviceId}/readings`,
        { params: options }
      );
      return res.readings;
    },
    enabled: !!deviceId,
  });
}

/**
 * Hook to sync consumption tracker data to journal
 */
export function useSyncTrackerToJournal() {
  const queryClient = useQueryClient();

  return useMutation<DeviceSyncResult, Error, {
    deviceId: string;
    sessionIds?: string[];
    includeMoodData?: boolean;
  }>({
    mutationFn: async (params: { deviceId: string; sessionIds?: string[]; includeMoodData?: boolean }) => {
      const result = await clientPost<typeof params, DeviceSyncResult>(
        phase4Client,
        `/hardware/trackers/${params.deviceId}/sync-to-journal`,
        params
      );
      logEvent('tracker_synced_to_journal', {
        deviceId: params.deviceId,
        sessionsCount: result.newReadingsCount,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      queryClient.invalidateQueries({ queryKey: ['hardware', 'tracker'] });
    },
  });
}

/**
 * Hook to start a tracked consumption session
 */
export function useStartTrackedSession() {
  return useMutation<ConsumptionTrackerReading, Error, {
    deviceId: string;
    productId?: string;
    strain?: string;
  }>({
    mutationFn: async (params: { deviceId: string; productId?: string; strain?: string }) => {
      const result = await clientPost<typeof params, ConsumptionTrackerReading>(
        phase4Client,
        `/hardware/trackers/${params.deviceId}/sessions/start`,
        params
      );
      logEvent('tracked_session_started', { deviceId: params.deviceId });
      return result;
    },
  });
}

/**
 * Hook to end a tracked consumption session
 */
export function useEndTrackedSession() {
  const queryClient = useQueryClient();

  return useMutation<ConsumptionTrackerReading, Error, {
    deviceId: string;
    sessionId: string;
    effects?: string[];
    mood?: number;
    notes?: string;
  }>({
    mutationFn: async (params: { deviceId: string; sessionId: string; effects?: string[]; mood?: number; notes?: string }) => {
      const result = await clientPost<typeof params, ConsumptionTrackerReading>(
        phase4Client,
        `/hardware/trackers/${params.deviceId}/sessions/${params.sessionId}/end`,
        params
      );
      logEvent('tracked_session_ended', {
        deviceId: params.deviceId,
        duration: result.duration,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware', 'tracker'] });
    },
  });
}

// ============================================
// Digital Wallet Hooks
// ============================================

/**
 * Hook to fetch digital passes
 */
export function useDigitalPasses() {
  return useQuery<DigitalPass[], Error>({
    queryKey: ['wallet', 'passes'],
    queryFn: async () => {
      const res = await clientGet<{ passes: DigitalPass[] }>(
        phase4Client,
        '/wallet/passes'
      );
      return res.passes;
    },
  });
}

/**
 * Hook to get loyalty card for wallet
 */
export function useLoyaltyCard() {
  return useQuery<LoyaltyCard | null, Error>({
    queryKey: ['wallet', 'loyalty-card'],
    queryFn: async () => {
      try {
        return await clientGet<LoyaltyCard>(
          phase4Client,
          '/wallet/loyalty-card'
        );
      } catch {
        return null;
      }
    },
  });
}

/**
 * Hook to add a pass to Apple/Google Wallet
 */
export function useAddToWallet() {
  const queryClient = useQueryClient();

  return useMutation<{ passUrl: string; success: boolean }, Error, {
    passId: string;
    provider: WalletProvider;
  }>({
    mutationFn: async (params: { passId: string; provider: WalletProvider }) => {
      const result = await clientPost<typeof params, { passUrl: string; success: boolean }>(
        phase4Client,
        '/wallet/passes/add-to-wallet',
        params
      );
      logEvent('pass_added_to_wallet', {
        passId: params.passId,
        provider: params.provider,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'passes'] });
    },
  });
}

/**
 * Hook to generate a new loyalty card pass
 */
export function useGenerateLoyaltyPass() {
  const queryClient = useQueryClient();

  return useMutation<LoyaltyCard, Error, {
    provider: WalletProvider;
    storeId?: string;
  }>({
    mutationFn: async (params: { provider: WalletProvider; storeId?: string }) => {
      const result = await clientPost<typeof params, LoyaltyCard>(
        phase4Client,
        '/wallet/loyalty-card/generate',
        params
      );
      logEvent('loyalty_pass_generated', { provider: params.provider });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

/**
 * Hook to check if wallet is supported on device
 */
export function useWalletSupport() {
  const [appleWalletSupported, setAppleWalletSupported] = useState(false);
  const [googleWalletSupported, setGoogleWalletSupported] = useState(false);

  useEffect(() => {
    // In React Native, use PassKit (iOS) or Google Wallet API (Android)
    // For now, detect based on platform
    const checkSupport = async () => {
      // Platform detection would go here
      // For demo, assume both are potentially available
      setAppleWalletSupported(true);
      setGoogleWalletSupported(true);
    };

    checkSupport();
  }, []);

  return {
    appleWalletSupported,
    googleWalletSupported,
    isAnySupported: appleWalletSupported || googleWalletSupported,
  };
}

// ============================================
// Automatic Sync Hook
// ============================================

/**
 * Hook to automatically sync all connected devices
 */
export function useAutoSync(options?: {
  intervalMinutes?: number;
  syncOnConnect?: boolean;
}) {
  const queryClient = useQueryClient();
  const { data: devices } = usePairedDevices();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncAllDevices = useCallback(async () => {
    if (!devices?.length || isSyncing) return;

    setIsSyncing(true);
    logEvent('auto_sync_started', {});

    try {
      const connectedDevices = devices.filter(
        (d: HardwareDevice) => d.connectionStatus === 'connected'
      );

      for (const device of connectedDevices) {
        try {
          await clientPost<{ deviceId: string }, DeviceSyncResult>(
            phase4Client,
            '/hardware/sync',
            { deviceId: device.id }
          );
        } catch (err) {
          console.error(`Failed to sync device ${device.id}:`, err);
        }
      }

      setLastSyncTime(new Date());
      queryClient.invalidateQueries({ queryKey: ['journal'] });
      queryClient.invalidateQueries({ queryKey: ['hardware'] });
      logEvent('auto_sync_complete', { deviceCount: connectedDevices.length });
    } finally {
      setIsSyncing(false);
    }
  }, [devices, isSyncing, queryClient]);

  // Set up automatic sync interval
  useEffect(() => {
    const interval = (options?.intervalMinutes || 15) * 60 * 1000;
    const timer = setInterval(syncAllDevices, interval);

    return () => clearInterval(timer);
  }, [syncAllDevices, options?.intervalMinutes]);

  return {
    syncAllDevices,
    lastSyncTime,
    isSyncing,
  };
}
