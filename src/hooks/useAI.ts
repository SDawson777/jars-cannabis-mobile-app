import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { fetchJson } from '../utils/apiClient';

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

  const mutation = useMutation<RecommendationsResponse, Error, RecommendProductsRequest>({
    mutationFn: async (request: RecommendProductsRequest) => {
      const controller = new AbortController();
      controllerRef.current = controller;

      const resp = await fetchJson<RecommendationsResponse>(
        `${process.env.EXPO_PUBLIC_API_URL}/api/ai/recommend-products`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: controller.signal,
        }
      );

      return resp;
    },
    onError: (error: Error) => {
      console.warn('AI recommendations error:', error.message);
    },
  });

  return {
    ...mutation,
    cancel: () => controllerRef.current?.abort(),
  };
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

  const mutation = useMutation<BudtenderResponse, Error, BudtenderRequest>({
    mutationFn: async (request: BudtenderRequest) => {
      const controller = new AbortController();
      controllerRef.current = controller;

      const resp = await fetchJson<BudtenderResponse>(
        `${process.env.EXPO_PUBLIC_API_URL}/api/ai/budtender`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: controller.signal,
        }
      );

      return resp;
    },
    onError: (error: Error) => {
      console.warn('AI budtender error:', error.message);
    },
  });

  return {
    ...mutation,
    cancel: () => controllerRef.current?.abort(),
  };
}
