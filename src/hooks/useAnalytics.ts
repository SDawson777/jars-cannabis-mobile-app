// src/hooks/useAnalytics.ts
// Advanced analytics dashboards, segmentation, cohorts, funnels & A/B testing
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';

// ============================================
// Types
// ============================================

export interface DateRange {
  start: string; // ISO date
  end: string;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'funnel' | 'cohort' | 'segment';
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

export interface MetricSummary {
  name: string;
  value: number;
  previousValue?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SegmentDefinition {
  id: string;
  name: string;
  description?: string;
  conditions: SegmentCondition[];
  userCount: number;
  createdAt: string;
}

export interface SegmentCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in' | 'not_in';
  value: string | number | string[] | number[];
}

export interface CohortAnalysis {
  cohortDate: string;
  cohortSize: number;
  retentionByPeriod: { period: number; retained: number; percentage: number }[];
}

export interface ConversionFunnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  conversionRate: number;
  averageTimeToConvert: number; // minutes
}

export interface FunnelStep {
  name: string;
  eventName: string;
  count: number;
  dropoffRate: number;
  averageTimeFromPrevious?: number;
}

export interface ABTestResult {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  variants: ABTestVariant[];
  winningVariant?: string;
  confidence: number;
}

export interface ABTestVariant {
  id: string;
  name: string;
  traffic: number; // percentage
  conversions: number;
  conversionRate: number;
  revenue?: number;
  revenuePerUser?: number;
}

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  channel: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  roas: number; // Return on ad spend
  attributedOrders: number;
}

export interface DeepLinkMetrics {
  linkId: string;
  url: string;
  clicks: number;
  installs: number;
  conversions: number;
  revenue: number;
  topSources: { source: string; count: number }[];
}

// ============================================
// Dashboard Hooks
// ============================================

/**
 * Hook to fetch analytics dashboards
 */
export function useAnalyticsDashboards() {
  return useQuery<AnalyticsDashboard[], Error>({
    queryKey: ['analytics', 'dashboards'],
    queryFn: async () => {
      const res = await clientGet<{ dashboards: AnalyticsDashboard[] }>(
        phase4Client,
        '/analytics/dashboards'
      );
      return res.dashboards;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a specific dashboard
 */
export function useAnalyticsDashboard(dashboardId: string) {
  return useQuery<AnalyticsDashboard, Error>({
    queryKey: ['analytics', 'dashboards', dashboardId],
    queryFn: async () => {
      return await clientGet<AnalyticsDashboard>(
        phase4Client,
        `/analytics/dashboards/${dashboardId}`
      );
    },
    enabled: !!dashboardId,
  });
}

/**
 * Hook to fetch key metrics summary
 */
export function useMetricsSummary(dateRange: DateRange) {
  return useQuery<MetricSummary[], Error>({
    queryKey: ['analytics', 'metrics', dateRange],
    queryFn: async () => {
      const res = await clientGet<{ metrics: MetricSummary[] }>(
        phase4Client,
        '/analytics/metrics/summary',
        { params: { start: dateRange.start, end: dateRange.end } }
      );
      return res.metrics;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================
// Segmentation Hooks
// ============================================

/**
 * Hook to fetch user segments
 */
export function useSegments() {
  return useQuery<SegmentDefinition[], Error>({
    queryKey: ['analytics', 'segments'],
    queryFn: async () => {
      const res = await clientGet<{ segments: SegmentDefinition[] }>(
        phase4Client,
        '/analytics/segments'
      );
      return res.segments;
    },
  });
}

/**
 * Hook to create a user segment
 */
export function useCreateSegment() {
  const queryClient = useQueryClient();

  return useMutation<
    SegmentDefinition,
    Error,
    { name: string; description?: string; conditions: SegmentCondition[] }
  >({
    mutationFn: async (segment: {
      name: string;
      description?: string;
      conditions: SegmentCondition[];
    }) => {
      return await clientPost<typeof segment, SegmentDefinition>(
        phase4Client,
        '/analytics/segments',
        segment
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'segments'] });
    },
  });
}

/**
 * Hook to get segment users
 */
export function useSegmentUsers(segmentId: string, limit = 100) {
  return useQuery<{ userId: string; attributes: Record<string, unknown> }[], Error>({
    queryKey: ['analytics', 'segments', segmentId, 'users'],
    queryFn: async () => {
      const res = await clientGet<{
        users: { userId: string; attributes: Record<string, unknown> }[];
      }>(phase4Client, `/analytics/segments/${segmentId}/users`, { params: { limit } });
      return res.users;
    },
    enabled: !!segmentId,
  });
}

// ============================================
// Cohort Analysis Hooks
// ============================================

/**
 * Hook to fetch cohort retention analysis
 */
export function useCohortAnalysis(options: {
  cohortType: 'signup' | 'first_purchase' | 'custom';
  dateRange: DateRange;
  granularity: 'day' | 'week' | 'month';
}) {
  return useQuery<CohortAnalysis[], Error>({
    queryKey: ['analytics', 'cohorts', options],
    queryFn: async () => {
      const res = await clientGet<{ cohorts: CohortAnalysis[] }>(
        phase4Client,
        '/analytics/cohorts',
        { params: options }
      );
      return res.cohorts;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================
// Conversion Funnel Hooks
// ============================================

/**
 * Hook to fetch conversion funnels
 */
export function useConversionFunnels() {
  return useQuery<ConversionFunnel[], Error>({
    queryKey: ['analytics', 'funnels'],
    queryFn: async () => {
      const res = await clientGet<{ funnels: ConversionFunnel[] }>(
        phase4Client,
        '/analytics/funnels'
      );
      return res.funnels;
    },
  });
}

/**
 * Hook to fetch a specific funnel with data
 */
export function useFunnelAnalysis(funnelId: string, dateRange: DateRange) {
  return useQuery<ConversionFunnel, Error>({
    queryKey: ['analytics', 'funnels', funnelId, dateRange],
    queryFn: async () => {
      return await clientGet<ConversionFunnel>(phase4Client, `/analytics/funnels/${funnelId}`, {
        params: { start: dateRange.start, end: dateRange.end },
      });
    },
    enabled: !!funnelId,
  });
}

/**
 * Hook to create a conversion funnel
 */
export function useCreateFunnel() {
  const queryClient = useQueryClient();

  return useMutation<
    ConversionFunnel,
    Error,
    { name: string; steps: { name: string; eventName: string }[] }
  >({
    mutationFn: async (funnel: { name: string; steps: { name: string; eventName: string }[] }) => {
      return await clientPost<typeof funnel, ConversionFunnel>(
        phase4Client,
        '/analytics/funnels',
        funnel
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'funnels'] });
    },
  });
}

// ============================================
// A/B Testing Hooks
// ============================================

/**
 * Hook to fetch A/B tests
 */
export function useABTests(status?: 'running' | 'completed' | 'paused') {
  return useQuery<ABTestResult[], Error>({
    queryKey: ['analytics', 'ab-tests', status],
    queryFn: async () => {
      const res = await clientGet<{ tests: ABTestResult[] }>(phase4Client, '/analytics/ab-tests', {
        params: status ? { status } : undefined,
      });
      return res.tests;
    },
  });
}

/**
 * Hook to fetch a specific A/B test
 */
export function useABTest(testId: string) {
  return useQuery<ABTestResult, Error>({
    queryKey: ['analytics', 'ab-tests', testId],
    queryFn: async () => {
      return await clientGet<ABTestResult>(phase4Client, `/analytics/ab-tests/${testId}`);
    },
    enabled: !!testId,
    refetchInterval: 60 * 1000, // Refresh every minute for live tests
  });
}

/**
 * Hook to create an A/B test
 */
export function useCreateABTest() {
  const queryClient = useQueryClient();

  return useMutation<
    ABTestResult,
    Error,
    {
      name: string;
      variants: { name: string; traffic: number }[];
      goalEvent: string;
      targetSegmentId?: string;
    }
  >({
    mutationFn: async (test: {
      name: string;
      variants: { name: string; traffic: number }[];
      goalEvent: string;
      targetSegmentId?: string;
    }) => {
      return await clientPost<typeof test, ABTestResult>(phase4Client, '/analytics/ab-tests', test);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'ab-tests'] });
    },
  });
}

// ============================================
// Campaign Metrics Hooks
// ============================================

/**
 * Hook to fetch campaign performance metrics
 */
export function useCampaignMetrics(dateRange: DateRange, campaignIds?: string[]) {
  return useQuery<CampaignMetrics[], Error>({
    queryKey: ['analytics', 'campaigns', dateRange, campaignIds],
    queryFn: async () => {
      const res = await clientGet<{ campaigns: CampaignMetrics[] }>(
        phase4Client,
        '/analytics/campaigns',
        {
          params: {
            start: dateRange.start,
            end: dateRange.end,
            campaignIds: campaignIds?.join(','),
          },
        }
      );
      return res.campaigns;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch deep link metrics
 */
export function useDeepLinkMetrics(dateRange: DateRange) {
  return useQuery<DeepLinkMetrics[], Error>({
    queryKey: ['analytics', 'deep-links', dateRange],
    queryFn: async () => {
      const res = await clientGet<{ links: DeepLinkMetrics[] }>(
        phase4Client,
        '/analytics/deep-links',
        { params: { start: dateRange.start, end: dateRange.end } }
      );
      return res.links;
    },
  });
}

/**
 * Hook to create a tracked deep link
 */
export function useCreateDeepLink() {
  const queryClient = useQueryClient();

  return useMutation<
    { linkId: string; url: string; shortUrl: string },
    Error,
    {
      destination: string;
      campaign?: string;
      source?: string;
      medium?: string;
    }
  >({
    mutationFn: async (params: {
      destination: string;
      campaign?: string;
      source?: string;
      medium?: string;
    }) => {
      return await clientPost<typeof params, { linkId: string; url: string; shortUrl: string }>(
        phase4Client,
        '/analytics/deep-links',
        params
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'deep-links'] });
    },
  });
}

// ============================================
// Real-time Analytics Hooks
// ============================================

/**
 * Hook to fetch real-time active users
 */
export function useRealTimeUsers() {
  return useQuery<
    {
      activeUsers: number;
      byPage: { page: string; count: number }[];
      byLocation: { location: string; count: number }[];
    },
    Error
  >({
    queryKey: ['analytics', 'realtime', 'users'],
    queryFn: async () => {
      return await clientGet<{
        activeUsers: number;
        byPage: { page: string; count: number }[];
        byLocation: { location: string; count: number }[];
      }>(phase4Client, '/analytics/realtime/users');
    },
    refetchInterval: 10 * 1000, // Every 10 seconds
  });
}

/**
 * Hook to fetch real-time events stream
 */
export function useRealTimeEvents() {
  return useQuery<
    {
      events: { eventName: string; count: number; trend: number }[];
      conversions: number;
      revenue: number;
    },
    Error
  >({
    queryKey: ['analytics', 'realtime', 'events'],
    queryFn: async () => {
      return await clientGet<{
        events: { eventName: string; count: number; trend: number }[];
        conversions: number;
        revenue: number;
      }>(phase4Client, '/analytics/realtime/events');
    },
    refetchInterval: 5 * 1000, // Every 5 seconds
  });
}
