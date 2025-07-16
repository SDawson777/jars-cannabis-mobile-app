// src/screens/ForgotPasswordScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);
  const [email, setEmail] = useState('');

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const onSubmit = () => {
    if (!email.trim()) {
      hapticLight();
      return Alert.alert('Error', 'Please enter your email address');
    }
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // TODO: send reset link
    Alert.alert(
      'Reset Link Sent',
      'Please check your email for password reset instructions.'
    );
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          Forgot Password
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Mail color={jarsPrimary} size={48} style={{ alignSelf: 'center', marginVertical: 24 }} />
        <Text style={styles.prompt}>
          Enter your email address and we’ll send you a reset link.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#999999"
          keyboardType="email-address"
          value={email}
          onChangeText={(t) => {
            hapticLight();
            setEmail(t);
          }}
        />
        <Pressable
          style={[styles.submitBtn, { backgroundColor: jarsPrimary }]}
          onPress={onSubmit}
        >
          <Text style={styles.submitText}>Send Reset Link</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 16 },
  prompt: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 24,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
