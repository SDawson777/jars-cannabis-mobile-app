import React from 'react';
import { render } from '@testing-library/react-native';
import AuthStack from '../navigation/AuthStack';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children || null,
    Screen: () => null,
  }),
}));

jest.mock('../screens/LoginScreen', () => 'LoginScreen');
jest.mock('../screens/SignUpScreen', () => 'SignUpScreen');
jest.mock('../screens/auth/ForgotPasswordScreen', () => 'ForgotPasswordScreen');

describe('AuthStack', () => {
  it('should render', () => {
    const { toJSON } = render(<AuthStack />);
    expect(toJSON).toBeDefined();
  });
});
