// src/hooks/useRecommendations.ts
// Fetches personalized recommendations from the backend
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import type { CMSProduct } from '../types/cms';

export interface RecommendationItem {
  id: string;
  slug?: string;
  title?: string;
  type: 'product' | 'article' | 'deal' | 'category';
  score: number;
  reasons?: string[];
  product?: CMSProduct;
}

export interface ForYouResponse {
  items: CMSProduct[];
  source?: 'personalized' | 'popular' | 'new';
}

export interface RelatedResponse {
  items: CMSProduct[];
}

export interface PersonalizationContext {
  userId?: string;
  sessionId?: string;
  locationState?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  preferences?: Record<string, any>;
  recentViews?: string[];
  purchaseHistory?: string[];
}

export interface WayToShop {
  id: string;
  label: string;
  icon?: string;
}

/**
 * Hook to fetch "For You" personalized recommendations
 */
export function useForYouRecommendations(storeId?: string) {
  return useQuery<ForYouResponse, Error>({
    queryKey: ['recommendations', 'for-you', storeId],
    queryFn: async () => {
      const url = `/recommendations/for-you${storeId ? `?storeId=${storeId}` : ''}`;
      return clientGet<ForYouResponse>(phase4Client, url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Hook to fetch related products for a given product
 */
export function useRelatedProducts(productId: string, storeId?: string) {
  return useQuery<RelatedResponse, Error>({
    queryKey: ['recommendations', 'related', productId, storeId],
    queryFn: async () => {
      const url = `/recommendations/related/${productId}${storeId ? `?storeId=${storeId}` : ''}`;
      return clientGet<RelatedResponse>(phase4Client, url);
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch trending/popular products
 */
export function useTrendingProducts(limit: number = 10) {
  return useQuery<CMSProduct[], Error>({
    queryKey: ['recommendations', 'trending', limit],
    queryFn: async () => {
      try {
        const res = await phase4Client.get<{ items: CMSProduct[] }>('/recommendations/trending', {
          params: { limit },
        });
        return res.data?.items || [];
      } catch {
        // Fallback to products endpoint sorted by popularity
        const res = await phase4Client.get<{ items: CMSProduct[] }>('/api/v1/products', {
          params: { sort: 'popular', limit },
        });
        return res.data?.items || [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to apply personalization scoring to content
 */
export function useApplyPersonalizationScoring() {
  const queryClient = useQueryClient();
  
  return useMutation<
    RecommendationItem[],
    Error,
    { contentType: 'article' | 'deal' | 'productCategory'; slugs: string[]; context?: PersonalizationContext }
  >({
    mutationFn: async ({ contentType, slugs, context }: { contentType: 'article' | 'deal' | 'productCategory'; slugs: string[]; context?: PersonalizationContext }) => {
      const res = await clientPost<any, { items: RecommendationItem[] }>(
        phase4Client,
        '/personalization/apply',
        {
          contentType,
          slugs,
          channel: 'mobile',
          ...context,
        }
      );
      return res.items || [];
    },
    onSuccess: () => {
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

/**
 * Hook to fetch "Ways to Shop" options
 * Combines personalized categories with static options
 */
export function useWaysToShop(userId?: string) {
  return useQuery<WayToShop[], Error>({
    queryKey: ['ways-to-shop', userId],
    queryFn: async () => {
      // Base ways to shop
      const baseWays = [
        { id: 'deals', label: 'Shop Deals', icon: '🏷️' },
        { id: 'popular', label: 'Shop Popular', icon: '🔥' },
        { id: 'effects', label: 'Shop by Effects', icon: '✨' },
        { id: 'new', label: 'New Arrivals', icon: '🆕' },
      ];

      // Try to get personalized ways based on user preferences
      if (userId) {
        try {
          const res = await phase4Client.get<{ ways: Array<{ id: string; label: string; icon?: string }> }>(
            '/recommendations/ways-to-shop',
            { params: { userId } }
          );
          if (res.data?.ways?.length) {
            return res.data.ways;
          }
        } catch {
          // Fall through to base ways
        }
      }

      return baseWays;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
