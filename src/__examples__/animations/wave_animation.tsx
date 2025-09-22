import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function WaveAnimation() {
  const waveOpacity = useSharedValue(0);
  const waveScale = useSharedValue(1);

  useEffect(() => {
    waveOpacity.value = withTiming(1, { duration: 500 });
    waveScale.value = withTiming(1.2, { duration: 500 });
  }, [waveOpacity, waveScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: waveOpacity.value,
    transform: [{ scale: waveScale.value }],
  }));

  return (
    <Animated.View style={[styles.wave, animatedStyle]}>
      {/* …your SVG or other content… */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wave: {
    width: 100,
    height: 100,
    backgroundColor: 'lightblue',
    borderRadius: 50,
  },
});
