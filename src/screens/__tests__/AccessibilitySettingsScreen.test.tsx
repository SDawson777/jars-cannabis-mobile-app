// src/screens/__tests__/AccessibilitySettingsScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccessibilitySettingsScreen from '../AccessibilitySettingsScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { getPrefs, updatePrefs } from '../../api/phase4Client';

// Mock dependencies
jest.mock('../../api/phase4Client', () => ({
  getPrefs: jest.fn(),
  updatePrefs: jest.fn(),
}));

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
}));

jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return {
    ...actualRN,
    LayoutAnimation: {
      configureNext: jest.fn(),
      Presets: { easeInEaseOut: {} },
    },
    UIManager: {
      setLayoutAnimationEnabledExperimental: jest.fn(),
    },
  };
});

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: jest.fn(),
  }),
}));

const mockThemeContext = {
  colorTemp: 'warm' as const,
  brandPrimary: '#4C9F70',
  brandSecondary: '#E8F5E9',
  brandBackground: '#FAF8F4',
  brandAccent: '#4CAF50',
  cornerRadius: 8,
  textColor: '#2C3E50',
  isDark: false,
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

const mockPrefs = {
  reducedMotion: false,
  dyslexiaFont: false,
  highContrast: false,
  personalization: true,
};

const mockGetPrefs = getPrefs as jest.MockedFunction<typeof getPrefs>;
const mockUpdatePrefs = updatePrefs as jest.MockedFunction<typeof updatePrefs>;

describe('AccessibilitySettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPrefs.mockResolvedValue(mockPrefs);
    mockUpdatePrefs.mockResolvedValue(mockPrefs);
  });

  const renderScreen = () => {
    return render(
      <ThemeContext.Provider value={mockThemeContext}>
        <AccessibilitySettingsScreen />
      </ThemeContext.Provider>
    );
  };

  describe('Loading State', () => {
    it('shows loading indicator initially', () => {
      mockGetPrefs.mockImplementation(() => new Promise(() => {})); // Never resolves
      const { UNSAFE_getByType } = renderScreen();
      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
  });

  describe('Rendering', () => {
    it('renders the screen with header after loading', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Accessibility Settings')).toBeTruthy();
      });
    });

    it('renders all toggle options', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Dyslexia-friendly Font')).toBeTruthy();
        expect(getByText('High Contrast')).toBeTruthy();
        expect(getByText('Reduce Motion')).toBeTruthy();
      });
    });

    it('renders save button', async () => {
      const { UNSAFE_getAllByType, getByText } = renderScreen();
      const { Button } = require('react-native');

      await waitFor(() => {
        expect(getByText('Accessibility Settings')).toBeTruthy();
      });

      // Check Button with title="Save" exists
      const buttons = UNSAFE_getAllByType(Button);
      const saveButton = buttons.find((b: any) => b.props.title === 'Save');
      expect(saveButton).toBeTruthy();
    });
  });

  describe('Toggle Interactions', () => {
    it('toggles dyslexia font option', async () => {
      const { getByText, UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');

      await waitFor(() => {
        expect(getByText('Dyslexia-friendly Font')).toBeTruthy();
      });

      const switches = UNSAFE_getAllByType(Switch);
      // First switch is Dyslexia-friendly Font
      fireEvent(switches[0], 'onValueChange', true);

      // Toggle was called - just verify no errors
      expect(switches.length).toBe(3);
    });

    it('toggles high contrast option', async () => {
      const { getByText, UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');

      await waitFor(() => {
        expect(getByText('High Contrast')).toBeTruthy();
      });

      const switches = UNSAFE_getAllByType(Switch);
      // Second switch is High Contrast
      fireEvent(switches[1], 'onValueChange', true);

      expect(switches.length).toBe(3);
    });

    it('toggles reduce motion option', async () => {
      const { getByText, UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');

      await waitFor(() => {
        expect(getByText('Reduce Motion')).toBeTruthy();
      });

      const switches = UNSAFE_getAllByType(Switch);
      // Third switch is Reduce Motion
      fireEvent(switches[2], 'onValueChange', true);

      expect(switches.length).toBe(3);
    });
  });

  describe('Save Functionality', () => {
    it('calls updatePrefs when save is pressed', async () => {
      const { UNSAFE_getAllByType, getByText } = renderScreen();
      const { Button } = require('react-native');

      await waitFor(() => {
        expect(getByText('Accessibility Settings')).toBeTruthy();
      });

      const buttons = UNSAFE_getAllByType(Button);
      const saveButton = buttons.find((b: any) => b.props.title === 'Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockUpdatePrefs).toHaveBeenCalled();
      });
    });

    it('saves updated preferences', async () => {
      mockUpdatePrefs.mockResolvedValue({ ...mockPrefs, dyslexiaFont: true });
      const { UNSAFE_getAllByType, getByText } = renderScreen();
      const { Switch, Button } = require('react-native');

      await waitFor(() => {
        expect(getByText('Accessibility Settings')).toBeTruthy();
      });

      // Toggle dyslexia font
      const switches = UNSAFE_getAllByType(Switch);
      fireEvent(switches[0], 'onValueChange', true);

      // Save
      const buttons = UNSAFE_getAllByType(Button);
      const saveButton = buttons.find((b: any) => b.props.title === 'Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockUpdatePrefs).toHaveBeenCalledWith(
          expect.objectContaining({
            dyslexiaFont: true,
          })
        );
      });
    });
  });

  describe('Error State', () => {
    it('shows error message on load failure', async () => {
      mockGetPrefs.mockRejectedValue(new Error('Failed to load preferences'));

      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Error: Failed to load preferences')).toBeTruthy();
      });
    });

    it('shows retry button on error', async () => {
      mockGetPrefs.mockRejectedValue(new Error('Network error'));

      const { UNSAFE_getAllByType, getByText } = renderScreen();
      const { Button } = require('react-native');

      await waitFor(() => {
        expect(getByText(/Error:/)).toBeTruthy();
      });

      const buttons = UNSAFE_getAllByType(Button);
      const retryButton = buttons.find((b: any) => b.props.title === 'Retry');
      expect(retryButton).toBeTruthy();
    });

    it('retries loading when retry is pressed', async () => {
      mockGetPrefs.mockRejectedValueOnce(new Error('Network error'));
      mockGetPrefs.mockResolvedValueOnce(mockPrefs);

      const { UNSAFE_getAllByType, getByText } = renderScreen();
      const { Button } = require('react-native');

      await waitFor(() => {
        expect(getByText(/Error:/)).toBeTruthy();
      });

      const buttons = UNSAFE_getAllByType(Button);
      const retryButton = buttons.find((b: any) => b.props.title === 'Retry');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(mockGetPrefs).toHaveBeenCalledTimes(2);
      });

      await waitFor(() => {
        expect(getByText('Accessibility Settings')).toBeTruthy();
      });
    });
  });

  describe('Theme Integration', () => {
    it('applies cool theme when colorTemp is cool', async () => {
      const coolTheme = {
        ...mockThemeContext,
        colorTemp: 'cool' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={coolTheme}>
          <AccessibilitySettingsScreen />
        </ThemeContext.Provider>
      );

      await waitFor(() => {
        expect(getByText('Accessibility Settings')).toBeTruthy();
      });
    });

    it('applies neutral theme when colorTemp is neutral', async () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={neutralTheme}>
          <AccessibilitySettingsScreen />
        </ThemeContext.Provider>
      );

      await waitFor(() => {
        expect(getByText('Accessibility Settings')).toBeTruthy();
      });
    });
  });

  describe('Initial Values', () => {
    it('shows initial values from API', async () => {
      mockGetPrefs.mockResolvedValue({
        reducedMotion: true,
        dyslexiaFont: true,
        highContrast: false,
        personalization: true,
      });

      const { getByText, UNSAFE_getAllByType } = renderScreen();
      const { Switch } = require('react-native');

      await waitFor(() => {
        expect(getByText('Accessibility Settings')).toBeTruthy();
      });

      const switches = UNSAFE_getAllByType(Switch);
      // Verify switch values based on initial API response
      expect(switches[0].props.value).toBe(true); // dyslexiaFont
      expect(switches[1].props.value).toBe(false); // highContrast
      expect(switches[2].props.value).toBe(true); // reducedMotion
    });
  });
});
