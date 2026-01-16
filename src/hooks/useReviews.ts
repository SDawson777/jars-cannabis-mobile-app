// src/hooks/useReviews.ts
// Hooks for product reviews API
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';

export interface Review {
  id: string;
  userId: string;
  userName?: string;
  productId: string;
  rating: number;
  text?: string;
  createdAt: string;
  updatedAt?: string;
  verified?: boolean;
  helpful?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
  ratingDistribution?: Record<number, number>;
}

export interface CreateReviewPayload {
  rating: number;
  text?: string;
}

/**
 * Hook to fetch reviews for a product
 */
export function useProductReviews(
  productId: string,
  options?: { limit?: number; offset?: number }
) {
  return useQuery<ReviewsResponse, Error>({
    queryKey: ['reviews', productId, options?.limit, options?.offset],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.offset) params.append('offset', String(options.offset));

      const url = `/products/${productId}/reviews${params.toString() ? `?${params}` : ''}`;
      return clientGet<ReviewsResponse>(phase4Client, url);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to post a new review
 */
export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation<Review, Error, CreateReviewPayload>({
    mutationFn: async (payload: CreateReviewPayload) => {
      const result = await clientPost<CreateReviewPayload, Review>(
        phase4Client,
        `/products/${productId}/reviews`,
        payload
      );
      logEvent('review_submitted', { productId, rating: payload.rating });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });
}

/**
 * Hook to mark a review as helpful
 */
export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { reviewId: string; productId: string }>({
    mutationFn: async ({ reviewId }: { reviewId: string; productId: string }) => {
      await clientPost<object, void>(phase4Client, `/reviews/${reviewId}/helpful`, {});
    },
    onSuccess: (_data: void, variables: { reviewId: string; productId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
    },
  });
}
