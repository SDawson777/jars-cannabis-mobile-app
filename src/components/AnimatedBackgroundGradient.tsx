import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function AnimatedBackgroundGradient({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient colors={['#F9F9F9', '#EEE']} style={styles.fill}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
