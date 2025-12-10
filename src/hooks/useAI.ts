import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

import { apiRequest } from '../utils/apiClient';

// Types matching backend interfaces
export interface RecommendProductsRequest {
  desiredEffects: string[];
  experienceLevel: 'new' | 'regular' | 'heavy';
  budgetLevel: 'low' | 'medium' | 'high';
  preferredCategories?: string[];
}

export interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  thcPercent?: number;
  cbdPercent?: number;
  score: number;
  reasoning: string;
}

export interface RecommendationsResponse {
  recommendations: ProductRecommendation[];
  totalFound: number;
  preferences: RecommendProductsRequest;
}

export interface BudtenderRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface BudtenderResponse {
  response: string;
  timestamp: string;
  context: {
    userMessage: string;
    suggestedProducts: string[];
  };
  conversationLength: number;
}

/**
 * Hook for getting AI product recommendations
 */
export function useAiRecommendations() {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return useMutation<RecommendationsResponse, Error, RecommendProductsRequest>({
    mutationFn: async (request: RecommendProductsRequest) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      return apiRequest<RecommendationsResponse>({
        path: '/api/ai/recommend-products',
        method: 'POST',
        body: request,
        signal: controller.signal,
        retries: 2,
      });
    },
    onError: (error: Error) => {
      console.warn('AI recommendations error:', error.message);
    },
  });
}

/**
 * Hook for AI budtender chat
 */
export function useAiBudtender() {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return useMutation<BudtenderResponse, Error, BudtenderRequest>({
    mutationFn: async (request: BudtenderRequest) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      return apiRequest<BudtenderResponse>({
        path: '/api/ai/budtender',
        method: 'POST',
        body: request,
        signal: controller.signal,
        retries: 2,
      });
    },
    onError: (error: Error) => {
      console.warn('AI budtender error:', error.message);
    },
  });
}
