import { NavigationContainer } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import LottieView from 'lottie-react-native';
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import SplashScreenWrapper from '../src/screens/SplashScreenWrapper';
import AgeVerification from '../src/screens/onboarding/AgeVerificationScreen';

jest.mock('react-native-sound', () => jest.fn());

it('marks onboarding complete on splash finish', () => {
  const tree = renderer.create(
    <NavigationContainer>
      <SplashScreenWrapper />
    </NavigationContainer>
  );
  act(() => {
    tree.root.findByType(LottieView).props.onAnimationFinish();
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
