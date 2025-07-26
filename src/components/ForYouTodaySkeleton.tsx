import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function ForYouTodaySkeleton() {
  const translateX = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 300,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [translateX]);

  return (
    <View style={styles.card}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        \
        <LinearGradient
          colors={['transparent', '#e0e0e0', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        \
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: '#ccc',
    overflow: 'hidden',
  },
});
