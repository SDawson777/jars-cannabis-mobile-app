// src/components/ScreenTransition.tsx
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface ScreenTransitionProps {
  children: React.ReactNode;
  /**
   * Duration of the fade-in (and fade-out, if unmounting) in milliseconds.
   */
  duration?: number;
}

/**
 * Wrap each screen’s root in <ScreenTransition> to get a quick fade-in.
 * On unmount, it will fade out before removal.
 */
export default function ScreenTransition({ children, duration = 300 }: ScreenTransitionProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    // fade in on mount
    opacity.value = withTiming(1, { duration, easing: Easing.out(Easing.ease) });
    return () => {
      // fade out on unmount (with slight delay so navigation can start)
      opacity.value = withDelay(
        50,
        withTiming(0, { duration: duration * 0.5, easing: Easing.in(Easing.ease) })
      );
    };
  }, [duration]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.container, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
