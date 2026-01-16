// src/hooks/useAIRecommendations.ts
// AI-driven recommendations with ML models, journal data, purchase history, peer behavior
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

export interface AIRecommendation {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  score: number; // 0-1 confidence
  reason: string;
  reasoning: RecommendationReasoning[];
  category: string;
  price: number;
  thcPercent?: number;
  cbdPercent?: number;
  strainType?: 'indica' | 'sativa' | 'hybrid';
  effects?: string[];
  matchedPreferences: string[];
}

export interface RecommendationReasoning {
  type: 'preference' | 'journal' | 'purchase' | 'peer' | 'trending' | 'effect' | 'terpene';
  weight: number;
  description: string;
  confidence: number;
}

export interface UserPreferenceProfile {
  id: string;
  userId: string;
  preferredStrainTypes: { type: string; weight: number }[];
  preferredEffects: { effect: string; weight: number }[];
  preferredTerpenes: { terpene: string; weight: number }[];
  preferredCategories: { category: string; weight: number }[];
  pricePreference: { min: number; max: number; preference: 'budget' | 'mid' | 'premium' };
  thcPreference: { min: number; max: number };
  cbdPreference: { min: number; max: number };
  avoidedEffects: string[];
  medicalConditions?: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'experienced';
  lastUpdated: string;
}

export interface JournalInsight {
  id: string;
  entryId: string;
  productId: string;
  rating: number;
  effects: { name: string; intensity: number }[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  wouldRepurchase: boolean;
  createdAt: string;
}

export interface PeerRecommendation {
  productId: string;
  productName: string;
  peerScore: number;
  purchaseCount: number;
  averageRating: number;
  commonEffects: string[];
  peerSegment: string;
}

export interface RecommendationFeedback {
  recommendationId: string;
  action: 'viewed' | 'clicked' | 'purchased' | 'dismissed' | 'saved';
  rating?: number;
  helpful?: boolean;
  timestamp: string;
}

export interface ModelMetrics {
  modelVersion: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrainedAt: string;
  dataPoints: number;
}

// ============================================
// Personalized Recommendation Hooks
// ============================================

/**
 * Hook to fetch AI-powered personalized recommendations
 */
export function useAIRecommendations(options?: {
  category?: string;
  occasion?: string;
  limit?: number;
  excludeProductIds?: string[];
}) {
  return useQuery<AIRecommendation[], Error>({
    queryKey: ['ai', 'recommendations', options],
    queryFn: async () => {
      const res = await clientGet<{ recommendations: AIRecommendation[] }>(
        phase4Client,
        '/ai/recommendations',
        { params: options }
      );
      logEvent('ai_recommendations_loaded', { count: res.recommendations.length });
      return res.recommendations;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch recommendations based on a specific product
 */
export function useSimilarProducts(productId: string, limit = 6) {
  return useQuery<AIRecommendation[], Error>({
    queryKey: ['ai', 'similar', productId],
    queryFn: async () => {
      const res = await clientGet<{ recommendations: AIRecommendation[] }>(
        phase4Client,
        `/ai/recommendations/similar/${productId}`,
        { params: { limit } }
      );
      return res.recommendations;
    },
    enabled: !!productId,
  });
}

/**
 * Hook to fetch "frequently bought together" recommendations
 */
export function useFrequentlyBoughtTogether(productIds: string[]) {
  return useQuery<AIRecommendation[], Error>({
    queryKey: ['ai', 'frequently-bought', productIds],
    queryFn: async () => {
      const res = await clientPost<
        { productIds: string[] },
        { recommendations: AIRecommendation[] }
      >(phase4Client, '/ai/recommendations/frequently-bought', { productIds });
      return res.recommendations;
    },
    enabled: productIds.length > 0,
  });
}

/**
 * Hook to fetch recommendations for specific effects
 */
export function useEffectBasedRecommendations(
  effects: string[],
  intensity?: 'mild' | 'moderate' | 'strong'
) {
  return useQuery<AIRecommendation[], Error>({
    queryKey: ['ai', 'recommendations', 'effects', effects, intensity],
    queryFn: async () => {
      const res = await clientPost<
        { effects: string[]; intensity?: string },
        { recommendations: AIRecommendation[] }
      >(phase4Client, '/ai/recommendations/by-effects', { effects, intensity });
      return res.recommendations;
    },
    enabled: effects.length > 0,
  });
}

/**
 * Hook to fetch recommendations based on mood/occasion
 */
export function useMoodBasedRecommendations(mood: string) {
  return useQuery<AIRecommendation[], Error>({
    queryKey: ['ai', 'recommendations', 'mood', mood],
    queryFn: async () => {
      const res = await clientGet<{ recommendations: AIRecommendation[] }>(
        phase4Client,
        '/ai/recommendations/by-mood',
        { params: { mood } }
      );
      return res.recommendations;
    },
    enabled: !!mood,
  });
}

// ============================================
// User Preference Profile Hooks
// ============================================

/**
 * Hook to fetch user's preference profile
 */
export function usePreferenceProfile() {
  return useQuery<UserPreferenceProfile, Error>({
    queryKey: ['ai', 'preference-profile'],
    queryFn: async () => {
      return await clientGet<UserPreferenceProfile>(phase4Client, '/ai/profile');
    },
  });
}

/**
 * Hook to update preference profile
 */
export function useUpdatePreferenceProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserPreferenceProfile, Error, Partial<UserPreferenceProfile>>({
    mutationFn: async (updates: Partial<UserPreferenceProfile>) => {
      const result = await clientPost<Partial<UserPreferenceProfile>, UserPreferenceProfile>(
        phase4Client,
        '/ai/profile',
        updates
      );
      logEvent('preference_profile_updated', { fields: Object.keys(updates) });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'preference-profile'] });
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendations'] });
    },
  });
}

/**
 * Hook to reset preference profile
 */
export function useResetPreferenceProfile() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await clientPost<{}, void>(phase4Client, '/ai/profile/reset', {});
      logEvent('preference_profile_reset', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'preference-profile'] });
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendations'] });
    },
  });
}

// ============================================
// Journal-Based Insights Hooks
// ============================================

/**
 * Hook to fetch insights from journal entries
 */
export function useJournalInsights() {
  return useQuery<
    {
      insights: JournalInsight[];
      summary: {
        topEffects: { effect: string; frequency: number }[];
        topProducts: { productId: string; productName: string; rating: number }[];
        preferredStrainTypes: { type: string; percentage: number }[];
        averageRating: number;
        totalEntries: number;
      };
    },
    Error
  >({
    queryKey: ['ai', 'journal-insights'],
    queryFn: async () => {
      return await clientGet<{
        insights: JournalInsight[];
        summary: {
          topEffects: { effect: string; frequency: number }[];
          topProducts: { productId: string; productName: string; rating: number }[];
          preferredStrainTypes: { type: string; percentage: number }[];
          averageRating: number;
          totalEntries: number;
        };
      }>(phase4Client, '/ai/insights/journal');
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to generate recommendations from journal
 */
export function useJournalBasedRecommendations() {
  return useQuery<AIRecommendation[], Error>({
    queryKey: ['ai', 'recommendations', 'journal'],
    queryFn: async () => {
      const res = await clientGet<{ recommendations: AIRecommendation[] }>(
        phase4Client,
        '/ai/recommendations/from-journal'
      );
      return res.recommendations;
    },
    staleTime: 15 * 60 * 1000,
  });
}

// ============================================
// Peer Behavior Hooks
// ============================================

/**
 * Hook to fetch peer-based recommendations
 */
export function usePeerRecommendations() {
  return useQuery<PeerRecommendation[], Error>({
    queryKey: ['ai', 'recommendations', 'peer'],
    queryFn: async () => {
      const res = await clientGet<{ recommendations: PeerRecommendation[] }>(
        phase4Client,
        '/ai/recommendations/peer'
      );
      return res.recommendations;
    },
  });
}

/**
 * Hook to fetch "users like you also bought"
 */
export function useUsersAlsoBought(productId: string) {
  return useQuery<PeerRecommendation[], Error>({
    queryKey: ['ai', 'users-also-bought', productId],
    queryFn: async () => {
      const res = await clientGet<{ recommendations: PeerRecommendation[] }>(
        phase4Client,
        `/ai/recommendations/users-also-bought/${productId}`
      );
      return res.recommendations;
    },
    enabled: !!productId,
  });
}

// ============================================
// Feedback & Training Hooks
// ============================================

/**
 * Hook to submit recommendation feedback
 */
export function useRecommendationFeedback() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RecommendationFeedback>({
    mutationFn: async (feedback: RecommendationFeedback) => {
      await clientPost<RecommendationFeedback, void>(phase4Client, '/ai/feedback', feedback);
      logEvent('recommendation_feedback', {
        recommendationId: feedback.recommendationId,
        action: feedback.action,
      });
    },
    onSuccess: () => {
      // Feedback may influence future recommendations
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendations'] });
    },
  });
}

/**
 * Hook to rate a recommendation
 */
export function useRateRecommendation() {
  return useMutation<void, Error, { recommendationId: string; rating: number; helpful: boolean }>({
    mutationFn: async ({
      recommendationId,
      rating,
      helpful,
    }: {
      recommendationId: string;
      rating: number;
      helpful: boolean;
    }) => {
      await clientPost<{ rating: number; helpful: boolean }, void>(
        phase4Client,
        `/ai/recommendations/${recommendationId}/rate`,
        { rating, helpful }
      );
      logEvent('recommendation_rated', { recommendationId, rating, helpful });
    },
  });
}

/**
 * Hook to dismiss a recommendation
 */
export function useDismissRecommendation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { recommendationId: string; reason?: string }>({
    mutationFn: async ({
      recommendationId,
      reason,
    }: {
      recommendationId: string;
      reason?: string;
    }) => {
      await clientPost<{ reason?: string }, void>(
        phase4Client,
        `/ai/recommendations/${recommendationId}/dismiss`,
        { reason }
      );
      logEvent('recommendation_dismissed', { recommendationId, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'recommendations'] });
    },
  });
}

// ============================================
// Model Metrics Hooks (Admin)
// ============================================

/**
 * Hook to fetch AI model metrics
 */
export function useModelMetrics() {
  return useQuery<ModelMetrics, Error>({
    queryKey: ['ai', 'metrics'],
    queryFn: async () => {
      return await clientGet<ModelMetrics>(phase4Client, '/ai/metrics');
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to trigger model retraining (admin)
 */
export function useRetrainModel() {
  const queryClient = useQueryClient();

  return useMutation<{ jobId: string; estimatedCompletionTime: string }, Error, void>({
    mutationFn: async () => {
      const result = await clientPost<{}, { jobId: string; estimatedCompletionTime: string }>(
        phase4Client,
        '/ai/retrain',
        {}
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'metrics'] });
    },
  });
}

// ============================================
// Trending & Discovery Hooks
// ============================================

/**
 * Hook to fetch trending products
 */
export function useTrendingProducts(options?: {
  category?: string;
  timeframe?: 'day' | 'week' | 'month';
}) {
  return useQuery<AIRecommendation[], Error>({
    queryKey: ['ai', 'trending', options],
    queryFn: async () => {
      const res = await clientGet<{ products: AIRecommendation[] }>(phase4Client, '/ai/trending', {
        params: options,
      });
      return res.products;
    },
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook to fetch new discoveries based on exploration
 */
export function useDiscoveryRecommendations() {
  return useQuery<AIRecommendation[], Error>({
    queryKey: ['ai', 'discovery'],
    queryFn: async () => {
      const res = await clientGet<{ recommendations: AIRecommendation[] }>(
        phase4Client,
        '/ai/recommendations/discovery'
      );
      return res.recommendations;
    },
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to get personalized product ranking for search results
 */
export function usePersonalizedRanking(productIds: string[]) {
  return useQuery<{ productId: string; personalizedScore: number }[], Error>({
    queryKey: ['ai', 'personalized-ranking', productIds],
    queryFn: async () => {
      const res = await clientPost<
        { productIds: string[] },
        { rankings: { productId: string; personalizedScore: number }[] }
      >(phase4Client, '/ai/personalize-ranking', { productIds });
      return res.rankings;
    },
    enabled: productIds.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}
