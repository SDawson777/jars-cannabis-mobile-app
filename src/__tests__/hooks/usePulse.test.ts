import { renderHook, act } from '@testing-library/react-native';
import { usePulse, usePulseCTA } from '../../hooks/usePulse';

// Mock dependencies
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(() => ({ value: 1 })),
  useAnimatedStyle: jest.fn(cb => cb()),
  withSequence: jest.fn((...args) => args),
  withTiming: jest.fn(val => val),
  Easing: {
    out: jest.fn(fn => fn),
    in: jest.fn(fn => fn),
    ease: jest.fn(),
  },
}));

jest.mock('../../utils/featureFlags', () => ({
  useFeatureFlag: jest.fn(() => true),
}));

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

const { useFeatureFlag } = require('../../utils/featureFlags');
const { hapticLight } = require('../../utils/haptic');

describe('usePulse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFeatureFlag as jest.Mock).mockReturnValue(true);
  });

  it('returns pulseStyle and triggerPulse function', () => {
    const { result } = renderHook(() => usePulse());
    expect(result.current.pulseStyle).toBeDefined();
    expect(typeof result.current.triggerPulse).toBe('function');
    expect(result.current.isPulseEnabled).toBe(true);
  });

  it('triggers haptic feedback on pulse', () => {
    const { result } = renderHook(() => usePulse());

    act(() => {
      result.current.triggerPulse();
    });

    expect(hapticLight).toHaveBeenCalled();
  });

  it('does not trigger haptic when enableHaptics is false', () => {
    const { result } = renderHook(() => usePulse({ enableHaptics: false }));

    act(() => {
      result.current.triggerPulse();
    });

    expect(hapticLight).not.toHaveBeenCalled();
  });

  it('respects disabled option', () => {
    const { result } = renderHook(() => usePulse({ disabled: true }));

    expect(result.current.isPulseEnabled).toBe(false);
    expect(result.current.pulseStyle).toEqual({});
  });

  it('respects feature flag', () => {
    (useFeatureFlag as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => usePulse());

    expect(result.current.isPulseEnabled).toBe(false);
  });

  it('does not trigger animation when feature flag is off', () => {
    (useFeatureFlag as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => usePulse());

    act(() => {
      result.current.triggerPulse();
    });

    expect(hapticLight).not.toHaveBeenCalled();
  });

  it('accepts custom duration and maxScale', () => {
    const { result } = renderHook(() => usePulse({ duration: 200, maxScale: 1.1 }));

    expect(result.current.pulseStyle).toBeDefined();
  });
});

describe('usePulseCTA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFeatureFlag as jest.Mock).mockReturnValue(true);
  });

  it('returns pulseStyle and onPress', () => {
    const mockOnPress = jest.fn();
    const { result } = renderHook(() => usePulseCTA(mockOnPress));

    expect(result.current.pulseStyle).toBeDefined();
    expect(typeof result.current.onPress).toBe('function');
  });

  it('calls original onPress handler', () => {
    const mockOnPress = jest.fn();
    const { result } = renderHook(() => usePulseCTA(mockOnPress));

    act(() => {
      result.current.onPress();
    });

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('triggers pulse animation and onPress together', () => {
    const mockOnPress = jest.fn();
    const { result } = renderHook(() => usePulseCTA(mockOnPress));

    act(() => {
      result.current.onPress();
    });

    expect(hapticLight).toHaveBeenCalled();
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('still calls onPress when pulse is disabled', () => {
    (useFeatureFlag as jest.Mock).mockReturnValue(false);
    const mockOnPress = jest.fn();
    const { result } = renderHook(() => usePulseCTA(mockOnPress));

    act(() => {
      result.current.onPress();
    });

    expect(mockOnPress).toHaveBeenCalled();
    expect(hapticLight).not.toHaveBeenCalled();
  });
});
