// src/__tests__/screens/ProfileScreen.test.tsx

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  ChevronRight: () => null,
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Mock haptic
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../screens/ProfileScreen';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import * as haptic from '../../utils/haptic';

describe('ProfileScreen', () => {
  const mockTheme = {
    colorTemp: 'neutral' as const,
    brandPrimary: '#2E7D32',
    brandSecondary: '#81C784',
    brandBackground: '#FFFFFF',
    cornerRadius: 8,
  };

  const mockAuthData = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
  };

  const mockClearAuth = jest.fn();

  const renderWithProviders = (ui: React.ReactElement, authData?: typeof mockAuthData | null) => {
    const authContext = {
      data: authData || mockAuthData,
      clearAuth: mockClearAuth,
      setAuth: jest.fn(),
      loading: false,
    };

    return render(
      <ThemeContext.Provider value={mockTheme}>
        <AuthContext.Provider value={authContext}>{ui}</AuthContext.Provider>
      </ThemeContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authenticated User', () => {
    it('renders profile screen with user info', () => {
      const { getByText, getByTestId } = renderWithProviders(<ProfileScreen />);

      expect(getByTestId('profile-name')).toBeTruthy();
      expect(getByTestId('profile-email')).toBeTruthy();
      expect(getByText(/John Doe/)).toBeTruthy();
      expect(getByText(/john@example.com/)).toBeTruthy();
    });

    it('displays all menu options', () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      expect(getByText('Edit Profile')).toBeTruthy();
      expect(getByText('Saved Addresses')).toBeTruthy();
      expect(getByText('Saved Payments')).toBeTruthy();
      expect(getByText('Favorites')).toBeTruthy();
      expect(getByText('My Orders')).toBeTruthy();
      expect(getByText('App Settings')).toBeTruthy();
      expect(getByText('Legal')).toBeTruthy();
    });

    it('navigates to Edit Profile when menu item clicked', async () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      fireEvent.press(getByText('Edit Profile'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });

    it('navigates to Saved Addresses', async () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      fireEvent.press(getByText('Saved Addresses'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('SavedAddresses');
      });
    });

    it('navigates to Favorites', async () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      fireEvent.press(getByText('Favorites'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Favorites');
      });
    });

    it('navigates to Order History', async () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      fireEvent.press(getByText('My Orders'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('OrderHistory');
      });
    });

    it('navigates to App Settings', async () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      fireEvent.press(getByText('App Settings'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('AppSettings');
      });
    });

    it('navigates to Edit Profile via profile image', async () => {
      const { getByTestId } = renderWithProviders(<ProfileScreen />);

      fireEvent.press(getByTestId('profile-image'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
      });
    });

    it('navigates to Edit Profile via edit button', async () => {
      const { getByTestId } = renderWithProviders(<ProfileScreen />);

      fireEvent.press(getByTestId('edit-profile-button'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
      });
    });

    it('calls clearAuth when logout is pressed', async () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      fireEvent.press(getByText('Logout'));

      await waitFor(() => {
        expect(mockClearAuth).toHaveBeenCalled();
      });
    });

    it('triggers haptic feedback on navigation', async () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      fireEvent.press(getByText('Saved Payments'));

      await waitFor(() => {
        expect(haptic.hapticLight).toHaveBeenCalled();
      });
    });
  });

  describe('Guest User', () => {
    it('displays sign in button for guest users when no data', () => {
      const authContext = {
        data: null,
        clearAuth: mockClearAuth,
        setAuth: jest.fn(),
        loading: false,
      };

      const { getByTestId } = render(
        <ThemeContext.Provider value={mockTheme}>
          <AuthContext.Provider value={authContext}>
            <ProfileScreen />
          </AuthContext.Provider>
        </ThemeContext.Provider>
      );

      expect(getByTestId('sign-in-button')).toBeTruthy();
    });

    it('shows Guest as fallback when name is null', () => {
      const userWithNullName = {
        id: 'user-123',
        name: null as any,
        email: 'test@example.com',
        phone: '',
      };

      const { getByTestId } = renderWithProviders(<ProfileScreen />, userWithNullName);

      const nameText = getByTestId('profile-name');
      const textContent = nameText.props.children
        .filter((c: any) => typeof c === 'string')
        .join('');
      expect(textContent).toContain('Guest');
    });

    it('still shows menu options when no auth data', () => {
      const authContext = {
        data: null,
        clearAuth: mockClearAuth,
        setAuth: jest.fn(),
        loading: false,
      };

      const { getByText } = render(
        <ThemeContext.Provider value={mockTheme}>
          <AuthContext.Provider value={authContext}>
            <ProfileScreen />
          </AuthContext.Provider>
        </ThemeContext.Provider>
      );

      expect(getByText('Edit Profile')).toBeTruthy();
      expect(getByText('Favorites')).toBeTruthy();
      expect(getByText('App Settings')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('applies warm theme background', () => {
      const warmTheme = { ...mockTheme, colorTemp: 'warm' as const };

      const { root } = render(
        <ThemeContext.Provider value={warmTheme}>
          <AuthContext.Provider
            value={{
              data: mockAuthData,
              clearAuth: mockClearAuth,
              setAuth: jest.fn(),
              loading: false,
            }}
          >
            <ProfileScreen />
          </AuthContext.Provider>
        </ThemeContext.Provider>
      );

      expect(root).toBeTruthy();
    });

    it('applies cool theme background', () => {
      const coolTheme = { ...mockTheme, colorTemp: 'cool' as const };

      const { root } = render(
        <ThemeContext.Provider value={coolTheme}>
          <AuthContext.Provider
            value={{
              data: mockAuthData,
              clearAuth: mockClearAuth,
              setAuth: jest.fn(),
              loading: false,
            }}
          >
            <ProfileScreen />
          </AuthContext.Provider>
        </ThemeContext.Provider>
      );

      expect(root).toBeTruthy();
    });

    it('applies brand primary color to text', () => {
      const { getByTestId } = renderWithProviders(<ProfileScreen />);

      const nameText = getByTestId('profile-name');
      expect(nameText.props.style).toContainEqual(
        expect.objectContaining({ color: mockTheme.brandPrimary })
      );
    });
  });

  describe('Accessibility', () => {
    it('has accessibility labels on key elements', () => {
      const { getByLabelText } = renderWithProviders(<ProfileScreen />);

      expect(getByLabelText('profile picture')).toBeTruthy();
      expect(getByLabelText('edit profile')).toBeTruthy();
    });

    it('has accessibility role on name text', () => {
      const { getByTestId } = renderWithProviders(<ProfileScreen />);

      const nameText = getByTestId('profile-name');
      expect(nameText.props.accessibilityRole).toBe('text');
    });
  });

  describe('Navigation Flow', () => {
    it('navigates through all menu items sequentially', async () => {
      const { getByText } = renderWithProviders(<ProfileScreen />);

      const menuItems = [
        'Edit Profile',
        'Saved Addresses',
        'Saved Payments',
        'Favorites',
        'My Orders',
        'App Settings',
        'Legal',
      ];

      for (const item of menuItems) {
        fireEvent.press(getByText(item));
      }

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(7);
        expect(haptic.hapticLight).toHaveBeenCalledTimes(7);
      });
    });
  });
});
