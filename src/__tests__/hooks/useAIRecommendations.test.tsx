import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useAIRecommendations,
  useSimilarProducts,
  useFrequentlyBoughtTogether,
  useEffectBasedRecommendations,
  useMoodBasedRecommendations,
} from '../../hooks/useAIRecommendations';
import * as http from '../../api/http';
import { logEvent } from '../../utils/analytics';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAIRecommendations hook', () => {
  const mockRecommendations = [
    {
      id: 'rec-1',
      productId: 'prod-1',
      productName: 'Blue Dream',
      score: 0.95,
      reason: 'Based on your preferences',
      reasoning: [],
      category: 'Flower',
      price: 45,
    },
    {
      id: 'rec-2',
      productId: 'prod-2',
      productName: 'OG Kush',
      score: 0.88,
      reason: 'Similar to past purchases',
      reasoning: [],
      category: 'Flower',
      price: 50,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch AI recommendations', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ recommendations: mockRecommendations });

    const { result } = renderHook(() => useAIRecommendations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRecommendations);
    expect(logEvent).toHaveBeenCalledWith('ai_recommendations_loaded', { count: 2 });
  });

  it('should fetch recommendations with options', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ recommendations: mockRecommendations });

    const { result } = renderHook(() => useAIRecommendations({ category: 'Flower', limit: 5 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/ai/recommendations', {
      params: { category: 'Flower', limit: 5 },
    });
  });
});

describe('useSimilarProducts hook', () => {
  const mockSimilar = [
    { id: 'rec-1', productId: 'prod-2', productName: 'Similar Product', score: 0.9 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch similar products', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ recommendations: mockSimilar });

    const { result } = renderHook(() => useSimilarProducts('prod-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSimilar);
    expect(http.clientGet).toHaveBeenCalledWith(
      expect.anything(),
      '/ai/recommendations/similar/prod-1',
      { params: { limit: 6 } }
    );
  });

  it('should not fetch when productId is empty', () => {
    const { result } = renderHook(() => useSimilarProducts(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useFrequentlyBoughtTogether hook', () => {
  const mockFrequent = [
    { id: 'rec-1', productId: 'prod-3', productName: 'Frequently Bought', score: 0.85 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch frequently bought together', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce({ recommendations: mockFrequent });

    const { result } = renderHook(() => useFrequentlyBoughtTogether(['prod-1', 'prod-2']), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockFrequent);
    expect(http.clientPost).toHaveBeenCalledWith(
      expect.anything(),
      '/ai/recommendations/frequently-bought',
      { productIds: ['prod-1', 'prod-2'] }
    );
  });

  it('should not fetch when productIds is empty', () => {
    const { result } = renderHook(() => useFrequentlyBoughtTogether([]), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useEffectBasedRecommendations hook', () => {
  const mockEffectRecs = [
    { id: 'rec-1', productId: 'prod-4', productName: 'Relaxing Strain', score: 0.92 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch effect-based recommendations', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce({ recommendations: mockEffectRecs });

    const { result } = renderHook(
      () => useEffectBasedRecommendations(['relaxed', 'happy'], 'moderate'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockEffectRecs);
    expect(http.clientPost).toHaveBeenCalledWith(
      expect.anything(),
      '/ai/recommendations/by-effects',
      { effects: ['relaxed', 'happy'], intensity: 'moderate' }
    );
  });

  it('should not fetch when effects is empty', () => {
    const { result } = renderHook(() => useEffectBasedRecommendations([]), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useMoodBasedRecommendations hook', () => {
  const mockMoodRecs = [
    { id: 'rec-1', productId: 'prod-5', productName: 'Chill Vibes', score: 0.88 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch mood-based recommendations', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ recommendations: mockMoodRecs });

    const { result } = renderHook(() => useMoodBasedRecommendations('evening-relaxation'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockMoodRecs);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/ai/recommendations/by-mood', {
      params: { mood: 'evening-relaxation' },
    });
  });

  it('should not fetch when mood is empty', () => {
    const { result } = renderHook(() => useMoodBasedRecommendations(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
