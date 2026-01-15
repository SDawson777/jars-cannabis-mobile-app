// src/hooks/useSmartHome.ts
// Smart home and voice assistant integrations (Alexa, Google Home)

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost, clientDelete } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

export type SmartHomeProvider = 'alexa' | 'google_home' | 'apple_home' | 'smartthings';

export type ConnectionState = 'not_linked' | 'linking' | 'linked' | 'error';

export interface SmartHomeConnection {
  provider: SmartHomeProvider;
  state: ConnectionState;
  linkedAt?: string;
  accountEmail?: string;
  deviceCount?: number;
  lastSyncedAt?: string;
  permissions: SmartHomePermission[];
  error?: string;
}

export type SmartHomePermission = 
  | 'order_reminders'
  | 'consumption_timers'
  | 'strain_suggestions'
  | 'inventory_alerts'
  | 'order_status'
  | 'store_hours'
  | 'product_search'
  | 'loyalty_balance';

export interface SmartHomeSkill {
  id: string;
  provider: SmartHomeProvider;
  name: string;
  description: string;
  isEnabled: boolean;
  invocationName?: string; // e.g., "Nimbus Cannabis"
  capabilities: SmartHomeCapability[];
  setupUrl?: string;
}

export interface SmartHomeCapability {
  id: string;
  name: string;
  description: string;
  examplePhrases: string[];
  isEnabled: boolean;
  requiresAuth: boolean;
}

export interface SmartHomeRoutine {
  id: string;
  provider: SmartHomeProvider;
  name: string;
  description?: string;
  trigger: RoutineTrigger;
  actions: RoutineAction[];
  isEnabled: boolean;
  lastTriggered?: string;
  createdAt: string;
}

export interface RoutineTrigger {
  type: 'time' | 'voice' | 'location' | 'device' | 'sunrise' | 'sunset';
  config: {
    time?: string; // HH:MM format
    phrase?: string; // Voice trigger phrase
    location?: { lat: number; lng: number; radius: number };
    deviceId?: string;
    offset?: number; // Minutes before/after sunrise/sunset
  };
  days?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
}

export interface RoutineAction {
  type: 'reminder' | 'timer' | 'suggestion' | 'announcement' | 'notification';
  config: {
    message?: string;
    duration?: number; // Timer duration in minutes
    suggestionType?: 'strain' | 'product' | 'deal';
    includeProduct?: boolean;
    deviceIds?: string[]; // Which smart devices to use
  };
  delayMinutes?: number;
}

export interface SmartDevice {
  id: string;
  provider: SmartHomeProvider;
  name: string;
  type: 'speaker' | 'display' | 'hub' | 'other';
  room?: string;
  isOnline: boolean;
  capabilities: string[];
}

export interface OrderReminder {
  id: string;
  orderId: string;
  type: 'pickup_ready' | 'delivery_arriving' | 'order_placed' | 'custom';
  message: string;
  scheduledFor: string;
  deliverTo: SmartHomeProvider[];
  deviceIds?: string[];
  isDelivered: boolean;
  deliveredAt?: string;
}

export interface ConsumptionTimer {
  id: string;
  name: string;
  duration: number; // in minutes
  productId?: string;
  productName?: string;
  dosage?: string;
  alertType: 'voice' | 'notification' | 'both';
  repeatDaily?: boolean;
  scheduledTime?: string;
  isActive: boolean;
  lastTriggered?: string;
}

// ============================================
// Connection Hooks
// ============================================

/**
 * Hook to fetch all smart home connections
 */
export function useSmartHomeConnections() {
  return useQuery<SmartHomeConnection[], Error>({
    queryKey: ['smarthome', 'connections'],
    queryFn: async () => {
      const res = await clientGet<{ connections: SmartHomeConnection[] }>(
        phase4Client,
        '/smarthome/connections'
      );
      return res.connections;
    },
  });
}

/**
 * Hook to check connection status for a specific provider
 */
export function useSmartHomeConnection(provider: SmartHomeProvider) {
  return useQuery<SmartHomeConnection, Error>({
    queryKey: ['smarthome', 'connections', provider],
    queryFn: async () => {
      return await clientGet<SmartHomeConnection>(
        phase4Client,
        `/smarthome/connections/${provider}`
      );
    },
    enabled: !!provider,
  });
}

/**
 * Hook to link a smart home provider
 */
export function useLinkSmartHome() {
  const queryClient = useQueryClient();

  return useMutation<{ authUrl: string; state: string }, Error, {
    provider: SmartHomeProvider;
    permissions: SmartHomePermission[];
    redirectUri?: string;
  }>({
    mutationFn: async (params: { provider: SmartHomeProvider; permissions: SmartHomePermission[]; redirectUri?: string }) => {
      const result = await clientPost<typeof params, { authUrl: string; state: string }>(
        phase4Client,
        '/smarthome/link',
        params
      );
      logEvent('smarthome_link_initiated', { provider: params.provider });
      return result;
    },
    onSuccess: (_: { authUrl: string; state: string }, variables: { provider: SmartHomeProvider; permissions: SmartHomePermission[]; redirectUri?: string }) => {
      queryClient.invalidateQueries({
        queryKey: ['smarthome', 'connections', variables.provider],
      });
    },
  });
}

/**
 * Hook to complete OAuth linking
 */
export function useCompleteLinking() {
  const queryClient = useQueryClient();

  return useMutation<SmartHomeConnection, Error, {
    provider: SmartHomeProvider;
    code: string;
    state: string;
  }>({
    mutationFn: async (params: { provider: SmartHomeProvider; code: string; state: string }) => {
      const result = await clientPost<typeof params, SmartHomeConnection>(
        phase4Client,
        '/smarthome/link/complete',
        params
      );
      logEvent('smarthome_linked', { provider: params.provider });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smarthome', 'connections'] });
    },
  });
}

/**
 * Hook to unlink a smart home provider
 */
export function useUnlinkSmartHome() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SmartHomeProvider>({
    mutationFn: async (provider: SmartHomeProvider) => {
      await clientDelete(phase4Client, `/smarthome/connections/${provider}`);
      logEvent('smarthome_unlinked', { provider });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smarthome'] });
    },
  });
}

// ============================================
// Skills & Capabilities Hooks
// ============================================

/**
 * Hook to fetch available skills
 */
export function useSmartHomeSkills() {
  return useQuery<SmartHomeSkill[], Error>({
    queryKey: ['smarthome', 'skills'],
    queryFn: async () => {
      const res = await clientGet<{ skills: SmartHomeSkill[] }>(
        phase4Client,
        '/smarthome/skills'
      );
      return res.skills;
    },
  });
}

/**
 * Hook to enable/disable a skill capability
 */
export function useToggleCapability() {
  const queryClient = useQueryClient();

  return useMutation<SmartHomeCapability, Error, {
    skillId: string;
    capabilityId: string;
    enabled: boolean;
  }>({
    mutationFn: async (params: { skillId: string; capabilityId: string; enabled: boolean }) => {
      return await clientPost<{ enabled: boolean }, SmartHomeCapability>(
        phase4Client,
        `/smarthome/skills/${params.skillId}/capabilities/${params.capabilityId}`,
        { enabled: params.enabled }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smarthome', 'skills'] });
    },
  });
}

// ============================================
// Device Hooks
// ============================================

/**
 * Hook to fetch linked smart devices
 */
export function useSmartDevices(provider?: SmartHomeProvider) {
  return useQuery<SmartDevice[], Error>({
    queryKey: ['smarthome', 'devices', provider],
    queryFn: async () => {
      const res = await clientGet<{ devices: SmartDevice[] }>(
        phase4Client,
        '/smarthome/devices',
        { params: provider ? { provider } : undefined }
      );
      return res.devices;
    },
  });
}

/**
 * Hook to sync devices from provider
 */
export function useSyncDevices() {
  const queryClient = useQueryClient();

  return useMutation<SmartDevice[], Error, SmartHomeProvider>({
    mutationFn: async (provider: SmartHomeProvider) => {
      const res = await clientPost<{ provider: SmartHomeProvider }, { devices: SmartDevice[] }>(
        phase4Client,
        '/smarthome/devices/sync',
        { provider }
      );
      logEvent('smarthome_devices_synced', {
        provider,
        count: res.devices.length,
      });
      return res.devices;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smarthome', 'devices'] });
    },
  });
}

// ============================================
// Routine Hooks
// ============================================

/**
 * Hook to fetch routines
 */
export function useSmartHomeRoutines() {
  return useQuery<SmartHomeRoutine[], Error>({
    queryKey: ['smarthome', 'routines'],
    queryFn: async () => {
      const res = await clientGet<{ routines: SmartHomeRoutine[] }>(
        phase4Client,
        '/smarthome/routines'
      );
      return res.routines;
    },
  });
}

/**
 * Hook to create a routine
 */
export function useCreateRoutine() {
  const queryClient = useQueryClient();

  return useMutation<SmartHomeRoutine, Error, Omit<SmartHomeRoutine, 'id' | 'createdAt' | 'lastTriggered'>>({
    mutationFn: async (routine: Omit<SmartHomeRoutine, 'id' | 'createdAt' | 'lastTriggered'>) => {
      const result = await clientPost<typeof routine, SmartHomeRoutine>(
        phase4Client,
        '/smarthome/routines',
        routine
      );
      logEvent('smarthome_routine_created', {
        provider: routine.provider,
        triggerType: routine.trigger.type,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smarthome', 'routines'] });
    },
  });
}

/**
 * Hook to toggle routine enabled state
 */
export function useToggleRoutine() {
  const queryClient = useQueryClient();

  return useMutation<SmartHomeRoutine, Error, { routineId: string; enabled: boolean }>({
    mutationFn: async (params: { routineId: string; enabled: boolean }) => {
      return await clientPost<{ enabled: boolean }, SmartHomeRoutine>(
        phase4Client,
        `/smarthome/routines/${params.routineId}/toggle`,
        { enabled: params.enabled }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smarthome', 'routines'] });
    },
  });
}

/**
 * Hook to delete a routine
 */
export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (routineId: string) => {
      await clientDelete(phase4Client, `/smarthome/routines/${routineId}`);
      logEvent('smarthome_routine_deleted', { routineId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smarthome', 'routines'] });
    },
  });
}

// ============================================
// Order Reminder Hooks
// ============================================

/**
 * Hook to fetch order reminders
 */
export function useOrderReminders() {
  return useQuery<OrderReminder[], Error>({
    queryKey: ['smarthome', 'reminders', 'orders'],
    queryFn: async () => {
      const res = await clientGet<{ reminders: OrderReminder[] }>(
        phase4Client,
        '/smarthome/reminders/orders'
      );
      return res.reminders;
    },
  });
}

/**
 * Hook to create an order reminder
 */
export function useCreateOrderReminder() {
  const queryClient = useQueryClient();

  return useMutation<OrderReminder, Error, {
    orderId: string;
    type: OrderReminder['type'];
    message: string;
    scheduledFor: string;
    deliverTo: SmartHomeProvider[];
    deviceIds?: string[];
  }>({
    mutationFn: async (params: { orderId: string; type: OrderReminder['type']; message: string; scheduledFor: string; deliverTo: SmartHomeProvider[]; deviceIds?: string[] }) => {
      const result = await clientPost<typeof params, OrderReminder>(
        phase4Client,
        '/smarthome/reminders/orders',
        params
      );
      logEvent('order_reminder_created', {
        orderId: params.orderId,
        type: params.type,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smarthome', 'reminders'] });
    },
  });
}

// ============================================
// Consumption Timer Hooks
// ============================================

/**
 * Hook to fetch consumption timers
 */
export function useConsumptionTimers() {
  return useQuery<ConsumptionTimer[], Error>({
    queryKey: ['smarthome', 'timers', 'consumption'],
    queryFn: async () => {
      const res = await clientGet<{ timers: ConsumptionTimer[] }>(
        phase4Client,
        '/smarthome/timers/consumption'
      );
      return res.timers;
    },
  });
}

/**
 * Hook to create a consumption timer
 */
export function useCreateConsumptionTimer() {
  const queryClient = useQueryClient();

  return useMutation<ConsumptionTimer, Error, Omit<ConsumptionTimer, 'id' | 'isActive' | 'lastTriggered'>>({
    mutationFn: async (timer: Omit<ConsumptionTimer, 'id' | 'isActive' | 'lastTriggered'>) => {
      const result = await clientPost<typeof timer, ConsumptionTimer>(
        phase4Client,
        '/smarthome/timers/consumption',
        timer
      );
      logEvent('consumption_timer_created', {
        duration: timer.duration,
        productId: timer.productId,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smarthome', 'timers'] });
    },
  });
}

/**
 * Hook to start/stop a consumption timer
 */
export function useToggleConsumptionTimer() {
  const queryClient = useQueryClient();

  return useMutation<ConsumptionTimer, Error, { timerId: string; active: boolean }>({
    mutationFn: async (params: { timerId: string; active: boolean }) => {
      return await clientPost<{ active: boolean }, ConsumptionTimer>(
        phase4Client,
        `/smarthome/timers/consumption/${params.timerId}/toggle`,
        { active: params.active }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smarthome', 'timers'] });
    },
  });
}

// ============================================
// Quick Actions Hooks
// ============================================

/**
 * Hook to send a strain suggestion via smart assistant
 */
export function useSendStrainSuggestion() {
  return useMutation<void, Error, {
    strainId?: string;
    productId?: string;
    message: string;
    deviceIds: string[];
  }>({
    mutationFn: async (params: { strainId?: string; productId?: string; message: string; deviceIds: string[] }) => {
      await clientPost<typeof params, void>(
        phase4Client,
        '/smarthome/actions/strain-suggestion',
        params
      );
      logEvent('strain_suggestion_sent', {
        strainId: params.strainId,
        productId: params.productId,
      });
    },
  });
}

/**
 * Hook to announce order status via smart assistant
 */
export function useAnnounceOrderStatus() {
  return useMutation<void, Error, {
    orderId: string;
    deviceIds?: string[];
  }>({
    mutationFn: async (params: { orderId: string; deviceIds?: string[] }) => {
      await clientPost<typeof params, void>(
        phase4Client,
        '/smarthome/actions/announce-order',
        params
      );
      logEvent('order_status_announced', { orderId: params.orderId });
    },
  });
}

// ============================================
// Prebuilt Routine Templates
// ============================================

/**
 * Hook to get prebuilt routine templates
 */
export function useRoutineTemplates() {
  const templates: Omit<SmartHomeRoutine, 'id' | 'createdAt' | 'lastTriggered'>[] = [
    {
      provider: 'alexa',
      name: 'Evening Wind Down',
      description: 'Get a relaxing strain suggestion at 8 PM',
      trigger: {
        type: 'time',
        config: { time: '20:00' },
        days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      },
      actions: [
        {
          type: 'suggestion',
          config: {
            message: "Time to wind down! Here's a relaxing strain for tonight.",
            suggestionType: 'strain',
            includeProduct: true,
          },
        },
      ],
      isEnabled: false,
    },
    {
      provider: 'google_home',
      name: 'Consumption Reminder',
      description: 'Set a 30-minute check-in timer after consumption',
      trigger: {
        type: 'voice',
        config: { phrase: 'I just consumed' },
      },
      actions: [
        {
          type: 'timer',
          config: {
            message: 'How are you feeling? Time to log your experience.',
            duration: 30,
          },
          delayMinutes: 30,
        },
      ],
      isEnabled: false,
    },
    {
      provider: 'alexa',
      name: 'Weekend Deals Alert',
      description: 'Get notified about weekend deals Saturday morning',
      trigger: {
        type: 'time',
        config: { time: '10:00' },
        days: ['sat'],
      },
      actions: [
        {
          type: 'announcement',
          config: {
            message: "Good morning! Here are today's deals at your favorite dispensary.",
          },
        },
      ],
      isEnabled: false,
    },
  ];

  return { templates };
}
