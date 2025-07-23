// src/screens/LoginScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext, User } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
interface AuthResponse {
  token: string;
  user: User;
}

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const { setToken, setUser } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const glowStyle =
    colorTemp === 'warm'
      ? {
          shadowColor: jarsPrimary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }
      : colorTemp === 'cool'
        ? {
            shadowColor: '#00A4FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }
        : {};

  const loginMutation = useMutation<AuthResponse, Error, void>({
    mutationFn: async () => {
      // Use phase4Client for consistency
      const { data } = await phase4Client.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      return data;
    },
    onSuccess: async ({ token, user }) => {
      hapticMedium();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await setToken(token);
      await setUser(user);
      navigation.replace('HomeScreen');
    },
    onError: err => {
      hapticLight();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Alert.alert('Login failed', err.message);
    },
  });

  const handleLogin = () => loginMutation.mutate();

  const isPending = loginMutation.status === 'pending';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            hapticLight();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            navigation.goBack();
          }}
        >
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.title, { color: jarsPrimary }]}>Log In</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, { borderColor: jarsSecondary, color: jarsPrimary }]}
          placeholder="Email"
          placeholderTextColor={jarsSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, { borderColor: jarsSecondary, color: jarsPrimary }]}
          placeholder="Password"
          placeholderTextColor={jarsSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {loginMutation.error && (
          <Text style={[styles.error, { color: 'red' }]}>{loginMutation.error.message}</Text>
        )}

        <Pressable
          onPress={() => {
            hapticLight();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            navigation.navigate('ForgotPassword');
          }}
        >
          <Text style={[styles.link, { color: jarsPrimary }]}>Forgot Password?</Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: jarsPrimary }, glowStyle]}
          onPress={handleLogin}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.disclaimer, { color: jarsSecondary }]}>
            By logging in you agree to our
          </Text>
          <Pressable
            onPress={() => {
              hapticLight();
              navigation.navigate('Legal');
            }}
          >
            <Text style={[styles.linkText, { color: jarsPrimary }]}>Terms & Privacy</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  title: { fontSize: 24, fontWeight: '700' },
  form: { flex: 1 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  link: { textAlign: 'right', marginBottom: 24, fontWeight: '500' },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  error: { marginBottom: 12, textAlign: 'center' },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  disclaimer: { fontSize: 12, textAlign: 'center', marginBottom: 4 },
  linkText: { fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
});
