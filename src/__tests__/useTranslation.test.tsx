import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useTranslation } from '../i18n/useTranslation';
import { I18nProvider } from '../i18n/I18nProvider';

describe('useTranslation', () => {
  it('should return translation function', () => {
    const TestComponent = () => {
      const { t } = useTranslation();
      return <Text>{t('common.welcome')}</Text>;
    };

    const { getByText } = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(getByText('common.welcome')).toBeTruthy();
  });

  it('should return locale', () => {
    const TestComponent = () => {
      const { locale } = useTranslation();
      return <Text>{locale}</Text>;
    };

    const { getByText } = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(getByText('en')).toBeTruthy();
  });
});
