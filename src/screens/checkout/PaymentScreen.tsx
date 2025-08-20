import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';

interface Props {
  onPay: (_info: { card: string }) => void;
}

export default function PaymentScreen({ onPay }: Props) {
  const [card, setCard] = useState('');
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Card Number"
        style={styles.input}
        value={card}
        onChangeText={setCard}
        keyboardType="number-pad"
      />
      <Pressable onPress={() => onPay({ card })} style={styles.button} disabled={!card}>
        <Text style={styles.buttonText}>Pay</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  button: { backgroundColor: '#2E5D46', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
