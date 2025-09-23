import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const KEY = 'personalization_enabled';

export function usePersonalization(): [boolean, (__val: boolean) => Promise<void>] {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(val => {
      if (val !== null) setEnabled(val === 'true');
    });
  }, []);

  const update = async (__val: boolean) => {
    setEnabled(__val);
    await AsyncStorage.setItem(KEY, __val ? 'true' : 'false');
  };

  return [enabled, update];
}
