import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  LayoutAnimation,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { hapticLight, hapticMedium, hapticHeavy } from '../utils/haptic';
import { logEvent } from '../utils/analytics';
import { useAuth } from '../hooks/useAuth';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'OTPScreen'>;

export default function OTPScreen() {
  const navigation = useNavigation<NavProp>();
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const inputs: Array<TextInput | null> = [];
  const [focused, setFocused] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTimer(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (i: number, v: string) => {
    if (/^\d?$/.test(v)) {
      const next = [...code];
      next[i] = v;
      setCode(next);
      if (v && inputs[i + 1]) inputs[i + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otp = code.join('');
    if (otp.length !== 6) return;
    try {
      await verifyOtp(otp);
      logEvent('otp_verified', {});
      hapticMedium();
      navigation.replace('HomeScreen');
    } catch (err) {
      hapticHeavy();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Enter Code</Text>
      <View style={styles.row}>
        {code.map((d, i) => (
          <TextInput
            key={i}
            ref={ref => {
              inputs[i] = ref;
            }}
            style={[styles.input, { borderColor: focused === i ? '#2E5D46' : '#ccc' }]}
            keyboardType="number-pad"
            maxLength={1}
            value={d}
            onChangeText={v => handleChange(i, v)}
            onFocus={() => setFocused(i)}
            onBlur={() => setFocused(null)}
            accessibilityLabel={`Digit ${i + 1}`}
            accessibilityRole="text"
          />
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Verify Code"
        style={({ pressed }) => [styles.verifyBtn, pressed && { transform: [{ scale: 0.95 }] }]}
        onPress={handleSubmit}
      >
        <Text style={styles.verifyText}>Verify</Text>
      </Pressable>
      {timer === 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Resend Code"
          onPress={() => setTimer(60)}
          style={({ pressed }) => pressed && { transform: [{ scale: 0.95 }] }}
        >
          <Text style={styles.resend}>Resend code</Text>
        </Pressable>
      ) : (
        <Text style={styles.countdown}>Resend in {timer}s</Text>
      )}
      <Text style={styles.disclaimer}>
        By verifying your identity you agree to our Terms &amp; Conditions and Privacy Policy.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, marginBottom: 16, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: 40,
    height: 40,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
  },
  verifyBtn: {
    backgroundColor: '#2E5D46',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  verifyText: { color: '#FFF', fontWeight: '600' },
  resend: { color: '#2E5D46', marginTop: 8 },
  countdown: { marginTop: 8, color: '#555' },
  disclaimer: { marginTop: 16, fontSize: 12, textAlign: 'center', color: '#555' },
});
