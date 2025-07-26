import { useEffect, useContext } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserConsentContext } from '../context/UserConsentContext';

const KEY = 'forYouAudioEnabled';

export async function setAudioEnabled(val: boolean) {
  await AsyncStorage.setItem(KEY, val ? 'true' : 'false');
}

export default function CustomAudioPlayer({ source }: { source: number }) {
  const { audioEnabled } = useContext(UserConsentContext);

  useEffect(() => {
    let sound: Audio.Sound | undefined;
    const play = async () => {
      const enabled = (await AsyncStorage.getItem(KEY)) !== 'false';
      if (!enabled || !audioEnabled) return;
      sound = new Audio.Sound();
      await sound.loadAsync(source);
      await sound.playAsync();
      setTimeout(() => {
        sound?.setStatusAsync({ volume: 0 });
      }, 2000);
    };
    play();
    return () => {
      sound?.unloadAsync();
    };
  }, [source, audioEnabled]);
  return null;
}
