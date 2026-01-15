// src/hooks/useAppointments.ts
// Appointment and event booking - calendar integration, budtender consultations, workshops

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost, clientPatch, clientDelete } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

export interface Appointment {
  id: string;
  userId: string;
  type: AppointmentType;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  title: string;
  description?: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  budtenderId?: string;
  budtenderName?: string;
  budtenderAvatar?: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  timezone: string;
  isVirtual: boolean;
  meetingUrl?: string;
  notes?: string;
  reminderSent: boolean;
  calendarEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentType = 
  | 'consultation'
  | 'pickup'
  | 'workshop'
  | 'private_tasting'
  | 'new_patient'
  | 'follow_up';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  budtenderId?: string;
  budtenderName?: string;
}

export interface Budtender {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  specialties: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
}

export interface StoreEvent {
  id: string;
  storeId: string;
  storeName: string;
  title: string;
  description: string;
  image?: string;
  type: 'workshop' | 'tasting' | 'class' | 'sale' | 'community';
  startTime: string;
  endTime: string;
  timezone: string;
  isVirtual: boolean;
  location?: string;
  meetingUrl?: string;
  capacity: number;
  registeredCount: number;
  isRegistered: boolean;
  price?: number;
  isFree: boolean;
  requirements?: string[];
  tags: string[];
}

export interface CalendarIntegration {
  provider: 'google' | 'apple' | 'outlook';
  connected: boolean;
  email?: string;
  syncEnabled: boolean;
  lastSyncAt?: string;
}

// ============================================
// Appointment Hooks
// ============================================

/**
 * Hook to fetch user's appointments
 */
export function useAppointments(options?: {
  status?: Appointment['status'][];
  upcoming?: boolean;
  past?: boolean;
}) {
  return useInfiniteQuery<{ appointments: Appointment[]; nextCursor?: string }, Error>({
    queryKey: ['appointments', 'list', options],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ appointments: Appointment[]; nextCursor?: string }>(
        phase4Client,
        '/appointments',
        { params: { ...options, cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { appointments: Appointment[]; nextCursor?: string }) => lastPage.nextCursor,
  });
}

/**
 * Hook to fetch upcoming appointments
 */
export function useUpcomingAppointments() {
  return useQuery<Appointment[], Error>({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      const res = await clientGet<{ appointments: Appointment[] }>(
        phase4Client,
        '/appointments/upcoming'
      );
      return res.appointments;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a single appointment
 */
export function useAppointment(appointmentId: string) {
  return useQuery<Appointment, Error>({
    queryKey: ['appointments', 'detail', appointmentId],
    queryFn: async () => {
      return await clientGet<Appointment>(
        phase4Client,
        `/appointments/${appointmentId}`
      );
    },
    enabled: !!appointmentId,
  });
}

/**
 * Hook to fetch available time slots
 */
export function useAvailableSlots(options: {
  storeId: string;
  date: string; // YYYY-MM-DD
  appointmentType: AppointmentType;
  budtenderId?: string;
}) {
  return useQuery<TimeSlot[], Error>({
    queryKey: ['appointments', 'slots', options],
    queryFn: async () => {
      const res = await clientGet<{ slots: TimeSlot[] }>(
        phase4Client,
        '/appointments/slots',
        { params: options }
      );
      return res.slots;
    },
    enabled: !!options.storeId && !!options.date && !!options.appointmentType,
  });
}

/**
 * Hook to book an appointment
 */
export function useBookAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation<Appointment, Error, {
    storeId: string;
    type: AppointmentType;
    startTime: string;
    budtenderId?: string;
    notes?: string;
    isVirtual?: boolean;
    addToCalendar?: boolean;
  }>({
    mutationFn: async (booking: {
      storeId: string;
      type: AppointmentType;
      startTime: string;
      budtenderId?: string;
      notes?: string;
      isVirtual?: boolean;
      addToCalendar?: boolean;
    }) => {
      const result = await clientPost<typeof booking, Appointment>(
        phase4Client,
        '/appointments',
        booking
      );
      logEvent('appointment_booked', {
        type: booking.type,
        isVirtual: booking.isVirtual,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Hook to reschedule an appointment
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation<Appointment, Error, {
    appointmentId: string;
    newStartTime: string;
    reason?: string;
  }>({
    mutationFn: async ({ appointmentId, newStartTime, reason }: {
      appointmentId: string;
      newStartTime: string;
      reason?: string;
    }) => {
      const result = await clientPatch<{ newStartTime: string; reason?: string }, Appointment>(
        phase4Client,
        `/appointments/${appointmentId}/reschedule`,
        { newStartTime, reason }
      );
      logEvent('appointment_rescheduled', { appointmentId });
      return result;
    },
    onSuccess: (_: Appointment, { appointmentId }: { appointmentId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'detail', appointmentId] });
    },
  });
}

/**
 * Hook to cancel an appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { appointmentId: string; reason?: string }>({
    mutationFn: async ({ appointmentId, reason }: { appointmentId: string; reason?: string }) => {
      await clientPost<{ reason?: string }, void>(
        phase4Client,
        `/appointments/${appointmentId}/cancel`,
        { reason }
      );
      logEvent('appointment_cancelled', { appointmentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Hook to confirm an appointment
 */
export function useConfirmAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation<Appointment, Error, string>({
    mutationFn: async (appointmentId: string) => {
      const result = await clientPost<Record<string, never>, Appointment>(
        phase4Client,
        `/appointments/${appointmentId}/confirm`,
        {}
      );
      logEvent('appointment_confirmed', { appointmentId });
      return result;
    },
    onSuccess: (_: Appointment, appointmentId: string) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'detail', appointmentId] });
    },
  });
}

// ============================================
// Budtender Hooks
// ============================================

/**
 * Hook to fetch budtenders at a store
 */
export function useBudtenders(storeId: string) {
  return useQuery<Budtender[], Error>({
    queryKey: ['appointments', 'budtenders', storeId],
    queryFn: async () => {
      const res = await clientGet<{ budtenders: Budtender[] }>(
        phase4Client,
        `/stores/${storeId}/budtenders`
      );
      return res.budtenders;
    },
    enabled: !!storeId,
  });
}

/**
 * Hook to fetch budtender availability
 */
export function useBudtenderAvailability(budtenderId: string, date: string) {
  return useQuery<TimeSlot[], Error>({
    queryKey: ['appointments', 'budtender', budtenderId, 'availability', date],
    queryFn: async () => {
      const res = await clientGet<{ slots: TimeSlot[] }>(
        phase4Client,
        `/budtenders/${budtenderId}/availability`,
        { params: { date } }
      );
      return res.slots;
    },
    enabled: !!budtenderId && !!date,
  });
}

// ============================================
// Store Events Hooks
// ============================================

/**
 * Hook to fetch store events
 */
export function useStoreEvents(options?: {
  storeId?: string;
  type?: StoreEvent['type'];
  upcoming?: boolean;
  limit?: number;
}) {
  return useInfiniteQuery<{ events: StoreEvent[]; nextCursor?: string }, Error>({
    queryKey: ['events', 'list', options],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ events: StoreEvent[]; nextCursor?: string }>(
        phase4Client,
        '/events',
        { params: { ...options, cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { events: StoreEvent[]; nextCursor?: string }) => lastPage.nextCursor,
  });
}

/**
 * Hook to fetch a single event
 */
export function useStoreEvent(eventId: string) {
  return useQuery<StoreEvent, Error>({
    queryKey: ['events', 'detail', eventId],
    queryFn: async () => {
      return await clientGet<StoreEvent>(
        phase4Client,
        `/events/${eventId}`
      );
    },
    enabled: !!eventId,
  });
}

/**
 * Hook to register for an event
 */
export function useRegisterForEvent() {
  const queryClient = useQueryClient();
  
  return useMutation<{ registrationId: string }, Error, {
    eventId: string;
    attendees?: number;
    notes?: string;
    addToCalendar?: boolean;
  }>({
    mutationFn: async (registration: {
      eventId: string;
      attendees?: number;
      notes?: string;
      addToCalendar?: boolean;
    }) => {
      const result = await clientPost<typeof registration, { registrationId: string }>(
        phase4Client,
        `/events/${registration.eventId}/register`,
        registration
      );
      logEvent('event_registered', { eventId: registration.eventId });
      return result;
    },
    onSuccess: (_: { registrationId: string }, { eventId }: { eventId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['events', 'detail', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', 'registered'] });
    },
  });
}

/**
 * Hook to cancel event registration
 */
export function useCancelEventRegistration() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (eventId: string) => {
      await clientDelete(phase4Client, `/events/${eventId}/register`);
      logEvent('event_registration_cancelled', { eventId });
    },
    onSuccess: (_: void, eventId: string) => {
      queryClient.invalidateQueries({ queryKey: ['events', 'detail', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', 'registered'] });
    },
  });
}

/**
 * Hook to fetch user's registered events
 */
export function useRegisteredEvents() {
  return useQuery<StoreEvent[], Error>({
    queryKey: ['events', 'registered'],
    queryFn: async () => {
      const res = await clientGet<{ events: StoreEvent[] }>(
        phase4Client,
        '/events/registered'
      );
      return res.events;
    },
  });
}

// ============================================
// Calendar Integration Hooks
// ============================================

/**
 * Hook to fetch calendar integrations
 */
export function useCalendarIntegrations() {
  return useQuery<CalendarIntegration[], Error>({
    queryKey: ['calendar', 'integrations'],
    queryFn: async () => {
      const res = await clientGet<{ integrations: CalendarIntegration[] }>(
        phase4Client,
        '/calendar/integrations'
      );
      return res.integrations;
    },
  });
}

/**
 * Hook to connect a calendar
 */
export function useConnectCalendar() {
  const queryClient = useQueryClient();
  
  return useMutation<{ authUrl: string }, Error, {
    provider: CalendarIntegration['provider'];
  }>({
    mutationFn: async ({ provider }: { provider: CalendarIntegration['provider'] }) => {
      const result = await clientPost<{ provider: CalendarIntegration['provider'] }, { authUrl: string }>(
        phase4Client,
        '/calendar/connect',
        { provider }
      );
      logEvent('calendar_connect_started', { provider });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'integrations'] });
    },
  });
}

/**
 * Hook to disconnect a calendar
 */
export function useDisconnectCalendar() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, CalendarIntegration['provider']>({
    mutationFn: async (provider: CalendarIntegration['provider']) => {
      await clientDelete(phase4Client, `/calendar/integrations/${provider}`);
      logEvent('calendar_disconnected', { provider });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'integrations'] });
    },
  });
}

/**
 * Hook to sync calendar
 */
export function useSyncCalendar() {
  const queryClient = useQueryClient();
  
  return useMutation<{ synced: number }, Error, CalendarIntegration['provider']>({
    mutationFn: async (provider: CalendarIntegration['provider']) => {
      const result = await clientPost<Record<string, never>, { synced: number }>(
        phase4Client,
        `/calendar/integrations/${provider}/sync`,
        {}
      );
      logEvent('calendar_synced', { provider, synced: result.synced });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'integrations'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Hook to add appointment to device calendar
 */
export function useAddToDeviceCalendar() {
  return useMutation<{ success: boolean }, Error, Appointment>({
    mutationFn: async (appointment: Appointment) => {
      // This would integrate with device calendar APIs
      // In React Native, use react-native-calendar-events or expo-calendar
      const result = await clientPost<{ appointmentId: string }, { success: boolean }>(
        phase4Client,
        '/calendar/add-to-device',
        { appointmentId: appointment.id }
      );
      logEvent('appointment_added_to_calendar', { appointmentId: appointment.id });
      return result;
    },
  });
}

// ============================================
// Reminder Hooks
// ============================================

/**
 * Hook to set appointment reminders
 */
export function useSetReminder() {
  return useMutation<void, Error, {
    appointmentId: string;
    reminderTimes: number[]; // minutes before
  }>({
    mutationFn: async ({ appointmentId, reminderTimes }: {
      appointmentId: string;
      reminderTimes: number[];
    }) => {
      await clientPost<{ reminderTimes: number[] }, void>(
        phase4Client,
        `/appointments/${appointmentId}/reminders`,
        { reminderTimes }
      );
      logEvent('reminder_set', { appointmentId, count: reminderTimes.length });
    },
  });
}
