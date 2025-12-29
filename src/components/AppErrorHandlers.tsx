import { useEffect } from 'react';
import { Alert } from 'react-native';
import { setOnForbiddenGlobal, setOnServerErrorGlobal } from '../utils/apiClient';
import { useTranslation } from '../i18n/useTranslation';

// Note: path above may be adjusted by bundler; using relative import that matches project structure

export default function AppErrorHandlers() {
  const { t } = useTranslation();

  useEffect(() => {
    setOnForbiddenGlobal(() => {
      Alert.alert(t('errors.permission_required'), t('errors.permission_denied'));
    });
    setOnServerErrorGlobal((status: number) => {
      Alert.alert(
        t('errors.serverError'),
        t('errors.serverError').replace('{status}', String(status))
      );
    });
    return () => {
      setOnForbiddenGlobal(null);
      setOnServerErrorGlobal(null);
    };
  }, [t]);

  return null;
}
