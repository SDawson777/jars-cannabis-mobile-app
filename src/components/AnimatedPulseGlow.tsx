import React from 'react';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  withRepeat,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

export default function AnimatedPulseGlow() {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.5, { duration: 1000 }), -1, true);
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 2 - scale.value,
  }));
  return <Animated.View style={[styles.pulse, animatedStyle]} />;
}

const styles = StyleSheet.create({
  pulse: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0FFE0',
  },
});
