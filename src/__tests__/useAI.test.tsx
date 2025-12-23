import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as apiClient from '../utils/apiClient';
import { useAiRecommendations } from '../hooks/useAI';

describe('useAiRecommendations', () => {
  const wrapper = ({ children }: any) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('mutates and returns data', async () => {
    const mockResp = { recommendations: [], totalFound: 0, preferences: { desiredEffects: [], experienceLevel: 'new', budgetLevel: 'low' } };
    jest.spyOn(apiClient, 'fetchJson').mockResolvedValueOnce(mockResp as any);

    const { result } = renderHook(() => useAiRecommendations(), { wrapper });

    let data: any;
    await act(async () => {
      data = await result.current.mutateAsync({ desiredEffects: ['relax'], experienceLevel: 'new', budgetLevel: 'low' });
    });

    expect(data).toEqual(mockResp);
  });

  it('exposes cancel function', () => {
    const { result } = renderHook(() => useAiRecommendations(), { wrapper });
    expect(typeof (result.current as any).cancel).toBe('function');
  });
});
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../utils/apiClient', () => ({
  fetchJson: jest.fn(),
}));

import { fetchJson } from '../utils/apiClient';
import { useAiRecommendations } from '../hooks/useAI';

describe('useAiRecommendations', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('mutates and returns data', async () => {
    (fetchJson as jest.Mock).mockResolvedValue({ recommendations: [], totalFound: 0, preferences: {} });

    const wrapper = ({ children }: any) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAiRecommendations(), { wrapper });

    let data: any = null;
    await act(async () => {
      data = await result.current.mutateAsync({ desiredEffects: ['relax'], experienceLevel: 'regular', budgetLevel: 'medium' });
    });

    expect(fetchJson).toHaveBeenCalled();
    expect(data).toHaveProperty('recommendations');
  });

  it('exposes cancel()', () => {
    const wrapper = ({ children }: any) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useAiRecommendations(), { wrapper });
    expect(typeof result.current.cancel).toBe('function');
  });
});
