import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import * as secureStorage from '../utils/secureStorage';

jest.mock('../utils/secureStorage', () => ({
  saveSecure: jest.fn(),
  getSecure: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('../i18n/I18nProvider', () => ({
  useI18nContext: () => ({
    setLocale: jest.fn(),
  }),
}));

const TestComponent = () => {
  const { biometricEnabled, setBiometricEnabled, locale, setLocale } = useSettings();
  return (
    <>
      <Text testID="biometric">{biometricEnabled ? 'enabled' : 'disabled'}</Text>
      <Text testID="locale">{locale}</Text>
      <Pressable testID="toggle-biometric" onPress={() => setBiometricEnabled(!biometricEnabled)}>
        <Text>Toggle Biometric</Text>
      </Pressable>
      <Pressable testID="set-spanish" onPress={() => setLocale('es')}>
        <Text>Set Spanish</Text>
      </Pressable>
    </>
  );
};

describe('SettingsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (secureStorage.getSecure as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should provide default settings', async () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(getByTestId('biometric').props.children).toBe('enabled');
    expect(getByTestId('locale').props.children).toBe('en');
  });

  it('should load biometric setting from secure storage', async () => {
    (secureStorage.getSecure as jest.Mock).mockResolvedValue('false');

    const { getByTestId } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(getByTestId('biometric').props.children).toBe('disabled');
    });
  });

  it('should load locale from async storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('es');

    const { getByTestId } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(getByTestId('locale').props.children).toBe('es');
    });
  });

  it('should save biometric setting when changed', async () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    fireEvent.press(getByTestId('toggle-biometric'));

    await waitFor(() => {
      expect(secureStorage.saveSecure).toHaveBeenCalledWith('useBiometricAuth', 'false');
    });
  });

  it('should save locale when changed', async () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    fireEvent.press(getByTestId('set-spanish'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('locale', 'es');
    });
  });
});
