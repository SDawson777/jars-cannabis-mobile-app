import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export default function AnimatedPulseGlow({ color = '#8CD24C' }: { color?: string }) {
  const opacity = useSharedValue(0.4);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  return (
    <Animated.View testID="pulse-glow" style={[styles.glow, { backgroundColor: color }, style]} />
  );
}

const styles = StyleSheet.create({
  glow: { ...StyleSheet.absoluteFillObject, borderRadius: 20 },
});
