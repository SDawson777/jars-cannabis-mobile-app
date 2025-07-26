import React, { useContext } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { RootStackParamList } from '../navigation/types';
import Button from '../components/Button';
import AnimatedPulseGlow from '../components/AnimatedPulseGlow';
import { ThemeContext } from '../context/ThemeContext';
import { hapticMedium } from '../utils/haptic';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'LoginSignUpDecision'>;

export default function LoginSignUpDecisionScreen() {
  const navigation = useNavigation<NavProp>();
  const { jarsPrimary, jarsBackground } = useContext(ThemeContext);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: jarsBackground }]}>
      <Animated.View entering={FadeInUp.duration(400)} style={styles.inner}>
        <Text style={[styles.title, { color: jarsPrimary }]}>Welcome</Text>
        <Button
          title="Login"
          onPress={() => {
            hapticMedium();
            navigation.navigate('Login');
          }}
          style={[styles.btn, { backgroundColor: jarsPrimary }]}
        />
        <Button
          title="Create Account"
          onPress={() => {
            hapticMedium();
            navigation.navigate('SignUp');
          }}
          style={[styles.btn, { backgroundColor: jarsPrimary }]}
        />
        <Button
          title="Browse as Guest"
          onPress={() => {
            hapticMedium();
            navigation.replace('HomeScreen');
          }}
          style={[styles.btn, { backgroundColor: jarsPrimary }]}
        />
        <AnimatedPulseGlow />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inner: { width: '80%', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  btn: { alignSelf: 'stretch', marginBottom: 12 },
});
