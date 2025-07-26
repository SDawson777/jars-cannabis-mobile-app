import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  password: string;
}

export default function PasswordStrengthBar({ password }: Props) {
  const getStrength = () => {
    if (password.length > 8 && /[A-Z]/.test(password) && /\d/.test(password)) return 'strong';
    if (password.length > 5) return 'medium';
    if (password.length > 0) return 'weak';
    return 'none';
  };
  const strength = getStrength();
  const style =
    strength === 'strong'
      ? styles.green
      : strength === 'medium'
        ? styles.orange
        : strength === 'weak'
          ? styles.red
          : styles.gray;

  return <View style={[styles.bar, style]} />;
}

const styles = StyleSheet.create({
  bar: { height: 6, borderRadius: 3, marginVertical: 8 },
  gray: { backgroundColor: '#ccc' },
  red: { backgroundColor: '#f43f5e' },
  orange: { backgroundColor: '#f97316' },
  green: { backgroundColor: '#16a34a' },
});
