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
  brandPrimary: '#000',
  brandBackground: '#fff',
  textPrimary: '#000',
  textSecondary: '#666',
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
