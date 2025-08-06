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
import { AuthContext } from '../context/AuthContext';
import { hapticLight, hapticMedium, hapticHeavy } from '../utils/haptic';
import { logEvent } from '../utils/analytics';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react-native';
import AnimatedShimmerOverlay from '../components/AnimatedShimmerOverlay';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

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

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      hapticLight();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      await signIn(email, password);
      logEvent('login_success', {});
      hapticMedium();
      navigation.replace('HomeScreen');
    } catch (err: any) {
      logEvent('login_failure', { message: err.message });
      hapticHeavy();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go Back"
          onPress={() => {
            hapticLight();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            navigation.goBack();
          }}
          style={({ pressed }) => pressed && { transform: [{ scale: 0.95 }] }}
        >
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.title, { color: jarsPrimary }]}>Log In</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: focused === 'email' ? jarsPrimary : jarsSecondary,
              color: jarsPrimary,
            },
          ]}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          accessibilityLabel="Email"
          accessibilityRole="text"
        />
        <View style={styles.passwordRow}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                borderColor: focused === 'password' ? jarsPrimary : jarsSecondary,
                color: jarsPrimary,
              },
            ]}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
            accessibilityLabel="Password"
            accessibilityRole="text"
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            {showPassword ? (
              <EyeOff color={jarsSecondary} size={20} />
            ) : (
              <Eye color={jarsSecondary} size={20} />
            )}
          </Pressable>
          <AnimatedShimmerOverlay />
        </View>
        {error && <Text style={[styles.error, { color: 'red' }]}>{error}</Text>}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Forgot Password"
          onPress={() => {
            hapticLight();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            navigation.navigate('ForgotPassword');
          }}
          style={({ pressed }) => pressed && { transform: [{ scale: 0.95 }] }}
        >
          <Text style={[styles.link, { color: jarsPrimary }]}>Forgot Password?</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log In"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: jarsPrimary },
            glowStyle,
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.disclaimer, { color: jarsSecondary }]}>
            By logging in you agree to our
          </Text>
          <View style={styles.legalRow}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Terms and Conditions"
              onPress={() => {
                hapticLight();
                navigation.navigate('Legal');
              }}
            >
              <Text style={[styles.linkText, { color: jarsPrimary }]}>Terms &amp; Conditions</Text>
            </Pressable>
            <Text style={[styles.disclaimer, { color: jarsSecondary }]}> and </Text>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Privacy Policy"
              onPress={() => {
                hapticLight();
                navigation.navigate('Legal');
              }}
            >
              <Text style={[styles.linkText, { color: jarsPrimary }]}>Privacy Policy</Text>
            </Pressable>
          </View>
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
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { padding: 8 },
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
  legalRow: { flexDirection: 'row', alignItems: 'center' },
});
