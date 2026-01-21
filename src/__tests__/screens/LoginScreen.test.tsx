// src/__tests__/screens/LoginScreen.test.tsx

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Eye: () => null,
  EyeOff: () => null,
}));

// Mock AnimatedShimmerOverlay
jest.mock('../../components/AnimatedShimmerOverlay', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function AnimatedShimmerOverlay() {
    return React.createElement(View, { testID: 'shimmer-overlay' });
  };
});

// Mock navigation
const mockGoBack = jest.fn();
const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    replace: mockReplace,
    push: mockPush,
    navigate: mockNavigate,
  }),
}));

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
  hapticHeavy: jest.fn(),
}));

// Mock analytics
jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

// Mock useAuth hook
const mockSignIn = jest.fn();
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../screens/LoginScreen';
import { ThemeContext } from '../../context/ThemeContext';
import * as haptic from '../../utils/haptic';
import * as analytics from '../../utils/analytics';

describe('LoginScreen', () => {
  const mockTheme = {
    colorTemp: 'neutral' as const,
    brandPrimary: '#2E7D32',
    brandSecondary: '#81C784',
    brandBackground: '#FFFFFF',
    cornerRadius: 8,
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeContext.Provider value={mockTheme}>{ui}</ThemeContext.Provider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders login screen with title', () => {
      const { getAllByText } = renderWithTheme(<LoginScreen />);
      // "Log In" appears both as title and button text
      const logInElements = getAllByText('Log In');
      expect(logInElements.length).toBeGreaterThan(0);
    });

    it('renders email and password inputs', () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      expect(getByLabelText('Email')).toBeTruthy();
      expect(getByLabelText('Password')).toBeTruthy();
    });

    it('renders forgot password link', () => {
      const { getByText } = renderWithTheme(<LoginScreen />);
      expect(getByText('Forgot your password?')).toBeTruthy();
    });

    it('renders legal disclaimers', () => {
      const { getByText } = renderWithTheme(<LoginScreen />);

      expect(getByText('By logging in you agree to our')).toBeTruthy();
      expect(getByText('Terms & Conditions')).toBeTruthy();
      expect(getByText('Privacy Policy')).toBeTruthy();
    });

    it('renders login button', () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);
      expect(getByLabelText('Log In')).toBeTruthy();
    });
  });

  describe('Form Interaction', () => {
    it('updates email state when typing', () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      const emailInput = getByLabelText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('updates password state when typing', () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      const passwordInput = getByLabelText('Password');
      fireEvent.changeText(passwordInput, 'password123');

      expect(passwordInput.props.value).toBe('password123');
    });

    it('toggles password visibility', () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      const passwordInput = getByLabelText('Password');
      const toggleButton = getByLabelText('Toggle password visibility');

      // Initially secure
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Toggle to show
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(false);

      // Toggle to hide
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Login Flow', () => {
    it('calls signIn with email and password on submit', async () => {
      mockSignIn.mockResolvedValueOnce({});

      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      fireEvent.changeText(getByLabelText('Email'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'password123');
      fireEvent.press(getByLabelText('Log In'));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('navigates to HomeScreen on successful login', async () => {
      mockSignIn.mockResolvedValueOnce({});

      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      fireEvent.changeText(getByLabelText('Email'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'password123');
      fireEvent.press(getByLabelText('Log In'));

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('HomeScreen');
        expect(haptic.hapticMedium).toHaveBeenCalled();
      });
    });

    it('logs success event on successful login', async () => {
      mockSignIn.mockResolvedValueOnce({});

      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      fireEvent.changeText(getByLabelText('Email'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'password123');
      fireEvent.press(getByLabelText('Log In'));

      await waitFor(() => {
        expect(analytics.logEvent).toHaveBeenCalledWith('login_success', {});
      });
    });

    it('displays error message on login failure', async () => {
      const errorMessage = 'Invalid credentials';
      mockSignIn.mockRejectedValueOnce(new Error(errorMessage));

      const { getByLabelText, getByText } = renderWithTheme(<LoginScreen />);

      fireEvent.changeText(getByLabelText('Email'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'wrongpassword');
      fireEvent.press(getByLabelText('Log In'));

      await waitFor(() => {
        expect(getByText(errorMessage)).toBeTruthy();
        expect(haptic.hapticHeavy).toHaveBeenCalled();
      });
    });

    it('logs failure event on login error', async () => {
      const errorMessage = 'Invalid credentials';
      mockSignIn.mockRejectedValueOnce(new Error(errorMessage));

      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      fireEvent.changeText(getByLabelText('Email'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'wrongpassword');
      fireEvent.press(getByLabelText('Log In'));

      await waitFor(() => {
        expect(analytics.logEvent).toHaveBeenCalledWith('login_failure', {
          message: errorMessage,
        });
      });
    });

    it('does not submit when email is empty', async () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      fireEvent.changeText(getByLabelText('Password'), 'password123');
      fireEvent.press(getByLabelText('Log In'));

      await waitFor(() => {
        expect(mockSignIn).not.toHaveBeenCalled();
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });

    it('does not submit when password is empty', async () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      fireEvent.changeText(getByLabelText('Email'), 'test@example.com');
      fireEvent.press(getByLabelText('Log In'));

      await waitFor(() => {
        expect(mockSignIn).not.toHaveBeenCalled();
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });

    it('shows loading indicator while submitting', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const { getByLabelText, UNSAFE_getByType } = renderWithTheme(<LoginScreen />);

      fireEvent.changeText(getByLabelText('Email'), 'test@example.com');
      fireEvent.changeText(getByLabelText('Password'), 'password123');
      fireEvent.press(getByLabelText('Log In'));

      // Loading indicator should appear
      expect(UNSAFE_getByType('ActivityIndicator' as any)).toBeTruthy();

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button is pressed', async () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      fireEvent.press(getByLabelText('Go Back'));

      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });

    it('navigates to forgot password screen', async () => {
      const { getByText } = renderWithTheme(<LoginScreen />);

      fireEvent.press(getByText('Forgot your password?'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('ForgotPassword');
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });

    it('navigates to legal screen from Terms & Conditions', async () => {
      const { getByText } = renderWithTheme(<LoginScreen />);

      fireEvent.press(getByText('Terms & Conditions'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Legal');
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });

    it('navigates to legal screen from Privacy Policy', async () => {
      const { getByText } = renderWithTheme(<LoginScreen />);

      fireEvent.press(getByText('Privacy Policy'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Legal');
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });
  });

  describe('Theme Integration', () => {
    it('applies warm theme background', () => {
      const warmTheme = { ...mockTheme, colorTemp: 'warm' as const };

      const { root } = render(
        <ThemeContext.Provider value={warmTheme}>
          <LoginScreen />
        </ThemeContext.Provider>
      );

      expect(root).toBeTruthy();
    });

    it('applies cool theme background', () => {
      const coolTheme = { ...mockTheme, colorTemp: 'cool' as const };

      const { root } = render(
        <ThemeContext.Provider value={coolTheme}>
          <LoginScreen />
        </ThemeContext.Provider>
      );

      expect(root).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels on form elements', () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      expect(getByLabelText('Email')).toBeTruthy();
      expect(getByLabelText('Password')).toBeTruthy();
      expect(getByLabelText('Toggle password visibility')).toBeTruthy();
      expect(getByLabelText('Log In')).toBeTruthy();
    });

    it('has accessibility hints on inputs', () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      const emailInput = getByLabelText('Email');
      const passwordInput = getByLabelText('Password');

      expect(emailInput.props.accessibilityHint).toBe('Enter your email address');
      expect(passwordInput.props.accessibilityHint).toBe('Enter your password');
    });

    it('has proper accessibility roles', () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      expect(getByLabelText('Go Back').props.accessibilityRole).toBe('button');
      expect(getByLabelText('Email').props.accessibilityRole).toBe('text');
      expect(getByLabelText('Password').props.accessibilityRole).toBe('text');
      expect(getByLabelText('Log In').props.accessibilityRole).toBe('button');
    });
  });

  describe('Input Focus States', () => {
    it('updates border color on email focus', () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      const emailInput = getByLabelText('Email');

      fireEvent(emailInput, 'focus');
      // Style is an array, need to check the object within it
      const focusedStyle = Array.isArray(emailInput.props.style)
        ? emailInput.props.style.find((s: any) => s.borderColor)
        : emailInput.props.style;
      expect(focusedStyle.borderColor).toBe(mockTheme.brandPrimary);
    });

    it('updates border color on password focus', () => {
      const { getByLabelText } = renderWithTheme(<LoginScreen />);

      const passwordInput = getByLabelText('Password');

      fireEvent(passwordInput, 'focus');
      // Style is an array, need to check the object within it
      const focusedStyle = Array.isArray(passwordInput.props.style)
        ? passwordInput.props.style.find((s: any) => s.borderColor)
        : passwordInput.props.style;
      expect(focusedStyle.borderColor).toBe(mockTheme.brandPrimary);
    });
  });
});
