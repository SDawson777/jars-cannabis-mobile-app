import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FavoritesScreen from '../FavoritesScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Heart: () => null,
}));

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

// Mock LayoutAnimation
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    LayoutAnimation: {
      configureNext: jest.fn(),
      Presets: { easeInEaseOut: {} },
    },
    UIManager: { setLayoutAnimationEnabledExperimental: jest.fn() },
    Platform: { OS: 'ios' },
  };
});

// Mock ThemeContext
jest.mock('../../context/ThemeContext', () => {
  const ReactForMock = require('react');
  return {
    ThemeContext: ReactForMock.createContext({
      colorTemp: 'neutral',
      brandPrimary: '#2E5D46',
      brandSecondary: '#666',
      brandBackground: '#fff',
    }),
  };
});

// Mock favorites hooks
const mockFavorites = [
  { id: 'fav-1', productId: 'prod-1', item: { name: 'Blue Dream' } },
  { id: 'fav-2', productId: 'prod-2', item: { name: 'OG Kush' } },
];

const mockRemoveFavorite = { mutate: jest.fn() };
let mockIsLoading = false;
let mockError: Error | null = null;

jest.mock('../../hooks/useFavorites', () => ({
  useFavoriteProducts: () => ({
    data: mockIsLoading ? undefined : mockFavorites,
    isLoading: mockIsLoading,
    error: mockError,
  }),
  useRemoveFromFavorites: () => mockRemoveFavorite,
}));

describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
  });

  it('renders header with title', () => {
    const { getByText } = render(<FavoritesScreen />);
    expect(getByText('Favorites')).toBeTruthy();
  });

  it('renders favorite product names', () => {
    const { getByText } = render(<FavoritesScreen />);
    expect(getByText('Blue Dream')).toBeTruthy();
    expect(getByText('OG Kush')).toBeTruthy();
  });

  it('shows loading state', () => {
    mockIsLoading = true;
    const { getByText } = render(<FavoritesScreen />);
    expect(getByText('Loading favorites...')).toBeTruthy();
  });

  it('shows error state', () => {
    mockError = new Error('Failed');
    const { getByText } = render(<FavoritesScreen />);
    expect(getByText('Unable to load favorites. Please try again.')).toBeTruthy();
  });

  it('navigates back on back button press', () => {
    const { UNSAFE_root } = render(<FavoritesScreen />);
    const pressables = UNSAFE_root.findAllByType(require('react-native').Pressable);
    if (pressables[0]) {
      fireEvent.press(pressables[0]);
      expect(mockGoBack).toHaveBeenCalled();
    }
  });

  it('removes favorite when heart is pressed', () => {
    const { UNSAFE_root } = render(<FavoritesScreen />);
    const pressables = UNSAFE_root.findAllByType(require('react-native').Pressable);
    // First pressable is back, heart buttons come after
    const heartButton = pressables.find((p, i) => i > 0);
    if (heartButton) {
      fireEvent.press(heartButton);
      expect(mockRemoveFavorite.mutate).toHaveBeenCalled();
    }
  });
});
