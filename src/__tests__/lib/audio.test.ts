/**
 * @jest-environment jsdom
 */

import {
  initializeAudio,
  preload,
  play,
  stop,
  unload,
  unloadAll,
  getCachedKeys,
  isCached,
} from '../../lib/audio';
import { Audio } from 'expo-av';

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn().mockResolvedValue(undefined),
      replayAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
      getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
    })),
  },
}));

describe('audio library', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await unloadAll();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.warn as jest.Mock).mockRestore();
  });

  describe('initializeAudio', () => {
    it('sets audio mode', async () => {
      await initializeAudio();
      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    });

    it('initializes only once', async () => {
      await initializeAudio();
      await initializeAudio();
      // Called once from first initialization
      expect(Audio.setAudioModeAsync).toHaveBeenCalledTimes(1);
    });

    it('handles initialization errors', async () => {
      (Audio.setAudioModeAsync as jest.Mock).mockRejectedValueOnce(new Error('Init failed'));
      await initializeAudio();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('preload', () => {
    it('loads audio into cache', async () => {
      await preload('test', { uri: 'test.mp3' });
      expect(isCached('test')).toBe(true);
    });

    it('does not reload if already cached', async () => {
      await preload('test', { uri: 'test.mp3' });
      const soundInstancesBefore = (Audio.Sound as jest.Mock).mock.calls.length;
      await preload('test', { uri: 'test.mp3' });
      expect((Audio.Sound as jest.Mock).mock.calls.length).toBe(soundInstancesBefore);
    });

    it('handles load errors gracefully', async () => {
      (Audio.Sound as jest.Mock).mockImplementationOnce(() => ({
        loadAsync: jest.fn().mockRejectedValue(new Error('Load failed')),
      }));

      await preload('test', { uri: 'test.mp3' });
      expect(console.warn).toHaveBeenCalled();
      expect(isCached('test')).toBe(false);
    });

    it('supports volume option', async () => {
      await preload('test', { uri: 'test.mp3' }, { volume: 0.5 });
      expect(isCached('test')).toBe(true);
    });

    it('supports loop option', async () => {
      await preload('test', { uri: 'test.mp3' }, { loop: true });
      expect(isCached('test')).toBe(true);
    });
  });

  describe('play', () => {
    it('plays cached audio', async () => {
      await preload('test', { uri: 'test.mp3' });
      await play('test');
      // Should have called loadAsync during preload and replayAsync during play
      expect(Audio.Sound).toHaveBeenCalled();
    });

    it('preloads before playing if not cached', async () => {
      await play('test', { uri: 'test.mp3' });
      expect(isCached('test')).toBe(true);
    });

    it('handles play errors gracefully', async () => {
      await play('nonexistent');
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('stops playing audio', async () => {
      await preload('test', { uri: 'test.mp3' });
      await stop('test');
      // Should call getStatusAsync
      expect(Audio.Sound).toHaveBeenCalled();
    });

    it('handles stop for non-existent audio', async () => {
      await stop('nonexistent');
      // Should not throw
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('unload', () => {
    it('unloads audio from cache', async () => {
      await preload('test', { uri: 'test.mp3' });
      expect(isCached('test')).toBe(true);
      await unload('test');
      expect(isCached('test')).toBe(false);
    });

    it('handles unload for non-existent audio', async () => {
      await unload('nonexistent');
      // Should not throw
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('unloadAll', () => {
    it('unloads all cached audio', async () => {
      await preload('test1', { uri: 'test1.mp3' });
      await preload('test2', { uri: 'test2.mp3' });
      expect(getCachedKeys().length).toBe(2);

      await unloadAll();
      expect(getCachedKeys().length).toBe(0);
    });

    it('resets initialization state', async () => {
      await initializeAudio();
      await unloadAll();
      // After unloadAll, next initializeAudio should call setAudioModeAsync again
      (Audio.setAudioModeAsync as jest.Mock).mockClear();
      await initializeAudio();
      expect(Audio.setAudioModeAsync).toHaveBeenCalled();
    });
  });

  describe('getCachedKeys', () => {
    it('returns empty array when no cache', () => {
      expect(getCachedKeys()).toEqual([]);
    });

    it('returns cached keys', async () => {
      await preload('test1', { uri: 'test1.mp3' });
      await preload('test2', { uri: 'test2.mp3' });
      expect(getCachedKeys()).toContain('test1');
      expect(getCachedKeys()).toContain('test2');
    });
  });

  describe('isCached', () => {
    it('returns false for uncached audio', () => {
      expect(isCached('test')).toBe(false);
    });

    it('returns true for cached audio', async () => {
      await preload('test', { uri: 'test.mp3' });
      expect(isCached('test')).toBe(true);
    });
  });
});
