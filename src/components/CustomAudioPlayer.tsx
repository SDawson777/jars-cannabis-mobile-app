import { useEffect } from 'react';
import Sound from 'react-native-sound';

export default function CustomAudioPlayer({ source, play }: { source: string; play: boolean }) {
  useEffect(() => {
    const sound = new Sound(source, Sound.MAIN_BUNDLE, () => {
      if (play) sound.setNumberOfLoops(-1).play();
    });
    return () => {
      sound.stop(() => sound.release());
    };
  }, [play, source]);
  return null;
}
