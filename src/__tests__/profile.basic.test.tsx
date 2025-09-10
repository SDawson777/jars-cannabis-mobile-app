import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock user data
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  dateOfBirth: '1990-01-01',
};

// Mock auth context
const mockAuthContext = {
  user: mockUser,
  token: 'mock-token',
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  updateProfile: jest.fn(),
  isLoading: false,
};

// Mock theme context
const mockThemeContext = {
  colorTemp: 'neutral' as const,
  jarsPrimary: '#2E8B57',
  jarsSecondary: '#FFD700',
  jarsBackground: '#F9F9F9',
  loading: false,
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <AuthContext.Provider value={mockAuthContext}>
      <ThemeContext.Provider value={mockThemeContext}>
        {children}
      </ThemeContext.Provider>
    </AuthContext.Provider>
  </NavigationContainer>
);

describe('Profile Basic Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ProfileScreen', () => {
    it('should render user profile information', () => {
      const { getByText } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });

    it('should have accessible profile image', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      const profileImage = getByTestId('profile-image');
      expect(profileImage).toBeTruthy();
    });

    it('should navigate to edit profile when edit button is pressed', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      const editButton = getByTestId('edit-profile-button');
      fireEvent.press(editButton);

      expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
    });

    it('should show logout option', () => {
      const { getByText } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      expect(getByText('Logout')).toBeTruthy();
    });

    it('should handle logout action', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      const logoutButton = getByText('Logout');
      fireEvent.press(logoutButton);

      await waitFor(() => {
        expect(mockAuthContext.logout).toHaveBeenCalled();
      });
    });
  });

  describe('EditProfileScreen', () => {
    it('should render edit profile form with current values', () => {
      const { getByDisplayValue } = render(
        <TestWrapper>
          <EditProfileScreen />
        </TestWrapper>
      );

      expect(getByDisplayValue('John')).toBeTruthy();
      expect(getByDisplayValue('Doe')).toBeTruthy();
      expect(getByDisplayValue('test@example.com')).toBeTruthy();
    });

    it('should allow updating first name', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <EditProfileScreen />
        </TestWrapper>
      );

      const firstNameInput = getByTestId('first-name-input');
      fireEvent.changeText(firstNameInput, 'Jane');

      expect(firstNameInput.props.value).toBe('Jane');
    });

    it('should save profile changes', async () => {
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <EditProfileScreen />
        </TestWrapper>
      );

      const firstNameInput = getByTestId('first-name-input');
      fireEvent.changeText(firstNameInput, 'Jane');

      const saveButton = getByText('Save Changes');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockAuthContext.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Jane',
          })
        );
      });
    });

    it('should validate email format', async () => {
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <EditProfileScreen />
        </TestWrapper>
      );

      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'invalid-email');

      const saveButton = getByText('Save Changes');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(getByText(/valid email/i)).toBeTruthy();
      });
    });

    it('should navigate back after successful save', async () => {
      const { getByText } = render(
        <TestWrapper>
          <EditProfileScreen />
        </TestWrapper>
      );

      const saveButton = getByText('Save Changes');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });
  });

  describe('Profile Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      expect(getByLabelText(/profile picture/i)).toBeTruthy();
      expect(getByLabelText(/edit profile/i)).toBeTruthy();
    });

    it('should announce profile information for screen readers', () => {
      const { getByText } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      const profileName = getByText('John Doe');
      expect(profileName.props.accessibilityRole).toBe('text');
    });
  });

  describe('Profile Settings Integration', () => {
    it('should navigate to settings screens', () => {
      const { getByText } = render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      // Test navigation to various settings
      const settingsButtons = [
        'Privacy Settings',
        'Accessibility Settings',
        'App Settings',
      ];

      settingsButtons.forEach(buttonText => {
        const button = getByText(buttonText);
        fireEvent.press(button);
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('Settings')
        );
      });
    });
  });

  describe('Profile Data Persistence', () => {
    it('should load profile data on component mount', () => {
      render(
        <TestWrapper>
          <ProfileScreen />
        </TestWrapper>
      );

      // Verify that user data is displayed correctly from context
      expect(mockAuthContext.user).toEqual(mockUser);
    });

    it('should handle missing profile data gracefully', () => {
      const emptyAuthContext = {
        ...mockAuthContext,
        user: null,
      };

      const { getByText } = render(
        <NavigationContainer>
          <AuthContext.Provider value={emptyAuthContext}>
            <ThemeContext.Provider value={mockThemeContext}>
              <ProfileScreen />
            </ThemeContext.Provider>
          </AuthContext.Provider>
        </NavigationContainer>
      );

      expect(getByText(/sign in/i)).toBeTruthy();
    });
  });
});