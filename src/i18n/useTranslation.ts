import { useI18nContext } from './I18nProvider';

export function useTranslation() {
  const { t, locale, setLocale } = useI18nContext();
  return { t, locale, setLocale };
}
