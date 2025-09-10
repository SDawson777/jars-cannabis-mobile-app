import { getFeatureFlags, isFeatureEnabled, useFeatureFlags, useFeatureFlag } from '../utils/featureFlags';
import { renderHook } from '@testing-library/react-native';

describe('Feature Flags', () => {
  describe('getFeatureFlags', () => {
    it('should return default feature flags', () => {
      const flags = getFeatureFlags();
      
      expect(flags).toHaveProperty('enableCtaPulseAnimation');
      expect(flags).toHaveProperty('enableEnhancedHaptics');
      expect(flags).toHaveProperty('enableTerpeneAnimations');
      
      expect(typeof flags.enableCtaPulseAnimation).toBe('boolean');
      expect(typeof flags.enableEnhancedHaptics).toBe('boolean');
      expect(typeof flags.enableTerpeneAnimations).toBe('boolean');
    });

    it('should return consistent values across calls', () => {
      const flags1 = getFeatureFlags();
      const flags2 = getFeatureFlags();
      
      expect(flags1).toEqual(flags2);
    });

    it('should have expected default values', () => {
      const flags = getFeatureFlags();
      
      expect(flags.enableCtaPulseAnimation).toBe(true);
      expect(flags.enableEnhancedHaptics).toBe(true);
      expect(flags.enableTerpeneAnimations).toBe(false);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return correct values for known flags', () => {
      expect(isFeatureEnabled('enableCtaPulseAnimation')).toBe(true);
      expect(isFeatureEnabled('enableEnhancedHaptics')).toBe(true);
      expect(isFeatureEnabled('enableTerpeneAnimations')).toBe(false);
    });

    it('should be consistent with getFeatureFlags', () => {
      const flags = getFeatureFlags();
      
      expect(isFeatureEnabled('enableCtaPulseAnimation')).toBe(flags.enableCtaPulseAnimation);
      expect(isFeatureEnabled('enableEnhancedHaptics')).toBe(flags.enableEnhancedHaptics);
      expect(isFeatureEnabled('enableTerpeneAnimations')).toBe(flags.enableTerpeneAnimations);
    });
  });

  describe('useFeatureFlags hook', () => {
    it('should return feature flags object', () => {
      const { result } = renderHook(() => useFeatureFlags());
      
      expect(result.current).toHaveProperty('enableCtaPulseAnimation');
      expect(result.current).toHaveProperty('enableEnhancedHaptics');
      expect(result.current).toHaveProperty('enableTerpeneAnimations');
    });

    it('should return same values as getFeatureFlags', () => {
      const { result } = renderHook(() => useFeatureFlags());
      const directFlags = getFeatureFlags();
      
      expect(result.current).toEqual(directFlags);
    });
  });

  describe('useFeatureFlag hook', () => {
    it('should return correct value for enableCtaPulseAnimation', () => {
      const { result } = renderHook(() => useFeatureFlag('enableCtaPulseAnimation'));
      
      expect(result.current).toBe(true);
    });

    it('should return correct value for enableEnhancedHaptics', () => {
      const { result } = renderHook(() => useFeatureFlag('enableEnhancedHaptics'));
      
      expect(result.current).toBe(true);
    });

    it('should return correct value for enableTerpeneAnimations', () => {
      const { result } = renderHook(() => useFeatureFlag('enableTerpeneAnimations'));
      
      expect(result.current).toBe(false);
    });

    it('should be consistent with isFeatureEnabled', () => {
      const { result: pulseResult } = renderHook(() => useFeatureFlag('enableCtaPulseAnimation'));
      const { result: hapticsResult } = renderHook(() => useFeatureFlag('enableEnhancedHaptics'));
      const { result: terpeneResult } = renderHook(() => useFeatureFlag('enableTerpeneAnimations'));
      
      expect(pulseResult.current).toBe(isFeatureEnabled('enableCtaPulseAnimation'));
      expect(hapticsResult.current).toBe(isFeatureEnabled('enableEnhancedHaptics'));
      expect(terpeneResult.current).toBe(isFeatureEnabled('enableTerpeneAnimations'));
    });
  });

  describe('TypeScript types', () => {
    it('should allow valid feature flag keys', () => {
      // These should compile without TypeScript errors
      const validKeys: Array<keyof import('../utils/featureFlags').FeatureFlags> = [
        'enableCtaPulseAnimation',
        'enableEnhancedHaptics',
        'enableTerpeneAnimations',
      ];
      
      validKeys.forEach(key => {
        expect(typeof isFeatureEnabled(key)).toBe('boolean');
      });
    });
  });

  describe('future extensibility', () => {
    it('should be easy to add new feature flags', () => {
      // This test documents the expected structure for future flags
      const flags = getFeatureFlags();
      
      // All flags should be boolean
      Object.values(flags).forEach(value => {
        expect(typeof value).toBe('boolean');
      });
      
      // Should be a flat object
      expect(Array.isArray(flags)).toBe(false);
      expect(flags.constructor).toBe(Object);
    });
  });
});