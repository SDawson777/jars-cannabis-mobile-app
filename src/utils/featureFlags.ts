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
 * These can be overridden by remote config, A/B testing, or user preferences
 */
const defaultFeatureFlags: FeatureFlags = {
  enableCtaPulseAnimation: true, // Enable by default for a polished feel
  enableEnhancedHaptics: true,
  enableTerpeneAnimations: false, // Keep disabled until fully tested
};

/**
 * Get the current feature flag _values
 * In the future, this could be enhanced to fetch from:
 * - Remote config service (Firebase Remote Config)
 * - A/B testing platform
 * - User preferences/settings
 * - Environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  // For now, return the defaults
  // TODO: Add remote config integration
  return { ...defaultFeatureFlags };
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
 */
export function useFeatureFlags(): FeatureFlags {
  // For now, just return the flags directly
  // In the future, this could be enhanced to:
  // - Subscribe to remote config updates
  // - Handle loading states
  // - Cache flags for performance
  return getFeatureFlags();
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const flags = useFeatureFlags();
  return flags[flag];
}
