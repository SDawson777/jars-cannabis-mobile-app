import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const KEY = 'personalization_enabled';

export function usePersonalization(): [boolean, (_val: boolean) => Promise<void>] {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(val => {
      if (val !== null) setEnabled(val === 'true');
    });
  }, []);

  const update = async (_val: boolean) => {
    setEnabled(_val);
    await AsyncStorage.setItem(KEY, _val ? 'true' : 'false');
  };

  return [enabled, update];
}
