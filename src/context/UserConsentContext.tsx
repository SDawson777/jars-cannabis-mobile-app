import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserConsentContextValue {
  personalized: boolean;
  setPersonalized: (val: boolean) => Promise<void>;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => Promise<void>;
}

const PERSONALIZED_KEY = 'user_personalized_consent';
const AUDIO_KEY = 'forYouAudioEnabled';

export const UserConsentContext = createContext<UserConsentContextValue>({
  personalized: true,
  audioEnabled: true,
  setPersonalized: async () => {},
  setAudioEnabled: async () => {},
});

export function UserConsentProvider({ children }: { children: React.ReactNode }) {
  const [personalized, setPersonalizedState] = useState(true);
  const [audioEnabled, setAudioEnabledState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(PERSONALIZED_KEY).then(val => {
      if (val !== null) setPersonalizedState(val === 'true');
    });
    AsyncStorage.getItem(AUDIO_KEY).then(val => {
      if (val !== null) setAudioEnabledState(val === 'true');
    });
  }, []);

  const setPersonalized = async (val: boolean) => {
    setPersonalizedState(val);
    await AsyncStorage.setItem(PERSONALIZED_KEY, val ? 'true' : 'false');
  };

  const setAudioEnabled = async (val: boolean) => {
    setAudioEnabledState(val);
    await AsyncStorage.setItem(AUDIO_KEY, val ? 'true' : 'false');
  };

  return (
    <UserConsentContext.Provider
      value={{ personalized, setPersonalized, audioEnabled, setAudioEnabled }}
    >
      {children}
    </UserConsentContext.Provider>
  );
}
