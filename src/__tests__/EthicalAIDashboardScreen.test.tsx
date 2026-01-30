import React from 'react';
import { render } from '@testing-library/react-native';
import EthicalAIDashboardScreen from '../screens/EthicalAIDashboardScreen';
import { ThemeContext } from '../context/ThemeContext';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    goBack: jest.fn(),
  })),
}));

jest.mock('../api/hooks/useDataCategories', () => ({
  useDataCategories: jest.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

jest.mock('../api/hooks/usePrivacyPreferences', () => ({
  usePrivacyPreferences: jest.fn(() => ({
    data: { highContrast: false },
    updatePreferences: jest.fn(),
  })),
}));

jest.mock('../components/DataCategoryItem', () => 'DataCategoryItem');

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  ChevronLeft: 'ChevronLeft',
}));

const mockTheme = {
  colorTemp: 'neutral' as const,
  brandPrimary: '#000',
  brandSecondary: '#333',
  brandBackground: '#fff',
  brandAccent: '#0f0',
  cornerRadius: 8,
  logoUrl: undefined,
  elevation: 'soft' as const,
  loading: false,
  debugInfo: {
    weatherSource: 'time-of-day',
    lastUpdated: new Date('2024-01-01T00:00:00Z'),
  },
  cmsTheme: null,
  weatherSimulation: {
    enabled: false,
    condition: null,
  },
  setWeatherSimulation: jest.fn(),
};

describe('EthicalAIDashboardScreen', () => {
  it('should render dashboard title', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme}>
        <EthicalAIDashboardScreen />
      </ThemeContext.Provider>
    );
    expect(getByText('Ethical AI Dashboard')).toBeTruthy();
  });
});
