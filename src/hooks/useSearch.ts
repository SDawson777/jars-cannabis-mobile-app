// src/hooks/useSearch.ts
// Advanced search & filtering with fuzzy search support
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet } from '../api/http';
import { logEvent } from '../utils/analytics';
// @ts-ignore - lodash.debounce types may not be installed
import debounce from 'lodash.debounce';

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  thcMin?: number;
  thcMax?: number;
  cbdMin?: number;
  cbdMax?: number;
  strainType?: 'indica' | 'sativa' | 'hybrid';
  effects?: string[];
  flavors?: string[];
  terpenes?: string[];
  brands?: string[];
  inStock?: boolean;
  onSale?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'thc_desc' | 'rating' | 'popular' | 'newest';
}

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  thcPercent?: number;
  cbdPercent?: number;
  strainType?: string;
  effects?: string[];
  flavors?: string[];
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  matchScore?: number;
  highlights?: {
    name?: string[];
    description?: string[];
  };
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  facets?: SearchFacets;
  suggestions?: string[];
  correctedQuery?: string;
}

export interface SearchFacets {
  categories: { name: string; count: number }[];
  brands: { name: string; count: number }[];
  effects: { name: string; count: number }[];
  flavors: { name: string; count: number }[];
  priceRanges: { min: number; max: number; count: number }[];
  thcRanges: { min: number; max: number; count: number }[];
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'effect' | 'query';
  text: string;
  slug?: string;
  imageUrl?: string;
}

/**
 * Hook for advanced product search with filters
 */
export function useProductSearch(query: string, filters: SearchFilters = {}, options?: { enabled?: boolean }) {
  return useInfiniteQuery<SearchResponse, Error>({
    queryKey: ['search', 'products', query, filters],
    queryFn: async ({ pageParam }: { pageParam: number | undefined }) => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      params.append('page', String(pageParam || 1));
      params.append('limit', '24');
      
      // Add filters
      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      if (filters.priceMin !== undefined) params.append('priceMin', String(filters.priceMin));
      if (filters.priceMax !== undefined) params.append('priceMax', String(filters.priceMax));
      if (filters.thcMin !== undefined) params.append('thcMin', String(filters.thcMin));
      if (filters.thcMax !== undefined) params.append('thcMax', String(filters.thcMax));
      if (filters.cbdMin !== undefined) params.append('cbdMin', String(filters.cbdMin));
      if (filters.cbdMax !== undefined) params.append('cbdMax', String(filters.cbdMax));
      if (filters.strainType) params.append('strainType', filters.strainType);
      if (filters.effects?.length) params.append('effects', filters.effects.join(','));
      if (filters.flavors?.length) params.append('flavors', filters.flavors.join(','));
      if (filters.terpenes?.length) params.append('terpenes', filters.terpenes.join(','));
      if (filters.brands?.length) params.append('brands', filters.brands.join(','));
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.onSale) params.append('onSale', 'true');
      if (filters.sortBy) params.append('sort', filters.sortBy);
      
      const result = await clientGet<SearchResponse>(phase4Client, `/search/products?${params}`);
      
      if (pageParam === 1 || !pageParam) {
        logEvent('search_performed', { 
          query, 
          filterCount: Object.keys(filters).length,
          resultCount: result.total,
        });
      }
      
      return result;
    },
    getNextPageParam: (lastPage: SearchResponse) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: options?.enabled !== false && (!!query || Object.keys(filters).length > 0),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for search autocomplete suggestions
 */
export function useSearchSuggestions(query: string) {
  return useQuery<SearchSuggestion[], Error>({
    queryKey: ['search', 'suggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const res = await clientGet<{ suggestions: SearchSuggestion[] }>(
        phase4Client,
        `/search/suggest?q=${encodeURIComponent(query)}`
      );
      return res.suggestions || [];
    },
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook for popular/trending searches
 */
export function useTrendingSearches() {
  return useQuery<string[], Error>({
    queryKey: ['search', 'trending'],
    queryFn: async () => {
      const res = await clientGet<{ searches: string[] }>(phase4Client, '/search/trending');
      return res.searches || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook for recent searches (local storage)
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const addRecentSearch = useCallback((query: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, 10);
    });
  }, []);
  
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);
  
  return { recentSearches, addRecentSearch, clearRecentSearches };
}

/**
 * Hook for managing search state with debouncing
 */
export function useSearchState(initialFilters: SearchFilters = {}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  
  const debouncedSetQuery = useMemo(
    () => debounce((q: string) => setDebouncedQuery(q), 300),
    []
  );
  
  const updateQuery = useCallback((q: string) => {
    setQuery(q);
    debouncedSetQuery(q);
  }, [debouncedSetQuery]);
  
  const updateFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== undefined && v !== null && v !== '').length;
  }, [filters]);
  
  return {
    query,
    debouncedQuery,
    filters,
    updateQuery,
    updateFilter,
    setFilters,
    clearFilters,
    activeFilterCount,
  };
}

/**
 * Hook for search by effect/mood
 */
export function useSearchByEffect(effect: string, limit: number = 20) {
  return useQuery<SearchResult[], Error>({
    queryKey: ['search', 'effect', effect, limit],
    queryFn: async () => {
      const res = await clientGet<{ results: SearchResult[] }>(
        phase4Client,
        `/search/by-effect?effect=${encodeURIComponent(effect)}&limit=${limit}`
      );
      return res.results || [];
    },
    enabled: !!effect,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for search by terpene profile
 */
export function useSearchByTerpenes(terpenes: string[], limit: number = 20) {
  return useQuery<SearchResult[], Error>({
    queryKey: ['search', 'terpenes', terpenes, limit],
    queryFn: async () => {
      const res = await clientGet<{ results: SearchResult[] }>(
        phase4Client,
        `/search/by-terpenes?terpenes=${terpenes.join(',')}&limit=${limit}`
      );
      return res.results || [];
    },
    enabled: terpenes.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
