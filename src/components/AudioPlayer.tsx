import { useEffect } from 'react';

import audio from '../lib/audio';

interface AudioPlayerProps {
  /** Unique key for the audio file */
  audioKey: string;
  /** Audio source (require() or URI) */
  source: any;
  /** Whether to play the audio */
  play: boolean;
  /** Whether to loop the audio */
  loop?: boolean;
  /** Volume level (0.0 to 1.0) */
  volume?: number;
  /** Auto-preload the audio when component mounts */
  preload?: boolean;
}

/**
 * Enhanced audio player component using the new audio library
 * Replaces the old CustomAudioPlayer with better error handling and caching
 */
export default function AudioPlayer({ 
  audioKey, 
  source, 
  play, 
  loop = false, 
  volume = 1.0, 
  preload = true 
}: AudioPlayerProps) {
  useEffect(() => {
    // Preload the audio file when component mounts if enabled
    if (preload) {
      audio.preload(audioKey, source, { volume, loop });
    }
    
    // Cleanup when component unmounts
    return () => {
      audio.stop(audioKey);
    };
  }, [audioKey, source, volume, loop, preload]);

  useEffect(() => {
    if (play) {
      audio.play(audioKey, source, { volume, loop });
    } else {
      audio.stop(audioKey);
    }
  }, [play, audioKey, source, volume, loop]);

  // This component doesn't render anything
  return null;
}