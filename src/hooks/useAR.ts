// src/hooks/useAR.ts
// AR/VR experiences - 3D models, AR assets, product visualization
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

export interface ARModel {
  id: string;
  productId: string;
  modelType: 'glb' | 'gltf' | 'usdz' | 'obj';
  modelUrl: string;
  thumbnailUrl: string;
  fileSize: number; // bytes
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: 'mm' | 'cm' | 'in';
  };
  scale: number;
  animations?: string[];
  createdAt: string;
}

export interface ARAsset {
  id: string;
  type: 'model' | 'texture' | 'environment' | 'animation';
  url: string;
  format: string;
  fileSize: number;
  metadata?: Record<string, unknown>;
}

export interface ARSession {
  id: string;
  productId: string;
  startedAt: string;
  duration?: number; // seconds
  interactions: ARInteraction[];
  screenshot?: string;
}

export interface ARInteraction {
  type: 'place' | 'rotate' | 'scale' | 'screenshot' | 'share' | 'add_to_cart';
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface ARCapabilities {
  supportsARKit: boolean;
  supportsARCore: boolean;
  supportsWebXR: boolean;
  recommendedFormat: 'usdz' | 'glb';
}

export interface ProductVisualization {
  productId: string;
  productName: string;
  hasARModel: boolean;
  has360View: boolean;
  hasVideo: boolean;
  arModel?: ARModel;
  images360?: string[];
  videoUrl?: string;
}

// ============================================
// AR Model Hooks
// ============================================

/**
 * Hook to fetch AR model for a product
 */
export function useARModel(productId: string) {
  return useQuery<ARModel | null, Error>({
    queryKey: ['ar', 'models', productId],
    queryFn: async () => {
      try {
        const res = await clientGet<{ model: ARModel }>(
          phase4Client,
          `/ar/models/${productId}`
        );
        return res.model;
      } catch (error: any) {
        if (error?.response?.status === 404 || error?.response?.status === 501) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!productId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to fetch all available AR models
 */
export function useARModels(options?: { category?: string; limit?: number }) {
  return useQuery<ARModel[], Error>({
    queryKey: ['ar', 'models', options],
    queryFn: async () => {
      const res = await clientGet<{ models: ARModel[] }>(
        phase4Client,
        '/ar/models',
        { params: options }
      );
      return res.models;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch AR assets for a model
 */
export function useARAssets(modelId: string) {
  return useQuery<ARAsset[], Error>({
    queryKey: ['ar', 'assets', modelId],
    queryFn: async () => {
      const res = await clientGet<{ assets: ARAsset[] }>(
        phase4Client,
        `/ar/models/${modelId}/assets`
      );
      return res.assets;
    },
    enabled: !!modelId,
  });
}

// ============================================
// AR Visualization Hooks
// ============================================

/**
 * Hook to fetch product visualization options
 */
export function useProductVisualization(productId: string) {
  return useQuery<ProductVisualization, Error>({
    queryKey: ['ar', 'visualization', productId],
    queryFn: async () => {
      return await clientGet<ProductVisualization>(
        phase4Client,
        `/ar/products/${productId}/visualization`
      );
    },
    enabled: !!productId,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to check AR capabilities of current device
 */
export function useARCapabilities() {
  return useQuery<ARCapabilities, Error>({
    queryKey: ['ar', 'capabilities'],
    queryFn: async () => {
      // Check device capabilities
      const capabilities: ARCapabilities = {
        supportsARKit: false, // iOS
        supportsARCore: false, // Android
        supportsWebXR: false,
        recommendedFormat: 'glb',
      };

      // Check for WebXR support
      if (typeof navigator !== 'undefined' && 'xr' in navigator) {
        try {
          capabilities.supportsWebXR = await (navigator as any).xr?.isSessionSupported?.('immersive-ar') || false;
        } catch {
          capabilities.supportsWebXR = false;
        }
      }

      // Platform detection (simplified)
      // In production, use react-native Platform API
      capabilities.supportsARKit = false; // Platform.OS === 'ios'
      capabilities.supportsARCore = false; // Platform.OS === 'android'
      
      capabilities.recommendedFormat = capabilities.supportsARKit ? 'usdz' : 'glb';

      return capabilities;
    },
    staleTime: Infinity, // Capabilities don't change
  });
}

// ============================================
// AR Session Hooks
// ============================================

/**
 * Hook to manage AR session state
 */
export function useARSession(productId: string) {
  const [session, setSession] = useState<ARSession | null>(null);
  const queryClient = useQueryClient();

  const startSession = useCallback(() => {
    const newSession: ARSession = {
      id: `ar-session-${Date.now()}`,
      productId,
      startedAt: new Date().toISOString(),
      interactions: [],
    };
    setSession(newSession);
    logEvent('ar_session_started', { productId });
    return newSession;
  }, [productId]);

  const recordInteraction = useCallback((interaction: Omit<ARInteraction, 'timestamp'>) => {
    if (!session) return;
    
    const newInteraction: ARInteraction = {
      ...interaction,
      timestamp: new Date().toISOString(),
    };
    
    setSession(prev => prev ? {
      ...prev,
      interactions: [...prev.interactions, newInteraction],
    } : null);

    logEvent('ar_interaction', { 
      productId, 
      sessionId: session.id,
      interactionType: interaction.type 
    });
  }, [session, productId]);

  const endSession = useCallback(async () => {
    if (!session) return;

    const duration = Math.floor(
      (Date.now() - new Date(session.startedAt).getTime()) / 1000
    );

    const finalSession = { ...session, duration };

    // Report session to backend
    try {
      await clientPost<ARSession, void>(
        phase4Client,
        '/ar/sessions',
        finalSession
      );
    } catch (e) {
      console.warn('Failed to report AR session:', e);
    }

    logEvent('ar_session_ended', { 
      productId, 
      sessionId: session.id,
      duration,
      interactionCount: session.interactions.length,
    });

    setSession(null);
    return finalSession;
  }, [session, productId]);

  const captureScreenshot = useCallback((imageData: string) => {
    if (!session) return;
    
    setSession(prev => prev ? { ...prev, screenshot: imageData } : null);
    recordInteraction({ type: 'screenshot' });
  }, [session, recordInteraction]);

  return {
    session,
    startSession,
    recordInteraction,
    endSession,
    captureScreenshot,
    isActive: !!session,
  };
}

// ============================================
// AR Content Management Hooks (Admin)
// ============================================

/**
 * Hook to upload an AR model (admin)
 */
export function useUploadARModel() {
  const queryClient = useQueryClient();

  return useMutation<ARModel, Error, {
    productId: string;
    modelFile: Blob;
    thumbnailFile?: Blob;
    dimensions?: ARModel['dimensions'];
  }>({
    mutationFn: async ({ productId, modelFile, thumbnailFile, dimensions }: {
      productId: string;
      modelFile: Blob;
      thumbnailFile?: Blob;
      dimensions?: ARModel['dimensions'];
    }) => {
      const formData = new FormData();
      formData.append('model', modelFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      if (dimensions) {
        formData.append('dimensions', JSON.stringify(dimensions));
      }

      const response = await phase4Client.post<{ model: ARModel }>(
        `/ar/models/${productId}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data.model;
    },
    onSuccess: (data: ARModel) => {
      queryClient.invalidateQueries({ queryKey: ['ar', 'models'] });
      queryClient.invalidateQueries({ queryKey: ['ar', 'models', data.productId] });
    },
  });
}

/**
 * Hook to delete an AR model (admin)
 */
export function useDeleteARModel() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { productId: string; modelId: string }>({
    mutationFn: async ({ productId, modelId }: { productId: string; modelId: string }) => {
      await phase4Client.delete(`/ar/models/${productId}/${modelId}`);
    },
    onSuccess: (_: void, variables: { productId: string; modelId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['ar', 'models'] });
      queryClient.invalidateQueries({ queryKey: ['ar', 'models', variables.productId] });
    },
  });
}

// ============================================
// AR Analytics Hooks
// ============================================

/**
 * Hook to fetch AR analytics
 */
export function useARAnalytics(dateRange: { start: string; end: string }) {
  return useQuery<{
    totalSessions: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    topProducts: { productId: string; productName: string; sessions: number }[];
    interactionBreakdown: { type: string; count: number }[];
    conversionRate: number;
    addToCartFromAR: number;
  }, Error>({
    queryKey: ['ar', 'analytics', dateRange],
    queryFn: async () => {
      return await clientGet<{
        totalSessions: number;
        uniqueUsers: number;
        averageSessionDuration: number;
        topProducts: { productId: string; productName: string; sessions: number }[];
        interactionBreakdown: { type: string; count: number }[];
        conversionRate: number;
        addToCartFromAR: number;
      }>(phase4Client, '/ar/analytics', { params: dateRange });
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// 360 View Hook
// ============================================

/**
 * Hook to fetch 360 degree product images
 */
export function useProduct360View(productId: string) {
  return useQuery<{
    productId: string;
    images: string[];
    frameCount: number;
    initialFrame: number;
    autoRotate: boolean;
  }, Error>({
    queryKey: ['ar', '360view', productId],
    queryFn: async () => {
      return await clientGet<{
        productId: string;
        images: string[];
        frameCount: number;
        initialFrame: number;
        autoRotate: boolean;
      }>(phase4Client, `/ar/products/${productId}/360`);
    },
    enabled: !!productId,
    staleTime: 60 * 60 * 1000,
  });
}
