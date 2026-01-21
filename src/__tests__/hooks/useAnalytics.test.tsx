/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAnalyticsDashboards,
  useAnalyticsDashboard,
  useMetricsSummary,
  useSegments,
  useCreateSegment,
  useSegmentUsers,
  useCohortAnalysis,
  useConversionFunnels,
  useFunnelAnalysis,
  useCreateFunnel,
  useABTests,
  useABTest,
  useCreateABTest,
  useCampaignMetrics,
  useDeepLinkMetrics,
  useCreateDeepLink,
  useRealTimeUsers,
  useRealTimeEvents,
} from '../../hooks/useAnalytics';

jest.mock('../../api/phase4Client');
jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

const mockClientGet = require('../../api/http').clientGet as jest.Mock;
const mockClientPost = require('../../api/http').clientPost as jest.Mock;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAnalyticsDashboards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches dashboards', async () => {
    const mockDashboards = [
      {
        id: 'd1',
        name: 'Sales Dashboard',
        widgets: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: 'd2',
        name: 'User Dashboard',
        widgets: [],
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
      },
    ];
    mockClientGet.mockResolvedValue({ dashboards: mockDashboards });

    const { result } = renderHook(() => useAnalyticsDashboards(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockDashboards);
  });
});

describe('useAnalyticsDashboard', () => {
  it('fetches specific dashboard', async () => {
    const mockDashboard = {
      id: 'd1',
      name: 'Sales Dashboard',
      widgets: [
        {
          id: 'w1',
          type: 'metric' as const,
          title: 'Revenue',
          config: {},
          position: { x: 0, y: 0, w: 1, h: 1 },
        },
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };
    mockClientGet.mockResolvedValue(mockDashboard);

    const { result } = renderHook(() => useAnalyticsDashboard('d1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockDashboard);
  });

  it('disabled when no dashboardId', () => {
    const { result } = renderHook(() => useAnalyticsDashboard(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe('useMetricsSummary', () => {
  it('fetches metrics for date range', async () => {
    const mockMetrics = [
      { name: 'Revenue', value: 10000, trend: 'up' as const },
      { name: 'Orders', value: 250, trend: 'stable' as const },
    ];
    mockClientGet.mockResolvedValue({ metrics: mockMetrics });

    const dateRange = { start: '2024-01-01', end: '2024-01-31' };
    const { result } = renderHook(() => useMetricsSummary(dateRange), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockMetrics);
  });
});

describe('useSegments', () => {
  it('fetches user segments', async () => {
    const mockSegments = [
      { id: 's1', name: 'High Value', conditions: [], userCount: 100, createdAt: '2024-01-01' },
      { id: 's2', name: 'At Risk', conditions: [], userCount: 50, createdAt: '2024-01-02' },
    ];
    mockClientGet.mockResolvedValue({ segments: mockSegments });

    const { result } = renderHook(() => useSegments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSegments);
  });
});

describe('useCreateSegment', () => {
  it('creates a new segment', async () => {
    const newSegment = {
      id: 's3',
      name: 'New Segment',
      conditions: [{ field: 'totalSpent', operator: 'gt' as const, value: 100 }],
      userCount: 75,
      createdAt: '2024-01-03',
    };
    mockClientPost.mockResolvedValue(newSegment);

    const { result } = renderHook(() => useCreateSegment(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: 'New Segment',
      conditions: [{ field: 'totalSpent', operator: 'gt', value: 100 }],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(newSegment);
  });
});

describe('useSegmentUsers', () => {
  it('fetches users in segment', async () => {
    const mockUsers = [
      { userId: 'u1', attributes: { name: 'User 1' } },
      { userId: 'u2', attributes: { name: 'User 2' } },
    ];
    mockClientGet.mockResolvedValue({ users: mockUsers });

    const { result } = renderHook(() => useSegmentUsers('s1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUsers);
  });

  it('respects limit parameter', async () => {
    mockClientGet.mockResolvedValue({ users: [] });

    renderHook(() => useSegmentUsers('s1', 50), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(mockClientGet).toHaveBeenCalled());
  });

  it('disabled when no segmentId', () => {
    const { result } = renderHook(() => useSegmentUsers(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe('useCohortAnalysis', () => {
  it('fetches cohort data', async () => {
    const mockCohorts = [
      {
        cohortDate: '2024-01',
        cohortSize: 100,
        retentionByPeriod: [
          { period: 0, retained: 100, percentage: 100 },
          { period: 1, retained: 80, percentage: 80 },
        ],
      },
    ];
    mockClientGet.mockResolvedValue({ cohorts: mockCohorts });

    const options = {
      cohortType: 'signup' as const,
      dateRange: { start: '2024-01-01', end: '2024-01-31' },
      granularity: 'month' as const,
    };

    const { result } = renderHook(() => useCohortAnalysis(options), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCohorts);
  });
});

describe('useConversionFunnels', () => {
  it('fetches all funnels', async () => {
    const mockFunnels = [
      {
        id: 'f1',
        name: 'Checkout Funnel',
        steps: [],
        conversionRate: 0.25,
        averageTimeToConvert: 45,
      },
    ];
    mockClientGet.mockResolvedValue({ funnels: mockFunnels });

    const { result } = renderHook(() => useConversionFunnels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockFunnels);
  });
});

describe('useFunnelAnalysis', () => {
  it('fetches funnel with data', async () => {
    const mockFunnel = {
      id: 'f1',
      name: 'Checkout',
      steps: [
        { name: 'View Cart', eventName: 'cart_viewed', count: 1000, dropoffRate: 0 },
        { name: 'Checkout', eventName: 'checkout_started', count: 750, dropoffRate: 0.25 },
      ],
      conversionRate: 0.75,
      averageTimeToConvert: 30,
    };
    mockClientGet.mockResolvedValue(mockFunnel);

    const dateRange = { start: '2024-01-01', end: '2024-01-31' };
    const { result } = renderHook(() => useFunnelAnalysis('f1', dateRange), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockFunnel);
  });

  it('disabled when no funnelId', () => {
    const { result } = renderHook(
      () => useFunnelAnalysis('', { start: '2024-01-01', end: '2024-01-31' }),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isFetching).toBe(false);
  });
});

describe('useCreateFunnel', () => {
  it('creates a new funnel', async () => {
    const newFunnel = {
      id: 'f2',
      name: 'Signup Funnel',
      steps: [],
      conversionRate: 0,
      averageTimeToConvert: 0,
    };
    mockClientPost.mockResolvedValue(newFunnel);

    const { result } = renderHook(() => useCreateFunnel(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: 'Signup Funnel',
      steps: [
        { name: 'View Page', eventName: 'page_view' },
        { name: 'Click Signup', eventName: 'signup_click' },
      ],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(newFunnel);
  });
});

describe('useABTests', () => {
  it('fetches all A/B tests', async () => {
    const mockTests = [
      {
        id: 't1',
        name: 'Button Color Test',
        status: 'running' as const,
        startDate: '2024-01-01',
        variants: [],
        confidence: 0.95,
      },
    ];
    mockClientGet.mockResolvedValue({ tests: mockTests });

    const { result } = renderHook(() => useABTests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTests);
  });

  it('filters by status', async () => {
    mockClientGet.mockResolvedValue({ tests: [] });

    renderHook(() => useABTests('completed'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(mockClientGet).toHaveBeenCalled());
  });
});

describe('useABTest', () => {
  it('fetches specific test', async () => {
    const mockTest = {
      id: 't1',
      name: 'Test',
      status: 'running' as const,
      startDate: '2024-01-01',
      variants: [
        { id: 'v1', name: 'Control', traffic: 50, conversions: 100, conversionRate: 0.1 },
        { id: 'v2', name: 'Variant', traffic: 50, conversions: 120, conversionRate: 0.12 },
      ],
      confidence: 0.95,
    };
    mockClientGet.mockResolvedValue(mockTest);

    const { result } = renderHook(() => useABTest('t1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTest);
  });

  it('disabled when no testId', () => {
    const { result } = renderHook(() => useABTest(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe('useCreateABTest', () => {
  it('creates A/B test', async () => {
    const newTest = {
      id: 't2',
      name: 'New Test',
      status: 'running' as const,
      startDate: '2024-01-01',
      variants: [],
      confidence: 0,
    };
    mockClientPost.mockResolvedValue(newTest);

    const { result } = renderHook(() => useCreateABTest(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: 'New Test',
      variants: [
        { name: 'Control', traffic: 50 },
        { name: 'Variant', traffic: 50 },
      ],
      goalEvent: 'purchase',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(newTest);
  });
});

describe('useCampaignMetrics', () => {
  it('fetches campaign metrics', async () => {
    const mockCampaigns = [
      {
        campaignId: 'c1',
        campaignName: 'Summer Sale',
        channel: 'email',
        impressions: 10000,
        clicks: 500,
        conversions: 50,
        revenue: 5000,
        ctr: 0.05,
        conversionRate: 0.1,
        roas: 5,
        attributedOrders: 50,
      },
    ];
    mockClientGet.mockResolvedValue({ campaigns: mockCampaigns });

    const dateRange = { start: '2024-01-01', end: '2024-01-31' };
    const { result } = renderHook(() => useCampaignMetrics(dateRange), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCampaigns);
  });

  it('filters by campaign IDs', async () => {
    mockClientGet.mockResolvedValue({ campaigns: [] });

    const dateRange = { start: '2024-01-01', end: '2024-01-31' };
    renderHook(() => useCampaignMetrics(dateRange, ['c1', 'c2']), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(mockClientGet).toHaveBeenCalled());
  });
});

describe('useDeepLinkMetrics', () => {
  it('fetches deep link metrics', async () => {
    const mockLinks = [
      {
        linkId: 'l1',
        url: 'https://jars.app/product/123',
        clicks: 100,
        installs: 10,
        conversions: 5,
        revenue: 500,
        topSources: [{ source: 'instagram', count: 50 }],
      },
    ];
    mockClientGet.mockResolvedValue({ links: mockLinks });

    const dateRange = { start: '2024-01-01', end: '2024-01-31' };
    const { result } = renderHook(() => useDeepLinkMetrics(dateRange), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockLinks);
  });
});

describe('useCreateDeepLink', () => {
  it('creates tracked deep link', async () => {
    const mockResponse = {
      linkId: 'l2',
      url: 'https://jars.app/product/123',
      shortUrl: 'https://jars.link/abc',
    };
    mockClientPost.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateDeepLink(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      destination: '/product/123',
      campaign: 'summer',
      source: 'email',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
  });
});

describe('useRealTimeUsers', () => {
  it('fetches real-time active users', async () => {
    const mockData = {
      activeUsers: 150,
      byPage: [{ page: '/shop', count: 50 }],
      byLocation: [{ location: 'Los Angeles', count: 30 }],
    };
    mockClientGet.mockResolvedValue(mockData);

    const { result } = renderHook(() => useRealTimeUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
  });
});

describe('useRealTimeEvents', () => {
  it('fetches real-time events stream', async () => {
    const mockData = {
      events: [{ eventName: 'product_view', count: 50, trend: 5 }],
      conversions: 10,
      revenue: 1000,
    };
    mockClientGet.mockResolvedValue(mockData);

    const { result } = renderHook(() => useRealTimeEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
  });
});
