// src/hooks/usePulse.ts
import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * Hook for a one-time “pulse” animation (scale up then back down).
 *
 * Usage:
 *   const { pulseStyle, triggerPulse } = usePulse();
 *   <Pressable onPress={triggerPulse}>
 *     <Animated.View style={pulseStyle}>…</Animated.View>
 *   </Pressable>
 */
export function usePulse(duration: number = 150, maxScale: number = 1.1) {
  const scale = useSharedValue(1);

  const triggerPulse = useCallback(() => {
    scale.value = withSequence(
      withTiming(maxScale, { duration, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) })
    );
  }, [duration, maxScale, scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { pulseStyle, triggerPulse };
}
