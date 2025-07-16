// src/screens/LoginScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';
import { useNavigation } from '@react-navigation/native';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen() {
  const navigation = useNavigation();
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleLogin = () => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // TODO: integrate actual login logic
    navigation.replace('HomeScreen');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.title, { color: jarsPrimary }]}>Welcome Back</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999999"
        keyboardType="email-address"
        value={email}
        onChangeText={(t) => {
          hapticLight();
          setEmail(t);
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999999"
        secureTextEntry
        value={password}
        onChangeText={(t) => {
          hapticLight();
          setPassword(t);
        }}
      />
      <Pressable
        style={[styles.button, { backgroundColor: jarsPrimary }]}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Log In</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          hapticLight();
          navigation.navigate('ForgotPassword');
        }}
      >
        <Text style={[styles.forgot, { color: jarsPrimary }]}>
          Forgot Password?
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  forgot: { textAlign: 'center', fontSize: 14 },
});
