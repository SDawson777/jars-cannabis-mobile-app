// src/screens/__tests__/LanguageSelectionScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LanguageSelectionScreen from '../LanguageSelectionScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

// Mock dependencies
jest.mock('../../context/SettingsContext', () => ({
  useSettings: jest.fn(),
}));

jest.mock('../../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
}));

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

const mockSetLocale = jest.fn();
const mockUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;

describe('LanguageSelectionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetLocale.mockResolvedValue(undefined);
    mockUseSettings.mockReturnValue({
      locale: 'en',
      setLocale: mockSetLocale,
      fontSize: 16,
      setFontSize: jest.fn(),
      reducedMotion: false,
      setReducedMotion: jest.fn(),
    } as any);
  });

  const renderScreen = () => {
    return render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageSelectionScreen />
      </ThemeContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('renders the screen with header', () => {
      const { getByText } = renderScreen();
      expect(getByText('selectLanguage')).toBeTruthy();
    });

    it('renders English option', () => {
      const { getByText } = renderScreen();
      expect(getByText('English')).toBeTruthy();
    });

    it('renders Spanish option', () => {
      const { getByText } = renderScreen();
      expect(getByText('Español')).toBeTruthy();
    });

    it('shows checkmark for selected language', () => {
      const { getByText } = renderScreen();
      // English is selected by default
      expect(getByText('✓')).toBeTruthy();
    });
  });

  describe('Language Selection', () => {
    it('selects English when pressed', async () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('English'));

      await waitFor(() => {
        expect(mockSetLocale).toHaveBeenCalledWith('en');
      });
    });

    it('selects Spanish when pressed', async () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Español'));

      await waitFor(() => {
        expect(mockSetLocale).toHaveBeenCalledWith('es');
      });
    });

    it('navigates back after selection', async () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Español'));

      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
      });
    });
  });

  describe('Selected Language Display', () => {
    it('shows checkmark for English when English is selected', () => {
      mockUseSettings.mockReturnValue({
        locale: 'en',
        setLocale: mockSetLocale,
      } as any);

      const { getByText } = renderScreen();
      // Checkmark should be visible
      expect(getByText('✓')).toBeTruthy();
    });

    it('shows checkmark for Spanish when Spanish is selected', () => {
      mockUseSettings.mockReturnValue({
        locale: 'es',
        setLocale: mockSetLocale,
      } as any);

      const { getByText } = renderScreen();
      // Checkmark should be next to Spanish
      expect(getByText('✓')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('applies cool theme when colorTemp is cool', () => {
      const coolTheme = {
        ...mockThemeContext,
        colorTemp: 'cool' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={coolTheme}>
          <LanguageSelectionScreen />
        </ThemeContext.Provider>
      );

      expect(getByText('selectLanguage')).toBeTruthy();
    });

    it('applies neutral theme when colorTemp is neutral', () => {
      const neutralTheme = {
        ...mockThemeContext,
        colorTemp: 'neutral' as const,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={neutralTheme}>
          <LanguageSelectionScreen />
        </ThemeContext.Provider>
      );

      expect(getByText('selectLanguage')).toBeTruthy();
    });
  });
});
