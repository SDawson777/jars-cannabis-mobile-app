import React from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';

export default function AnimatedShimmerOverlay() {
  const translateX = React.useRef(new Animated.Value(-200)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 200,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { transform: [{ translateX }] }]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
