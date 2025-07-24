import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calculateProgress } from '../utils/progress';

export interface PointsProgressProps {
  current: number;
  target: number;
}

export default function PointsProgressBar({ current, target }: PointsProgressProps) {
  const progress = calculateProgress(current, target);
  return (
    <View style={styles.container} testID="points-progress">
      <View style={[styles.bar, { width: `${progress * 100}%` }]} />
      <Text style={styles.label}>
        {current} / {target} pts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 12,
    backgroundColor: '#EFEFEF',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
  },
  bar: {
    height: '100%',
    backgroundColor: '#8CD24C',
  },
  label: {
    position: 'absolute',
    right: 4,
    top: -18,
    fontSize: 12,
    color: '#333',
  },
});
