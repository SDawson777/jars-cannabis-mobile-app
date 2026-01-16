// src/hooks/useJournal.ts
// Hooks for cannabis journal entries
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost, clientPut, clientDelete } from '../api/http';
import { logEvent } from '../utils/analytics';

export interface JournalEntry {
  id: string;
  userId: string;
  productId?: string;
  productName?: string;
  strainName?: string;
  consumptionMethod?: 'smoke' | 'vape' | 'edible' | 'tincture' | 'topical' | 'other';
  dosage?: string;
  rating?: number;
  effects?: string[];
  mood?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  images?: string[];
}

export interface CreateJournalEntryPayload {
  productId?: string;
  productName?: string;
  strainName?: string;
  consumptionMethod?: JournalEntry['consumptionMethod'];
  dosage?: string;
  rating?: number;
  effects?: string[];
  mood?: string;
  notes?: string;
  images?: string[];
}

export interface JournalEntriesResponse {
  entries: JournalEntry[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Hook to fetch paginated journal entries
 */
export function useJournalEntries(options?: { limit?: number }) {
  return useInfiniteQuery<JournalEntriesResponse, Error>({
    queryKey: ['journal', 'entries', options?.limit],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', String(options.limit));
      if (pageParam) params.append('cursor', pageParam as string);

      const url = `/journal/entries${params.toString() ? `?${params}` : ''}`;
      return clientGet<JournalEntriesResponse>(phase4Client, url);
    },
    getNextPageParam: (lastPage: JournalEntriesResponse) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single journal entry
 */
export function useJournalEntry(entryId: string) {
  return useQuery<JournalEntry, Error>({
    queryKey: ['journal', 'entry', entryId],
    queryFn: async () => {
      return clientGet<JournalEntry>(phase4Client, `/journal/entries/${entryId}`);
    },
    enabled: !!entryId,
  });
}

/**
 * Hook to create a new journal entry
 */
export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation<JournalEntry, Error, CreateJournalEntryPayload>({
    mutationFn: async (payload: CreateJournalEntryPayload) => {
      const result = await clientPost<CreateJournalEntryPayload, JournalEntry>(
        phase4Client,
        '/journal/entries',
        payload
      );
      logEvent('journal_entry_created', {
        hasProduct: !!payload.productId,
        method: payload.consumptionMethod,
        rating: payload.rating,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
}

/**
 * Hook to update a journal entry
 */
export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation<JournalEntry, Error, { id: string; data: Partial<CreateJournalEntryPayload> }>(
    {
      mutationFn: async ({
        id,
        data,
      }: {
        id: string;
        data: Partial<CreateJournalEntryPayload>;
      }) => {
        const result = await clientPut<Partial<CreateJournalEntryPayload>, JournalEntry>(
          phase4Client,
          `/journal/entries/${id}`,
          data
        );
        logEvent('journal_entry_updated', { entryId: id });
        return result;
      },
      onSuccess: (
        _data: JournalEntry,
        variables: { id: string; data: Partial<CreateJournalEntryPayload> }
      ) => {
        queryClient.invalidateQueries({ queryKey: ['journal'] });
        queryClient.invalidateQueries({ queryKey: ['journal', 'entry', variables.id] });
      },
    }
  );
}

/**
 * Hook to delete a journal entry
 */
export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (entryId: string) => {
      await clientDelete<void>(phase4Client, `/journal/entries/${entryId}`);
      logEvent('journal_entry_deleted', { entryId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
}

/**
 * Hook to fetch journal statistics
 */
export function useJournalStats() {
  return useQuery<
    {
      totalEntries: number;
      favoriteStrain?: string;
      preferredMethod?: string;
      averageRating?: number;
      recentMoods?: string[];
    },
    Error
  >({
    queryKey: ['journal', 'stats'],
    queryFn: async () => {
      return clientGet(phase4Client, '/journal/stats');
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================
// Enhanced Journal Types
// ============================================

export interface DetailedDosage {
  amount: number;
  unit: 'mg' | 'g' | 'ml' | 'puffs' | 'hits' | 'pieces';
  thcMg?: number;
  cbdMg?: number;
}

export interface MoodEntry {
  before: MoodLevel;
  after?: MoodLevel;
  tags: string[];
  notes?: string;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface EffectEntry {
  effect: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  onset: number; // minutes
  duration?: number; // minutes
  isPositive: boolean;
}

export interface JournalPrompt {
  id: string;
  category: 'mood' | 'effects' | 'reflection' | 'goal' | 'medical';
  question: string;
  helpText?: string;
  responseType: 'text' | 'scale' | 'multiselect' | 'boolean';
  options?: string[];
}

export interface JournalTag {
  id: string;
  name: string;
  color: string;
  category: 'mood' | 'effect' | 'activity' | 'symptom' | 'custom';
  usageCount: number;
}

export interface JournalChartData {
  period: 'day' | 'week' | 'month' | 'year';
  dataPoints: {
    date: string;
    value: number;
    label?: string;
  }[];
  average?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface JournalInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  data?: Record<string, unknown>;
  actionable?: {
    label: string;
    action: string;
  };
  createdAt: string;
}

export interface ConsumptionSummary {
  totalSessions: number;
  totalDosage: {
    thc: number;
    cbd: number;
  };
  averageMoodImprovement: number;
  topEffects: { effect: string; count: number }[];
  topStrains: { strain: string; count: number; avgRating: number }[];
  consumptionByMethod: { method: string; count: number }[];
  consumptionByTime: { hour: number; count: number }[];
  weeklyPattern: { day: string; count: number }[];
}

// ============================================
// Enhanced Entry Hooks
// ============================================

/**
 * Hook to create a detailed journal entry with dosage tracking
 */
export function useCreateDetailedEntry() {
  const queryClient = useQueryClient();

  return useMutation<
    JournalEntry,
    Error,
    {
      productId?: string;
      productName?: string;
      strainName?: string;
      consumptionMethod: JournalEntry['consumptionMethod'];
      detailedDosage: DetailedDosage;
      mood: MoodEntry;
      effects: EffectEntry[];
      tags: string[];
      notes?: string;
      images?: string[];
      promptResponses?: Record<string, string | number | boolean | string[]>;
      location?: { lat: number; lng: number; name?: string };
      activity?: string;
      sessionDuration?: number; // minutes
    }
  >({
    mutationFn: async (entry: {
      productId?: string;
      productName?: string;
      strainName?: string;
      consumptionMethod: JournalEntry['consumptionMethod'];
      detailedDosage: DetailedDosage;
      mood: MoodEntry;
      effects: EffectEntry[];
      tags: string[];
      notes?: string;
      images?: string[];
      promptResponses?: Record<string, string | number | boolean | string[]>;
      location?: { lat: number; lng: number; name?: string };
      activity?: string;
      sessionDuration?: number;
    }) => {
      const result = await clientPost<typeof entry, JournalEntry>(
        phase4Client,
        '/journal/entries/detailed',
        entry
      );
      logEvent('detailed_journal_entry_created', {
        method: entry.consumptionMethod,
        effectCount: entry.effects.length,
        hasMoodBefore: !!entry.mood.before,
        hasMoodAfter: !!entry.mood.after,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
}

/**
 * Hook to log mood check-in without consumption
 */
export function useLogMoodCheckIn() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string },
    Error,
    {
      mood: MoodLevel;
      tags: string[];
      notes?: string;
    }
  >({
    mutationFn: async (checkIn: { mood: MoodLevel; tags: string[]; notes?: string }) => {
      const result = await clientPost<typeof checkIn, { id: string }>(
        phase4Client,
        '/journal/mood-checkin',
        checkIn
      );
      logEvent('mood_checkin_logged', { mood: checkIn.mood });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', 'mood'] });
    },
  });
}

/**
 * Hook to update mood after consumption
 */
export function useUpdateMoodAfter() {
  const queryClient = useQueryClient();

  return useMutation<
    JournalEntry,
    Error,
    {
      entryId: string;
      moodAfter: MoodLevel;
      additionalEffects?: EffectEntry[];
      notes?: string;
    }
  >({
    mutationFn: async ({
      entryId,
      ...data
    }: {
      entryId: string;
      moodAfter: MoodLevel;
      additionalEffects?: EffectEntry[];
      notes?: string;
    }) => {
      const result = await clientPost<Omit<typeof data, never>, JournalEntry>(
        phase4Client,
        `/journal/entries/${entryId}/mood-after`,
        data
      );
      logEvent('mood_after_updated', { entryId, moodAfter: data.moodAfter });
      return result;
    },
    onSuccess: (
      _: JournalEntry,
      {
        entryId,
      }: {
        entryId: string;
        moodAfter: MoodLevel;
        additionalEffects?: EffectEntry[];
        notes?: string;
      }
    ) => {
      queryClient.invalidateQueries({ queryKey: ['journal', 'entry', entryId] });
      queryClient.invalidateQueries({ queryKey: ['journal', 'mood'] });
    },
  });
}

// ============================================
// Prompt & Tag Hooks
// ============================================

/**
 * Hook to fetch journal prompts
 */
export function useJournalPrompts(category?: JournalPrompt['category']) {
  return useQuery<JournalPrompt[], Error>({
    queryKey: ['journal', 'prompts', category],
    queryFn: async () => {
      const res = await clientGet<{ prompts: JournalPrompt[] }>(phase4Client, '/journal/prompts', {
        params: category ? { category } : undefined,
      });
      return res.prompts;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to fetch user's journal tags
 */
export function useJournalTags() {
  return useQuery<JournalTag[], Error>({
    queryKey: ['journal', 'tags'],
    queryFn: async () => {
      const res = await clientGet<{ tags: JournalTag[] }>(phase4Client, '/journal/tags');
      return res.tags;
    },
  });
}

/**
 * Hook to create a custom tag
 */
export function useCreateJournalTag() {
  const queryClient = useQueryClient();

  return useMutation<
    JournalTag,
    Error,
    {
      name: string;
      color: string;
      category: JournalTag['category'];
    }
  >({
    mutationFn: async (tag: { name: string; color: string; category: JournalTag['category'] }) => {
      const result = await clientPost<typeof tag, JournalTag>(phase4Client, '/journal/tags', tag);
      logEvent('journal_tag_created', { category: tag.category });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', 'tags'] });
    },
  });
}

/**
 * Hook to get suggested tags based on entry
 */
export function useSuggestedTags(context: {
  strain?: string;
  method?: string;
  effects?: string[];
}) {
  return useQuery<string[], Error>({
    queryKey: ['journal', 'tags', 'suggested', context],
    queryFn: async () => {
      const res = await clientGet<{ tags: string[] }>(phase4Client, '/journal/tags/suggested', {
        params: context,
      });
      return res.tags;
    },
    enabled: !!(context.strain || context.method || context.effects?.length),
  });
}

// ============================================
// Chart & Analytics Hooks
// ============================================

/**
 * Hook to fetch mood chart data
 */
export function useMoodChartData(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery<JournalChartData, Error>({
    queryKey: ['journal', 'charts', 'mood', period],
    queryFn: async () => {
      return await clientGet<JournalChartData>(phase4Client, '/journal/charts/mood', {
        params: { period },
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch dosage chart data
 */
export function useDosageChartData(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery<JournalChartData, Error>({
    queryKey: ['journal', 'charts', 'dosage', period],
    queryFn: async () => {
      return await clientGet<JournalChartData>(phase4Client, '/journal/charts/dosage', {
        params: { period },
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch effects frequency chart
 */
export function useEffectsChartData(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery<
    {
      effects: { effect: string; positive: number; negative: number }[];
      period: string;
    },
    Error
  >({
    queryKey: ['journal', 'charts', 'effects', period],
    queryFn: async () => {
      return await clientGet(phase4Client, '/journal/charts/effects', { params: { period } });
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch consumption summary
 */
export function useConsumptionSummary(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery<ConsumptionSummary, Error>({
    queryKey: ['journal', 'summary', period],
    queryFn: async () => {
      return await clientGet<ConsumptionSummary>(phase4Client, '/journal/summary', {
        params: { period },
      });
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch journal insights
 */
export function useJournalInsights() {
  return useQuery<JournalInsight[], Error>({
    queryKey: ['journal', 'insights'],
    queryFn: async () => {
      const res = await clientGet<{ insights: JournalInsight[] }>(
        phase4Client,
        '/journal/insights'
      );
      return res.insights;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// ============================================
// Pattern & Correlation Hooks
// ============================================

/**
 * Hook to find effect correlations
 */
export function useEffectCorrelations() {
  return useQuery<
    {
      strainEffects: { strain: string; topEffects: string[] }[];
      methodEffects: { method: string; topEffects: string[] }[];
      timeEffects: { timeOfDay: string; topEffects: string[] }[];
    },
    Error
  >({
    queryKey: ['journal', 'correlations', 'effects'],
    queryFn: async () => {
      return await clientGet(phase4Client, '/journal/correlations/effects');
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to find mood patterns
 */
export function useMoodPatterns() {
  return useQuery<
    {
      bestTimeOfDay: string;
      bestDayOfWeek: string;
      optimalDosage: DetailedDosage;
      moodTriggers: { trigger: string; impact: 'positive' | 'negative' }[];
    },
    Error
  >({
    queryKey: ['journal', 'patterns', 'mood'],
    queryFn: async () => {
      return await clientGet(phase4Client, '/journal/patterns/mood');
    },
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Hook to get personalized recommendations based on journal
 */
export function useJournalRecommendations() {
  return useQuery<
    {
      strains: { id: string; name: string; reason: string; confidence: number }[];
      dosage: { recommended: DetailedDosage; reason: string };
      timing: { bestTime: string; reason: string };
    },
    Error
  >({
    queryKey: ['journal', 'recommendations'],
    queryFn: async () => {
      return await clientGet(phase4Client, '/journal/recommendations');
    },
    staleTime: 30 * 60 * 1000,
  });
}

// ============================================
// Search & Filter Hooks
// ============================================

/**
 * Hook to search journal entries
 */
export function useSearchJournal(
  query: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    mood?: MoodLevel[];
    effects?: string[];
    strains?: string[];
    methods?: JournalEntry['consumptionMethod'][];
    tags?: string[];
  }
) {
  return useQuery<JournalEntry[], Error>({
    queryKey: ['journal', 'search', query, filters],
    queryFn: async () => {
      const res = await clientGet<{ entries: JournalEntry[] }>(phase4Client, '/journal/search', {
        params: { q: query, ...filters },
      });
      return res.entries;
    },
    enabled:
      query.length >= 2 ||
      Object.values(filters || {}).some(v => v && (Array.isArray(v) ? v.length > 0 : true)),
  });
}

/**
 * Hook to get entries for a specific product
 */
export function useProductJournalEntries(productId: string) {
  return useQuery<JournalEntry[], Error>({
    queryKey: ['journal', 'product', productId],
    queryFn: async () => {
      const res = await clientGet<{ entries: JournalEntry[] }>(
        phase4Client,
        `/journal/product/${productId}`
      );
      return res.entries;
    },
    enabled: !!productId,
  });
}

/**
 * Hook to get entries for a specific strain
 */
export function useStrainJournalEntries(strainName: string) {
  return useQuery<JournalEntry[], Error>({
    queryKey: ['journal', 'strain', strainName],
    queryFn: async () => {
      const res = await clientGet<{ entries: JournalEntry[] }>(
        phase4Client,
        `/journal/strain/${encodeURIComponent(strainName)}`
      );
      return res.entries;
    },
    enabled: !!strainName,
  });
}

// ============================================
// Export & Share Hooks
// ============================================

/**
 * Hook to export journal data
 */
export function useExportJournal() {
  return useMutation<
    { downloadUrl: string },
    Error,
    {
      format: 'pdf' | 'csv' | 'json';
      startDate?: string;
      endDate?: string;
      includeImages?: boolean;
    }
  >({
    mutationFn: async (options: {
      format: 'pdf' | 'csv' | 'json';
      startDate?: string;
      endDate?: string;
      includeImages?: boolean;
    }) => {
      const result = await clientPost<typeof options, { downloadUrl: string }>(
        phase4Client,
        '/journal/export',
        options
      );
      logEvent('journal_exported', { format: options.format });
      return result;
    },
  });
}

/**
 * Hook to share a journal entry (anonymized)
 */
export function useShareJournalEntry() {
  return useMutation<
    { shareUrl: string },
    Error,
    {
      entryId: string;
      includeStrain: boolean;
      includeDosage: boolean;
      includeEffects: boolean;
      expiresIn?: number; // hours
    }
  >({
    mutationFn: async (options: {
      entryId: string;
      includeStrain: boolean;
      includeDosage: boolean;
      includeEffects: boolean;
      expiresIn?: number;
    }) => {
      const result = await clientPost<typeof options, { shareUrl: string }>(
        phase4Client,
        `/journal/entries/${options.entryId}/share`,
        options
      );
      logEvent('journal_entry_shared', { entryId: options.entryId });
      return result;
    },
  });
}

// ============================================
// Reminder Hooks
// ============================================

/**
 * Hook to set journal reminder
 */
export function useSetJournalReminder() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string },
    Error,
    {
      type: 'log_session' | 'mood_checkin' | 'follow_up';
      time: string; // HH:mm
      days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
      enabled: boolean;
    }
  >({
    mutationFn: async (reminder: {
      type: 'log_session' | 'mood_checkin' | 'follow_up';
      time: string;
      days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
      enabled: boolean;
    }) => {
      const result = await clientPost<typeof reminder, { id: string }>(
        phase4Client,
        '/journal/reminders',
        reminder
      );
      logEvent('journal_reminder_set', { type: reminder.type });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', 'reminders'] });
    },
  });
}

/**
 * Hook to fetch journal reminders
 */
export function useJournalReminders() {
  return useQuery<
    {
      id: string;
      type: string;
      time: string;
      days: string[];
      enabled: boolean;
    }[],
    Error
  >({
    queryKey: ['journal', 'reminders'],
    queryFn: async () => {
      const res = await clientGet<{
        reminders: {
          id: string;
          type: string;
          time: string;
          days: string[];
          enabled: boolean;
        }[];
      }>(phase4Client, '/journal/reminders');
      return res.reminders;
    },
  });
}
