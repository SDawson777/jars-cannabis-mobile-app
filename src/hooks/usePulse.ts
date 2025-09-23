// src/hooks/usePulse.ts
import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useFeatureFlag } from '../utils/featureFlags';
import { hapticLight } from '../utils/haptic';

/**
 * Hook for a one-time "pulse" animation (scale up then back down).
 *
 * Features:
 * - Configurable duration and scale
 * - Optional haptic feedback
 * - Respects feature flags
 * - Can be disabled completely
 *
 * Usage:
 *   const { pulseStyle, triggerPulse } = usePulse();
 *   <Pressable onPress={triggerPulse}>
 *     <Animated.View style={pulseStyle}>…</Animated.View>
 *   </Pressable>
 */
export function usePulse(
  options: {
    duration?: number;
    maxScale?: number;
    enableHaptics?: boolean;
    disabled?: boolean;
  } = {}
) {
  const { duration = 150, maxScale = 1.05, enableHaptics = true, disabled = false } = options;

  const isPulseEnabled = useFeatureFlag('enableCtaPulseAnimation');
  const scale = useSharedValue(1);

  const triggerPulse = useCallback(() => {
    // Don't animate if disabled or feature flag is off
    if (disabled || !isPulseEnabled) {
      return;
    }

    // Trigger haptic feedback if enabled
    if (enableHaptics) {
      hapticLight();
    }

    // Animate the pulse
    scale.value = withSequence(
      withTiming(maxScale, {
        duration: duration / 2,
        easing: Easing.out(Easing.ease),
      }),
      withTiming(1, {
        duration: duration / 2,
        easing: Easing.in(Easing.ease),
      })
    );
  }, [duration, maxScale, scale, disabled, isPulseEnabled, enableHaptics]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    pulseStyle: isPulseEnabled && !disabled ? pulseStyle : {},
    triggerPulse,
    isPulseEnabled: isPulseEnabled && !disabled,
  };
}

/**
 * Convenience hook for CTA buttons that combines pulse with press handling
 */
export function usePulseCTA(onPress: () => void, options?: Parameters<typeof usePulse>[0]) {
  const { pulseStyle, triggerPulse, isPulseEnabled } = usePulse(options);

  const handlePress = useCallback(() => {
    if (isPulseEnabled) {
      triggerPulse();
    }
    onPress();
  }, [onPress, triggerPulse, isPulseEnabled]);

  return {
    pulseStyle,
    onPress: handlePress,
    isPulseEnabled,
  };
}
