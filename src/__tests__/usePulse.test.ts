import { renderHook, act } from '@testing-library/react-native';
import { usePulse, usePulseCTA } from '../hooks/usePulse';
import * as hapticUtils from '../utils/haptic';
import * as featureFlags from '../utils/featureFlags';

// Mock dependencies
jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('../utils/featureFlags', () => ({
  useFeatureFlag: jest.fn(),
}));

jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((value) => ({ value })),
  useAnimatedStyle: jest.fn((styleFunction) => styleFunction()),
  withSequence: jest.fn((anim1, anim2) => [anim1, anim2]),
  withTiming: jest.fn((value, config) => ({ value, config })),
  Easing: {
    out: jest.fn((easing) => easing),
    in: jest.fn((easing) => easing),
    ease: 'ease',
  },
}));

describe('usePulse Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (featureFlags.useFeatureFlag as jest.Mock).mockReturnValue(true);
  });

  describe('default behavior', () => {
    it('should return pulse style and trigger function', () => {
      const { result } = renderHook(() => usePulse());
      
      expect(result.current).toHaveProperty('pulseStyle');
      expect(result.current).toHaveProperty('triggerPulse');
      expect(result.current).toHaveProperty('isPulseEnabled');
      expect(typeof result.current.triggerPulse).toBe('function');
    });

    it('should have pulse enabled when feature flag is true', () => {
      (featureFlags.useFeatureFlag as jest.Mock).mockReturnValue(true);
      
      const { result } = renderHook(() => usePulse());
      
      expect(result.current.isPulseEnabled).toBe(true);
    });

    it('should have pulse disabled when feature flag is false', () => {
      (featureFlags.useFeatureFlag as jest.Mock).mockReturnValue(false);
      
      const { result } = renderHook(() => usePulse());
      
      expect(result.current.isPulseEnabled).toBe(false);
      expect(result.current.pulseStyle).toEqual({});
    });
  });

  describe('triggerPulse function', () => {
    it('should trigger haptic feedback by default', () => {
      const { result } = renderHook(() => usePulse());
      
      act(() => {
        result.current.triggerPulse();
      });
      
      expect(hapticUtils.hapticLight).toHaveBeenCalledTimes(1);
    });

    it('should not trigger haptic feedback when disabled', () => {
      const { result } = renderHook(() => usePulse({ enableHaptics: false }));
      
      act(() => {
        result.current.triggerPulse();
      });
      
      expect(hapticUtils.hapticLight).not.toHaveBeenCalled();
    });

    it('should not animate when pulse is disabled', () => {
      const { result } = renderHook(() => usePulse({ disabled: true }));
      
      act(() => {
        result.current.triggerPulse();
      });
      
      expect(hapticUtils.hapticLight).not.toHaveBeenCalled();
    });

    it('should not animate when feature flag is disabled', () => {
      (featureFlags.useFeatureFlag as jest.Mock).mockReturnValue(false);
      
      const { result } = renderHook(() => usePulse());
      
      act(() => {
        result.current.triggerPulse();
      });
      
      expect(hapticUtils.hapticLight).not.toHaveBeenCalled();
    });
  });

  describe('configuration options', () => {
    it('should accept custom duration', () => {
      const { result } = renderHook(() => usePulse({ duration: 300 }));
      
      expect(result.current.triggerPulse).toBeInstanceOf(Function);
    });

    it('should accept custom maxScale', () => {
      const { result } = renderHook(() => usePulse({ maxScale: 1.2 }));
      
      expect(result.current.triggerPulse).toBeInstanceOf(Function);
    });

    it('should accept enableHaptics option', () => {
      const { result } = renderHook(() => usePulse({ enableHaptics: false }));
      
      act(() => {
        result.current.triggerPulse();
      });
      
      expect(hapticUtils.hapticLight).not.toHaveBeenCalled();
    });

    it('should accept disabled option', () => {
      const { result } = renderHook(() => usePulse({ disabled: true }));
      
      expect(result.current.isPulseEnabled).toBe(false);
    });
  });

  describe('default values', () => {
    it('should use default values when no options provided', () => {
      const { result } = renderHook(() => usePulse());
      
      // Trigger should work with defaults
      act(() => {
        result.current.triggerPulse();
      });
      
      expect(hapticUtils.hapticLight).toHaveBeenCalled();
    });

    it('should use default values for partial options', () => {
      const { result } = renderHook(() => usePulse({ duration: 200 }));
      
      // Should still trigger haptics (default enableHaptics: true)
      act(() => {
        result.current.triggerPulse();
      });
      
      expect(hapticUtils.hapticLight).toHaveBeenCalled();
    });
  });
});

describe('usePulseCTA Hook', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnPress.mockClear();
    (featureFlags.useFeatureFlag as jest.Mock).mockReturnValue(true);
  });

  describe('basic functionality', () => {
    it('should return pulse style and press handler', () => {
      const { result } = renderHook(() => usePulseCTA(mockOnPress));
      
      expect(result.current).toHaveProperty('pulseStyle');
      expect(result.current).toHaveProperty('onPress');
      expect(result.current).toHaveProperty('isPulseEnabled');
      expect(typeof result.current.onPress).toBe('function');
    });

    it('should call original onPress when invoked', () => {
      const { result } = renderHook(() => usePulseCTA(mockOnPress));
      
      act(() => {
        result.current.onPress();
      });
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger pulse animation when pressed', () => {
      const { result } = renderHook(() => usePulseCTA(mockOnPress));
      
      act(() => {
        result.current.onPress();
      });
      
      expect(hapticUtils.hapticLight).toHaveBeenCalledTimes(1);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('with pulse disabled', () => {
    it('should still call onPress when pulse is disabled', () => {
      (featureFlags.useFeatureFlag as jest.Mock).mockReturnValue(false);
      
      const { result } = renderHook(() => usePulseCTA(mockOnPress));
      
      act(() => {
        result.current.onPress();
      });
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(hapticUtils.hapticLight).not.toHaveBeenCalled();
    });

    it('should not trigger haptics when pulse disabled', () => {
      const { result } = renderHook(() => usePulseCTA(mockOnPress, { disabled: true }));
      
      act(() => {
        result.current.onPress();
      });
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(hapticUtils.hapticLight).not.toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should accept pulse options', () => {
      const { result } = renderHook(() => 
        usePulseCTA(mockOnPress, { duration: 300, maxScale: 1.2 })
      );
      
      act(() => {
        result.current.onPress();
      });
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(hapticUtils.hapticLight).toHaveBeenCalledTimes(1);
    });

    it('should respect haptics setting', () => {
      const { result } = renderHook(() => 
        usePulseCTA(mockOnPress, { enableHaptics: false })
      );
      
      act(() => {
        result.current.onPress();
      });
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(hapticUtils.hapticLight).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle onPress throwing errors', () => {
      const throwingOnPress = jest.fn(() => {
        throw new Error('Test error');
      });
      
      const { result } = renderHook(() => usePulseCTA(throwingOnPress));
      
      expect(() => {
        act(() => {
          result.current.onPress();
        });
      }).toThrow('Test error');
      
      expect(throwingOnPress).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined onPress', () => {
      const { result } = renderHook(() => usePulseCTA(undefined as any));
      
      expect(() => {
        act(() => {
          result.current.onPress();
        });
      }).toThrow();
    });
  });
});