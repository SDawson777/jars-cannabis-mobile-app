import { t, setLocale } from '../utils/i18n';

describe('i18n', () => {
  beforeEach(() => {
    // Reset to English before each test
    setLocale('en');
  });

  describe('t (translate)', () => {
    it('should return English translations by default', () => {
      expect(t('language')).toBe('Language');
      expect(t('english')).toBe('English');
      expect(t('spanish')).toBe('Spanish');
      expect(t('selectLanguage')).toBe('Select Language');
    });

    it('should return Spanish translations when locale is set to es', () => {
      setLocale('es');

      expect(t('language')).toBe('Idioma');
      expect(t('english')).toBe('Inglés');
      expect(t('spanish')).toBe('Español');
      expect(t('selectLanguage')).toBe('Selecciona el idioma');
    });

    it('should fall back to English for unsupported locales', () => {
      setLocale('fr');

      expect(t('language')).toBe('Language');
      expect(t('english')).toBe('English');
    });

    it('should return key when translation is not found', () => {
      // @ts-expect-error - Testing invalid key
      const result = t('nonexistent');
      // Falls back to the key itself
      expect(result).toBe('nonexistent');
    });
  });

  describe('setLocale', () => {
    it('should change the current locale', () => {
      expect(t('language')).toBe('Language');

      setLocale('es');
      expect(t('language')).toBe('Idioma');

      setLocale('en');
      expect(t('language')).toBe('Language');
    });
  });
});
