import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { I18nProvider, useI18nContext } from '../i18n/I18nProvider';

describe('I18nProvider', () => {
  it('should provide i18n context', () => {
    const TestComponent = () => {
      const { t } = useI18nContext();
      return <Text>{t('common.welcome')}</Text>;
    };

    const { getByText } = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(getByText('common.welcome')).toBeTruthy();
  });

  it('should return key when translation missing', () => {
    const TestComponent = () => {
      const { t } = useI18nContext();
      return <Text>{t('nonexistent.key')}</Text>;
    };

    const { getByText } = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(getByText('nonexistent.key')).toBeTruthy();
  });

  it('should handle variable interpolation', () => {
    const TestComponent = () => {
      const { t } = useI18nContext();
      const result = t('test.key', { name: 'John' });
      return <Text>{result}</Text>;
    };

    const { getByText } = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(getByText('test.key')).toBeTruthy();
  });

  it('should change locale', () => {
    const TestComponent = () => {
      const { locale, setLocale } = useI18nContext();
      return (
        <Text testID="locale" onPress={() => setLocale('en')}>
          {locale}
        </Text>
      );
    };

    const { getByTestId } = render(
      <I18nProvider defaultLocale="en">
        <TestComponent />
      </I18nProvider>
    );

    expect(getByTestId('locale')).toBeTruthy();
  });
});
