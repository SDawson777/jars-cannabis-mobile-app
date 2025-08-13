import * as Localization from 'expo-localization';

const translations = {
  en: {
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',
    selectLanguage: 'Select Language',
  },
  es: {
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    selectLanguage: 'Selecciona el idioma',
  },
};

let currentLocale = Localization.getLocales()[0]?.languageCode || 'en';

export const setLocale = (locale: string) => {
  currentLocale = locale;
};

export const t = (key: keyof typeof translations['en']) => {
  const locale = translations[currentLocale] ? currentLocale : 'en';
  return translations[locale][key] || key;
};
