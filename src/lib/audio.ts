import { Audio } from 'expo-av';

import logger from './logger';

interface AudioOptions {
  timeout?: number;
  enablePreload?: boolean;
  volume?: number;
  loop?: boolean;
}

let cache: Record<string, Audio.Sound> = {};
let isInitialized = false;

/**
 * Initialize the audio system
 */
export async function initializeAudio(): Promise<void> {
  if (isInitialized) return;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    isInitialized = true;
  } catch (error) {
    // Log directly to console so tests that spy on console.warn receive the Error object
    console.warn('Failed to initialize audio:', error);
  }
}

/**
 * Preload an audio file into the cache
 */
export async function preload(key: string, source: any, options: AudioOptions = {}): Promise<void> {
  if (cache[key]) return;

  const { timeout = 5000 } = options;

  try {
    await initializeAudio();

    const sound = new Audio.Sound();

    // Add timeout wrapper
    const loadPromise = sound.loadAsync(source, {
      shouldPlay: false,
      volume: options.volume ?? 1.0,
      isLooping: options.loop ?? false,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Audio preload timeout for ${key}`)), timeout);
    });

    await Promise.race([loadPromise, timeoutPromise]);
    cache[key] = sound;
  } catch (error) {
    // Use console.warn so the Error object is passed as a separate arg (tests assert this)
    console.warn(`Failed to preload audio ${key}:`, error);
    // Don't throw, just warn and continue
  }
}

/**
 * Play an audio file (preload if not cached)
 */
export async function play(key: string, source?: any, options: AudioOptions = {}): Promise<void> {
  try {
    await initializeAudio();

    if (!cache[key] && source) {
      await preload(key, source, options);
    }

    const sound = cache[key];
    if (!sound) {
      logger.warn(`No audio found for key: ${key}`);
      return;
    }

    // Stop current playback if playing
    const status = await sound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await sound.stopAsync();
    }

    await sound.replayAsync();
  } catch (error) {
    console.warn(`Failed to play audio ${key}:`, error);
    // Don't throw, just warn and continue
  }
}

/**
 * Stop a specific audio file
 */
export async function stop(key: string): Promise<void> {
  try {
    const sound = cache[key];
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await sound.stopAsync();
    }
  } catch (error) {
    console.warn(`Failed to stop audio ${key}:`, error);
  }
}

/**
 * Unload a specific audio file from cache
 */
export async function unload(key: string): Promise<void> {
  try {
    const sound = cache[key];
    if (!sound) return;

    await sound.unloadAsync();
    delete cache[key];
  } catch (error) {
    console.warn(`Failed to unload audio ${key}:`, error);
  }
}

/**
 * Unload all cached audio files and clear cache
 */
export async function unloadAll(): Promise<void> {
  const unloadPromises = Object.entries(cache).map(async ([key, sound]) => {
    try {
      await sound.unloadAsync();
    } catch (error) {
      console.warn(`Failed to unload audio ${key}:`, error);
    }
  });

  await Promise.all(unloadPromises);
  cache = {};
  // reset initialization state so tests that call unloadAll in afterEach get a fresh module state
  isInitialized = false;
}

/**
 * Get the current audio cache keys
 */
export function getCachedKeys(): string[] {
  return Object.keys(cache);
}

/**
 * Check if an audio file is cached
 */
export function isCached(key: string): boolean {
  return !!cache[key];
}

// Create a default export with common functionality
const audio = {
  initialize: initializeAudio,
  preload,
  play,
  stop,
  unload,
  unloadAll,
  getCachedKeys,
  isCached,
};

export default audio;
