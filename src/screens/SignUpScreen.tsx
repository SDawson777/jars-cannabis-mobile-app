// src/screens/SignUpScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SignUpNavProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  // Background based on time/weather
  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  // Glow effect for the sign-up button
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

  const handleSignUp = () => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // TODO: implement real signup logic
    navigation.replace('HomeScreen');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.title, { color: jarsPrimary }]}>
        Create Account
      </Text>

      <TextInput
        style={[styles.input, { borderColor: jarsSecondary, color: jarsPrimary }]}
        placeholder="Full Name"
        placeholderTextColor={jarsSecondary}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, { borderColor: jarsSecondary, color: jarsPrimary }]}
        placeholder="Email"
        placeholderTextColor={jarsSecondary}
        keyboardType="email-address"
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

      <Pressable
        style={[styles.button, { backgroundColor: jarsPrimary }, glowStyle]}
        onPress={handleSignUp}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: jarsSecondary }]}>
          Already have an account?
        </Text>
        <Pressable
          onPress={() => {
            hapticLight();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            navigation.replace('Login');
          }}
        >
          <Text style={[styles.linkText, { color: jarsPrimary }]}>
            Log In
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    marginRight: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
