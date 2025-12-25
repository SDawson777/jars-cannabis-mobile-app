import { useEffect } from 'react';
import { Alert } from 'react-native';
import { setOnForbiddenGlobal, setOnServerErrorGlobal } from '../utils/apiClient';

// Note: path above may be adjusted by bundler; using relative import that matches project structure

export default function AppErrorHandlers() {
  useEffect(() => {
    setOnForbiddenGlobal(() => {
      Alert.alert('Permission required', "You don't have permission to perform this action.");
    });
    setOnServerErrorGlobal((status: number) => {
      Alert.alert('Server error', `Server returned ${status}. Please try again later.`);
    });
    return () => {
      setOnForbiddenGlobal(null);
      setOnServerErrorGlobal(null);
    };
  }, []);

  return null;
}
