import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface Props {
  message: string;
}

export default function StockAlert({ message }: Props) {
  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF4E5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  text: { color: '#B45309', fontSize: 12, textAlign: 'center' },
});
