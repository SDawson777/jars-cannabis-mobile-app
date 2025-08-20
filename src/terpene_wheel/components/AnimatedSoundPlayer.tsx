import { Audio } from 'expo-av';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface AnimatedSoundPlayerHandle {
  play: () => Promise<void>;
}

interface Props {
  source: number;
}

export const AnimatedSoundPlayer = forwardRef<AnimatedSoundPlayerHandle, Props>(
  ({ source }, ref) => {
    const sound = useRef<Audio.Sound | null>(null);

    useEffect(() => {
      (async () => {
        sound.current = new Audio.Sound();
        try {
          await sound.current.loadAsync(source);
        } catch (e) {
          console.warn('Failed to load sound', e);
        }
      })();
      return () => {
        sound.current?.unloadAsync();
      };
    }, [source]);

    useImperativeHandle(ref, () => ({
      play: async () => {
        try {
          if (!sound.current) return;
          await sound.current.setPositionAsync(0);
          await sound.current.playAsync();
        } catch (e) {
          console.warn('Sound playback failed', e);
        }
      },
    }));

    return null;
  }
);
