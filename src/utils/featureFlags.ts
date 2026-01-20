import { useState, useEffect } from 'react';

/**
 * Feature flags for experimental and optional app features
 */
export interface FeatureFlags {
  /** Enable pulse animation on CTA buttons for enhanced user feedback */
  enableCtaPulseAnimation: boolean;
  /** Enable enhanced haptic feedback patterns */
  enableEnhancedHaptics: boolean;
  /** Enable experimental terpene wheel animations */
  enableTerpeneAnimations: boolean;
}

/**
 * Default feature flag configuration
 * These are the fallback values when remote config is unavailable
 */
const defaultFeatureFlags: FeatureFlags = {
  enableCtaPulseAnimation: true,
  enableEnhancedHaptics: true,
  enableTerpeneAnimations: false,
};

// In-memory cache for remote config values
let cachedFlags: FeatureFlags | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetch feature flags from Firebase Remote Config or CMS
 * Falls back to defaults on error or when unavailable
 */
async function fetchRemoteFlags(): Promise<FeatureFlags> {
  try {
    // Attempt to fetch from CMS/backend feature flags endpoint
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || ''}/api/v1/config/feature-flags`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        enableCtaPulseAnimation:
          data.enableCtaPulseAnimation ?? defaultFeatureFlags.enableCtaPulseAnimation,
        enableEnhancedHaptics:
          data.enableEnhancedHaptics ?? defaultFeatureFlags.enableEnhancedHaptics,
        enableTerpeneAnimations:
          data.enableTerpeneAnimations ?? defaultFeatureFlags.enableTerpeneAnimations,
      };
    }
  } catch {
    // Silent fail - use defaults
  }
  return { ...defaultFeatureFlags };
}

/**
 * Get the current feature flag values
 * Returns cached values if available and fresh, otherwise returns defaults
 * Use useFeatureFlags() hook for React components to get live updates
 */
export function getFeatureFlags(): FeatureFlags {
  // Return cached flags if fresh
  if (cachedFlags && Date.now() - lastFetchTime < CACHE_TTL_MS) {
    return cachedFlags;
  }
  // Return defaults synchronously, cache will be updated async
  return { ...defaultFeatureFlags };
}

/**
 * Initialize feature flags by fetching from remote config
 * Call this early in app startup
 */
export async function initializeFeatureFlags(): Promise<FeatureFlags> {
  cachedFlags = await fetchRemoteFlags();
  lastFetchTime = Date.now();
  return cachedFlags;
}

/**
 * Check if a specific feature flag is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag];
}

/**
 * Hook to get feature flags in React components
 * Fetches remote config on mount and caches the result
 */
export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());

  useEffect(() => {
    let mounted = true;

    // Fetch remote flags if cache is stale
    if (!cachedFlags || Date.now() - lastFetchTime >= CACHE_TTL_MS) {
      initializeFeatureFlags().then(remoteFlags => {
        if (mounted) {
          setFlags(remoteFlags);
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  return flags;
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const flags = useFeatureFlags();
  return flags[flag];
}
