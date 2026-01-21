import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useProductSearch,
  useSearchSuggestions,
  useTrendingSearches,
  useRecentSearches,
  useSearchState,
  useSearchByEffect,
  useSearchByTerpenes,
} from '../../hooks/useSearch';
import * as http from '../../api/http';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
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

describe('useSearchSuggestions hook', () => {
  const mockSuggestions = [
    { type: 'product', text: 'Blue Dream', slug: 'blue-dream' },
    { type: 'category', text: 'Flower', slug: 'flower' },
    { type: 'brand', text: 'Cookies', slug: 'cookies' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch suggestions for query', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ suggestions: mockSuggestions });

    const { result } = renderHook(() => useSearchSuggestions('blue'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSuggestions);
    expect(http.clientGet).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('q=blue')
    );
  });

  it('should not fetch for query shorter than 2 chars', () => {
    const { result } = renderHook(() => useSearchSuggestions('b'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(http.clientGet).not.toHaveBeenCalled();
  });

  it('should return empty array for empty query', () => {
    const { result } = renderHook(() => useSearchSuggestions(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useTrendingSearches hook', () => {
  const mockTrending = ['Blue Dream', 'Edibles', 'Pre-rolls', 'CBD Oil'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch trending searches', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ searches: mockTrending });

    const { result } = renderHook(() => useTrendingSearches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTrending);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/search/trending');
  });

  it('should handle empty response', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce({});

    const { result } = renderHook(() => useTrendingSearches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});

describe('useRecentSearches hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with empty recent searches', () => {
    const { result } = renderHook(() => useRecentSearches(), {
      wrapper: createWrapper(),
    });

    expect(result.current.recentSearches).toEqual([]);
  });

  it('should add recent search', () => {
    const { result } = renderHook(() => useRecentSearches(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addRecentSearch('Blue Dream');
    });

    expect(result.current.recentSearches).toContain('Blue Dream');
  });

  it('should not duplicate searches', () => {
    const { result } = renderHook(() => useRecentSearches(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addRecentSearch('Blue Dream');
    });

    act(() => {
      result.current.addRecentSearch('blue dream'); // Same, different case
    });

    expect(result.current.recentSearches.filter(s => s.toLowerCase() === 'blue dream').length).toBe(
      1
    );
  });

  it('should clear recent searches', () => {
    const { result } = renderHook(() => useRecentSearches(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addRecentSearch('Blue Dream');
      result.current.addRecentSearch('Edibles');
    });

    expect(result.current.recentSearches.length).toBeGreaterThan(0);

    act(() => {
      result.current.clearRecentSearches();
    });

    expect(result.current.recentSearches).toEqual([]);
  });

  it('should limit recent searches to 10', () => {
    const { result } = renderHook(() => useRecentSearches(), {
      wrapper: createWrapper(),
    });

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.addRecentSearch(`Search ${i}`);
      }
    });

    expect(result.current.recentSearches.length).toBeLessThanOrEqual(10);
  });
});

describe('useProductSearch hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('searches products with query and filters', async () => {
    const mockResponse = {
      results: [{ id: 'p1', name: 'Product' }],
      total: 1,
      page: 1,
      pageSize: 24,
      hasMore: false,
    };
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useProductSearch('flower', { category: 'flower' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].results).toHaveLength(1);
  });

  it('can be disabled', () => {
    const { result } = renderHook(() => useProductSearch('test', {}, { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe('useSearchState hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('manages query with debouncing', () => {
    const { result } = renderHook(() => useSearchState());

    act(() => {
      result.current.updateQuery('test');
    });

    expect(result.current.query).toBe('test');
    expect(result.current.debouncedQuery).toBe('');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.debouncedQuery).toBe('test');
  });

  it('updates filters', () => {
    const { result } = renderHook(() => useSearchState());

    act(() => {
      result.current.updateFilter('category', 'flower');
    });

    expect(result.current.filters.category).toBe('flower');
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('clears filters', () => {
    const { result } = renderHook(() => useSearchState({ category: 'flower' }));

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({});
    expect(result.current.activeFilterCount).toBe(0);
  });
});

describe('useSearchByEffect hook', () => {
  it('searches by effect', async () => {
    const mockResults = [{ id: 'p1', name: 'Relaxing' }];
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ results: mockResults });

    const { result } = renderHook(() => useSearchByEffect('relaxed'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResults);
  });
});

describe('useSearchByTerpenes hook', () => {
  it('searches by terpenes', async () => {
    const mockResults = [{ id: 'p1', name: 'Myrcene Rich' }];
    (http.clientGet as jest.Mock).mockResolvedValueOnce({ results: mockResults });

    const { result } = renderHook(() => useSearchByTerpenes(['myrcene']), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResults);
  });
});
