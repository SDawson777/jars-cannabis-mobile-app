import React from 'react';
import { render } from '@testing-library/react-native';
import OnboardingStack from '../navigation/OnboardingStack';

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children || null,
    Screen: () => null,
  }),
}));

jest.mock('../screens/OnboardingScreen', () => 'OnboardingScreen');
jest.mock('../screens/LanguageSelectionScreen', () => 'LanguageSelectionScreen');

describe('OnboardingStack', () => {
  it('should render', () => {
    const { toJSON } = render(<OnboardingStack />);
    expect(toJSON).toBeDefined();
  });
});
