// src/__tests__/state/accessibilityStore.test.ts
import { useAccessibilityStore, AccessibilityTextSize } from '../../state/accessibilityStore';

describe('useAccessibilityStore', () => {
  beforeEach(() => {
    // Reset to default state
    useAccessibilityStore.setState({
      textSize: 'system',
      highContrast: false,
      reduceMotion: false,
    });
  });

  describe('initial state', () => {
    it('should have default text size as system', () => {
      expect(useAccessibilityStore.getState().textSize).toBe('system');
    });

    it('should have high contrast disabled by default', () => {
      expect(useAccessibilityStore.getState().highContrast).toBe(false);
    });

    it('should have reduce motion disabled by default', () => {
      expect(useAccessibilityStore.getState().reduceMotion).toBe(false);
    });
  });

  describe('setTextSize', () => {
    it('should update text size to sm', () => {
      useAccessibilityStore.getState().setTextSize('sm');
      expect(useAccessibilityStore.getState().textSize).toBe('sm');
    });

    it('should update text size to md', () => {
      useAccessibilityStore.getState().setTextSize('md');
      expect(useAccessibilityStore.getState().textSize).toBe('md');
    });

    it('should update text size to lg', () => {
      useAccessibilityStore.getState().setTextSize('lg');
      expect(useAccessibilityStore.getState().textSize).toBe('lg');
    });

    it('should update text size to xl', () => {
      useAccessibilityStore.getState().setTextSize('xl');
      expect(useAccessibilityStore.getState().textSize).toBe('xl');
    });

    it('should update text size to system', () => {
      useAccessibilityStore.getState().setTextSize('lg');
      useAccessibilityStore.getState().setTextSize('system');
      expect(useAccessibilityStore.getState().textSize).toBe('system');
    });
  });

  describe('setHighContrast', () => {
    it('should enable high contrast', () => {
      useAccessibilityStore.getState().setHighContrast(true);
      expect(useAccessibilityStore.getState().highContrast).toBe(true);
    });

    it('should disable high contrast', () => {
      useAccessibilityStore.getState().setHighContrast(true);
      useAccessibilityStore.getState().setHighContrast(false);
      expect(useAccessibilityStore.getState().highContrast).toBe(false);
    });
  });

  describe('setReduceMotion', () => {
    it('should enable reduce motion', () => {
      useAccessibilityStore.getState().setReduceMotion(true);
      expect(useAccessibilityStore.getState().reduceMotion).toBe(true);
    });

    it('should disable reduce motion', () => {
      useAccessibilityStore.getState().setReduceMotion(true);
      useAccessibilityStore.getState().setReduceMotion(false);
      expect(useAccessibilityStore.getState().reduceMotion).toBe(false);
    });
  });

  describe('hydrate', () => {
    it('should hydrate all settings at once', () => {
      useAccessibilityStore.getState().hydrate({
        textSize: 'lg',
        highContrast: true,
        reduceMotion: true,
      });

      const state = useAccessibilityStore.getState();
      expect(state.textSize).toBe('lg');
      expect(state.highContrast).toBe(true);
      expect(state.reduceMotion).toBe(true);
    });

    it('should fallback to md for invalid text size', () => {
      useAccessibilityStore.getState().hydrate({
        textSize: 'invalid' as AccessibilityTextSize,
        highContrast: false,
        reduceMotion: false,
      });

      expect(useAccessibilityStore.getState().textSize).toBe('md');
    });

    it('should handle undefined highContrast', () => {
      useAccessibilityStore.getState().hydrate({
        textSize: 'md',
        highContrast: undefined as unknown as boolean,
        reduceMotion: false,
      });

      expect(useAccessibilityStore.getState().highContrast).toBe(false);
    });

    it('should handle undefined reduceMotion', () => {
      useAccessibilityStore.getState().hydrate({
        textSize: 'md',
        highContrast: false,
        reduceMotion: undefined as unknown as boolean,
      });

      expect(useAccessibilityStore.getState().reduceMotion).toBe(false);
    });
  });
});
