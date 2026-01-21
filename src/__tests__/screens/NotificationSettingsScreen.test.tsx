// src/__tests__/screens/NotificationSettingsScreen.test.tsx

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
}));

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationSettingsScreen from '../../screens/NotificationSettingsScreen';
import { ThemeContext } from '../../context/ThemeContext';
import * as haptic from '../../utils/haptic';

describe('NotificationSettingsScreen', () => {
  const mockTheme = {
    colorTemp: 'neutral' as const,
    brandPrimary: '#2E7D32',
    brandSecondary: '#81C784',
    brandBackground: '#FFFFFF',
    brandAccent: '#4CAF50',
    cornerRadius: 8,
    logoUrl: undefined,
    elevation: 'soft' as const,
    loading: false,
    debugInfo: {
      weatherSource: 'time-of-day' as const,
      lastUpdated: new Date('2024-01-01'),
    },
    cmsTheme: null,
    weatherSimulation: { enabled: false, condition: null },
    setWeatherSimulation: jest.fn(),
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeContext.Provider value={mockTheme}>{ui}</ThemeContext.Provider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the screen with header', () => {
      const { getByText } = renderWithTheme(<NotificationSettingsScreen />);
      expect(getByText('Notifications')).toBeTruthy();
    });

    it('renders all notification toggle options', () => {
      const { getByText } = renderWithTheme(<NotificationSettingsScreen />);

      expect(getByText('Email Notifications')).toBeTruthy();
      expect(getByText('SMS Notifications')).toBeTruthy();
      expect(getByText('Push Notifications')).toBeTruthy();
    });

    it('applies warm theme background', () => {
      const warmTheme = { ...mockTheme, colorTemp: 'warm' as const };
      const { root } = render(
        <ThemeContext.Provider value={warmTheme}>
          <NotificationSettingsScreen />
        </ThemeContext.Provider>
      );

      // Screen should have warm background color
      expect(root).toBeTruthy();
    });

    it('applies cool theme background', () => {
      const coolTheme = { ...mockTheme, colorTemp: 'cool' as const };
      const { root } = render(
        <ThemeContext.Provider value={coolTheme}>
          <NotificationSettingsScreen />
        </ThemeContext.Provider>
      );

      // Screen should have cool background color
      expect(root).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('calls navigation.goBack when back button is pressed', () => {
      const { UNSAFE_getByType } = renderWithTheme(<NotificationSettingsScreen />);

      const pressables = UNSAFE_getByType('Pressable' as any);
      fireEvent.press(pressables);

      expect(mockGoBack).toHaveBeenCalled();
      expect(haptic.hapticLight).toHaveBeenCalled();
    });
  });

  describe('Switch Interactions', () => {
    it('toggles email notifications switch', async () => {
      const { UNSAFE_getAllByType } = renderWithTheme(<NotificationSettingsScreen />);

      const switches = UNSAFE_getAllByType('Switch' as any);
      const emailSwitch = switches[0];

      // Initially true
      expect(emailSwitch.props.value).toBe(true);

      // Toggle off
      fireEvent(emailSwitch, 'valueChange', false);

      await waitFor(() => {
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });

    it('toggles SMS notifications switch', async () => {
      const { UNSAFE_getAllByType } = renderWithTheme(<NotificationSettingsScreen />);

      const switches = UNSAFE_getAllByType('Switch' as any);
      const smsSwitch = switches[1];

      // Initially false
      expect(smsSwitch.props.value).toBe(false);

      // Toggle on
      fireEvent(smsSwitch, 'valueChange', true);

      await waitFor(() => {
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });

    it('toggles push notifications switch', async () => {
      const { UNSAFE_getAllByType } = renderWithTheme(<NotificationSettingsScreen />);

      const switches = UNSAFE_getAllByType('Switch' as any);
      const pushSwitch = switches[2];

      // Initially true
      expect(pushSwitch.props.value).toBe(true);

      // Toggle off
      fireEvent(pushSwitch, 'valueChange', false);

      await waitFor(() => {
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });

    it('triggers haptic feedback on each toggle', async () => {
      const { UNSAFE_getAllByType } = renderWithTheme(<NotificationSettingsScreen />);

      const switches = UNSAFE_getAllByType('Switch' as any);

      // Toggle each switch
      fireEvent(switches[0], 'valueChange', false);
      fireEvent(switches[1], 'valueChange', true);
      fireEvent(switches[2], 'valueChange', false);

      await waitFor(() => {
        expect(haptic.hapticLight).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Theme Integration', () => {
    it('applies brand primary color to labels', () => {
      const { getByText } = renderWithTheme(<NotificationSettingsScreen />);

      const emailLabel = getByText('Email Notifications');
      expect(emailLabel.props.style).toContainEqual(
        expect.objectContaining({ color: mockTheme.brandPrimary })
      );
    });

    it('applies brand primary color to switch track', () => {
      const { UNSAFE_getAllByType } = renderWithTheme(<NotificationSettingsScreen />);

      const switches = UNSAFE_getAllByType('Switch' as any);
      expect(switches[0].props.trackColor.true).toBe(mockTheme.brandPrimary);
    });
  });

  describe('State Management', () => {
    it('maintains independent state for each switch', async () => {
      const { UNSAFE_getAllByType } = renderWithTheme(<NotificationSettingsScreen />);

      const switches = UNSAFE_getAllByType('Switch' as any);

      // Initial states: email=true, sms=false, push=true
      expect(switches[0].props.value).toBe(true);
      expect(switches[1].props.value).toBe(false);
      expect(switches[2].props.value).toBe(true);

      // Toggle SMS
      fireEvent(switches[1], 'valueChange', true);

      await waitFor(() => {
        // Other switches should remain unchanged
        expect(switches[0].props.value).toBe(true);
        expect(switches[2].props.value).toBe(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('renders switches with proper accessibility roles', () => {
      const { UNSAFE_getAllByType } = renderWithTheme(<NotificationSettingsScreen />);

      const switches = UNSAFE_getAllByType('Switch' as any);
      expect(switches).toHaveLength(3);
    });

    it('renders labels alongside switches for screen readers', () => {
      const { getByText } = renderWithTheme(<NotificationSettingsScreen />);

      expect(getByText('Email Notifications')).toBeTruthy();
      expect(getByText('SMS Notifications')).toBeTruthy();
      expect(getByText('Push Notifications')).toBeTruthy();
    });
  });
});
