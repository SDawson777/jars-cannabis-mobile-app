import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export default function ScreenReaderOnly({ children }: Props) {
  return (
    <Text accessible accessibilityRole="text" style={styles.srOnly}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  srOnly: {
    position: 'absolute',
    height: 1,
    width: 1,
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: 'hidden',
    opacity: 0,
  },
});
