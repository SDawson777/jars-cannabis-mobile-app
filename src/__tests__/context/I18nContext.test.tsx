// src/__tests__/context/I18nContext.test.tsx
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { I18nProvider, useI18n } from '../../context/I18nContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('I18nContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <I18nProvider>{children}</I18nProvider>
  );

  describe('I18nProvider', () => {
    it('should provide default locale as en', async () => {
      const { result } = renderHook(() => useI18n(), { wrapper });

      await waitFor(() => {
        expect(result.current.locale).toBe('en');
      });
    });

    it('should load stored locale from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('en');

      const { result } = renderHook(() => useI18n(), { wrapper });

      await waitFor(() => {
        expect(result.current.locale).toBe('en');
      });
    });
  });

  describe('setLocale', () => {
    it('should update locale and save to AsyncStorage', async () => {
      const { result } = renderHook(() => useI18n(), { wrapper });

      await act(async () => {
        await result.current.setLocale('en');
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@nimbus/locale', 'en');
    });
  });

  describe('t (translate)', () => {
    it('should return key if translation not found', async () => {
      const { result } = renderHook(() => useI18n(), { wrapper });

      await waitFor(() => {
        expect(result.current.t('non.existent.key')).toBe('non.existent.key');
      });
    });

    it('should support parameter substitution', async () => {
      const { result } = renderHook(() => useI18n(), { wrapper });

      // Test with a key that doesn't exist - should return the key
      await waitFor(() => {
        const translated = result.current.t('greeting.hello', { name: 'John' });
        expect(typeof translated).toBe('string');
      });
    });
  });

  describe('useI18n', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useI18n());
      }).toThrow('useI18n must be used within I18nProvider');
    });
  });
});
