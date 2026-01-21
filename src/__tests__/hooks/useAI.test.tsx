import { renderHook, act, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAiRecommendations, useAiBudtender } from '../../hooks/useAI';

// Mock dependencies
jest.mock('../../utils/apiClient', () => ({
  fetchJson: jest.fn(),
}));

jest.mock('../../utils/apiConfig', () => ({
  API_BASE_URL: 'https://api.test.com',
}));

const { fetchJson } = require('../../utils/apiClient');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useAiRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mutation object with expected properties', () => {
    const { result } = renderHook(() => useAiRecommendations(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.cancel).toBeDefined();
  });

  it('makes API request with correct body', async () => {
    const mockResponse = {
      recommendations: [{ id: '1', name: 'Blue Dream', score: 0.95 }],
      totalFound: 1,
      preferences: {},
    };
    (fetchJson as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAiRecommendations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        desiredEffects: ['relaxed'],
        experienceLevel: 'regular',
        budgetLevel: 'medium',
      });
    });

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalledWith(
        'https://api.test.com/api/ai/recommend-products',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('relaxed'),
        })
      );
    });
  });

  it('returns recommendation data on success', async () => {
    const mockResponse = {
      recommendations: [
        { id: '1', name: 'Blue Dream', score: 0.95, reasoning: 'Great for relaxation' },
      ],
      totalFound: 1,
    };
    (fetchJson as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAiRecommendations(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        desiredEffects: ['relaxed'],
        experienceLevel: 'regular',
        budgetLevel: 'medium',
      });
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.recommendations).toBeDefined();
  });

  it('provides cancel function', () => {
    const { result } = renderHook(() => useAiRecommendations(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.cancel).toBe('function');
    // Should not throw
    result.current.cancel();
  });
});

describe('useAiBudtender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mutation object with expected properties', () => {
    const { result } = renderHook(() => useAiBudtender(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.cancel).toBeDefined();
  });

  it('makes API request for chat message', async () => {
    const mockResponse = {
      response: 'I recommend trying Blue Dream for relaxation.',
      timestamp: '2024-01-01T00:00:00Z',
      context: { userMessage: 'Hello', suggestedProducts: [] },
      conversationLength: 1,
    };
    (fetchJson as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAiBudtender(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ message: 'What should I try for relaxation?' });
    });

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalledWith(
        'https://api.test.com/api/ai/budtender',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('supports conversation history', async () => {
    const mockResponse = { response: 'Great choice!' };
    (fetchJson as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAiBudtender(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        message: 'I picked Blue Dream',
        history: [
          { role: 'user', content: 'What should I try?' },
          { role: 'assistant', content: 'Try Blue Dream!' },
        ],
      });
    });

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalled();
    });
  });

  it('handles errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (fetchJson as jest.Mock).mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useAiBudtender(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate({ message: 'Hello' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    consoleSpy.mockRestore();
  });
});
