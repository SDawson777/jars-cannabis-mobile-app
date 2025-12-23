import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as apiClient from '../utils/apiClient';
import { useAiRecommendations } from '../hooks/useAI';

describe('useAiRecommendations', () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: any) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  beforeEach(() => jest.restoreAllMocks());

  it('mutates and returns data', async () => {
    const mockResp = {
      recommendations: [],
      totalFound: 0,
      preferences: { desiredEffects: [], experienceLevel: 'new', budgetLevel: 'low' },
    };
    jest.spyOn(apiClient, 'fetchJson').mockResolvedValueOnce(mockResp as any);

    const { result } = renderHook(() => useAiRecommendations(), { wrapper });

    let data: any;
    await act(async () => {
      data = await result.current.mutateAsync({
        desiredEffects: ['relax'],
        experienceLevel: 'new',
        budgetLevel: 'low',
      });
    });

    expect(data).toEqual(mockResp);
    expect(apiClient.fetchJson).toHaveBeenCalled();
  });

  it('exposes cancel function', () => {
    const { result } = renderHook(() => useAiRecommendations(), { wrapper });
    expect(typeof (result.current as any).cancel).toBe('function');
  });
});
