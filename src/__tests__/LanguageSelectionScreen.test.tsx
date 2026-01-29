import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import { ThemeContext } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import * as haptic from '../utils/haptic';

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('../context/SettingsContext', () => ({
  useSettings: jest.fn(),
}));

jest.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockTheme = {
  colorTemp: 'warm',
  brandPrimary: '#2E5D46',
  brandSecondary: '#666',
  brandBackground: '#FFF',
  brandAccent: '#8CD24C',
};

describe('LanguageSelectionScreen', () => {
  const mockSetLocale = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSettings as jest.Mock).mockReturnValue({
      locale: 'en',
      setLocale: mockSetLocale,
    });
  });

  it('should render language options', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme as any}>
        <LanguageSelectionScreen />
      </ThemeContext.Provider>
    );
    expect(getByText('English')).toBeTruthy();
    expect(getByText('Español')).toBeTruthy();
  });

  it('should show checkmark for current locale', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme as any}>
        <LanguageSelectionScreen />
      </ThemeContext.Provider>
    );
    expect(getByText('✓')).toBeTruthy();
  });

  it('should call setLocale when language is selected', async () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme as any}>
        <LanguageSelectionScreen />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByText('Español'));

    await waitFor(() => {
      expect(mockSetLocale).toHaveBeenCalledWith('es');
    });
    expect(haptic.hapticLight).toHaveBeenCalled();
  });

  it('should navigate back after selection', async () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme as any}>
        <LanguageSelectionScreen />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByText('Español'));

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should render header title', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme as any}>
        <LanguageSelectionScreen />
      </ThemeContext.Provider>
    );
    expect(getByText('selectLanguage')).toBeTruthy();
  });
});
