import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'personalization_enabled';

export function usePersonalization(): [boolean, (val: boolean) => Promise<void>] {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(val => {
      if (val !== null) setEnabled(val === 'true');
    });
  }, []);

  const update = async (val: boolean) => {
    setEnabled(val);
    await AsyncStorage.setItem(KEY, val ? 'true' : 'false');
  };

  return [enabled, update];
}
