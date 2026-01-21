// src/__tests__/utils/i18n.test.ts
import { setLocale, t } from '../../utils/i18n';

describe('i18n utility', () => {
  beforeEach(() => {
    // Reset to default locale
    setLocale('en');
  });

  describe('setLocale', () => {
    it('should set the current locale to English', () => {
      setLocale('en');
      expect(t('language')).toBe('Language');
    });

    it('should set the current locale to Spanish', () => {
      setLocale('es');
      expect(t('language')).toBe('Idioma');
    });

    it('should fall back to English for unknown locales', () => {
      setLocale('fr');
      expect(t('language')).toBe('Language');
    });
  });

  describe('t (translate)', () => {
    it('should translate language key in English', () => {
      setLocale('en');
      expect(t('language')).toBe('Language');
      expect(t('english')).toBe('English');
      expect(t('spanish')).toBe('Spanish');
      expect(t('selectLanguage')).toBe('Select Language');
    });

    it('should translate language key in Spanish', () => {
      setLocale('es');
      expect(t('language')).toBe('Idioma');
      expect(t('english')).toBe('Inglés');
      expect(t('spanish')).toBe('Español');
      expect(t('selectLanguage')).toBe('Selecciona el idioma');
    });
  });
});
