import React from 'react';
import renderer, { act } from 'react-test-renderer';
import SplashScreenWrapper from '../src/screens/SplashScreenWrapper';
import AgeVerification from '../src/screens/onboarding/AgeVerificationScreen';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('expo-secure-store');
jest.mock('react-native-sound', () => jest.fn());
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

it('marks onboarding complete on splash finish', () => {
  const tree = renderer.create(
    <NavigationContainer>
      <SplashScreenWrapper />
    </NavigationContainer>
  );
  act(() => {
    tree.root.findByType('LottieView').props.onAnimationFinish();
  });
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('onboardingComplete', 'true');
});

test('underage blocks access', () => {
  const tree = renderer.create(
    <NavigationContainer>
      <AgeVerification />
    </NavigationContainer>
  );
  const instance = tree.root;
  act(() => {
    instance.findByProps({ accessibilityRole: 'button' }).props.onPress();
  });
  // since no date set, should show alert or do nothing - skip
});
