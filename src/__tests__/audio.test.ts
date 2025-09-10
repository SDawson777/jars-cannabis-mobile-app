import audio, { 
  initializeAudio, 
  preload, 
  play, 
  stop, 
  unload, 
  unloadAll, 
  getCachedKeys, 
  isCached 
} from '../lib/audio';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn().mockResolvedValue(undefined),
      replayAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
      getStatusAsync: jest.fn().mockResolvedValue({
        isLoaded: true,
        isPlaying: false,
      }),
    })),
  },
}));

import { Audio } from 'expo-av';

describe('Audio Library', () => {
  let mockSound: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSound = {
      loadAsync: jest.fn().mockResolvedValue(undefined),
      replayAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
      getStatusAsync: jest.fn().mockResolvedValue({
        isLoaded: true,
        isPlaying: false,
      }),
    };
    (Audio.Sound as jest.Mock).mockImplementation(() => mockSound);
  });

  afterEach(async () => {
    // Clean up after each test
    await unloadAll();
  });

  describe('initializeAudio', () => {
    it('should initialize audio with correct settings', async () => {
      await initializeAudio();
      
      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    });

    it('should handle initialization errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      (Audio.setAudioModeAsync as jest.Mock).mockRejectedValueOnce(new Error('Init failed'));
      
      await initializeAudio();
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize audio:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should not initialize twice', async () => {
      await initializeAudio();
      await initializeAudio();
      
      expect(Audio.setAudioModeAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('preload', () => {
    it('should preload audio file successfully', async () => {
      const source = { uri: 'test.mp3' };
      
      await preload('test', source);
      
      expect(Audio.Sound).toHaveBeenCalled();
      expect(mockSound.loadAsync).toHaveBeenCalledWith(source, {
        shouldPlay: false,
        volume: 1.0,
        isLooping: false,
      });
      expect(isCached('test')).toBe(true);
    });

    it('should not preload if already cached', async () => {
      const source = { uri: 'test.mp3' };
      
      await preload('test', source);
      await preload('test', source); // Second call
      
      expect(Audio.Sound).toHaveBeenCalledTimes(1);
    });

    it('should handle preload errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockSound.loadAsync.mockRejectedValueOnce(new Error('Load failed'));
      
      await preload('test', { uri: 'test.mp3' });
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to preload audio test:', expect.any(Error));
      expect(isCached('test')).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should handle timeout errors', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      // Mock a long-running load that will timeout
      mockSound.loadAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 6000)));
      
      await preload('test', { uri: 'test.mp3' }, { timeout: 100 });
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to preload audio test:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should apply custom options', async () => {
      const source = { uri: 'test.mp3' };
      const options = { volume: 0.5, loop: true };
      
      await preload('test', source, options);
      
      expect(mockSound.loadAsync).toHaveBeenCalledWith(source, {
        shouldPlay: false,
        volume: 0.5,
        isLooping: true,
      });
    });
  });

  describe('play', () => {
    it('should play cached audio file', async () => {
      await preload('test', { uri: 'test.mp3' });
      
      await play('test');
      
      expect(mockSound.replayAsync).toHaveBeenCalled();
    });

    it('should preload and play if not cached', async () => {
      const source = { uri: 'test.mp3' };
      
      await play('test', source);
      
      expect(mockSound.loadAsync).toHaveBeenCalled();
      expect(mockSound.replayAsync).toHaveBeenCalled();
    });

    it('should handle play errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockSound.replayAsync.mockRejectedValueOnce(new Error('Play failed'));
      
      await preload('test', { uri: 'test.mp3' });
      await play('test');
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to play audio test:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should warn if no audio found and no source provided', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await play('nonexistent');
      
      expect(consoleSpy).toHaveBeenCalledWith('No audio found for key: nonexistent');
      consoleSpy.mockRestore();
    });

    it('should stop current playback before replaying', async () => {
      mockSound.getStatusAsync.mockResolvedValueOnce({
        isLoaded: true,
        isPlaying: true,
      });
      
      await preload('test', { uri: 'test.mp3' });
      await play('test');
      
      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect(mockSound.replayAsync).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop playing audio', async () => {
      mockSound.getStatusAsync.mockResolvedValueOnce({
        isLoaded: true,
        isPlaying: true,
      });
      
      await preload('test', { uri: 'test.mp3' });
      await stop('test');
      
      expect(mockSound.stopAsync).toHaveBeenCalled();
    });

    it('should handle stop errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockSound.stopAsync.mockRejectedValueOnce(new Error('Stop failed'));
      mockSound.getStatusAsync.mockResolvedValueOnce({
        isLoaded: true,
        isPlaying: true,
      });
      
      await preload('test', { uri: 'test.mp3' });
      await stop('test');
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to stop audio test:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should do nothing if audio not cached', async () => {
      await stop('nonexistent');
      
      expect(mockSound.stopAsync).not.toHaveBeenCalled();
    });
  });

  describe('unload', () => {
    it('should unload specific audio file', async () => {
      await preload('test', { uri: 'test.mp3' });
      expect(isCached('test')).toBe(true);
      
      await unload('test');
      
      expect(mockSound.unloadAsync).toHaveBeenCalled();
      expect(isCached('test')).toBe(false);
    });

    it('should handle unload errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockSound.unloadAsync.mockRejectedValueOnce(new Error('Unload failed'));
      
      await preload('test', { uri: 'test.mp3' });
      await unload('test');
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to unload audio test:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('unloadAll', () => {
    it('should unload all cached audio files', async () => {
      await preload('test1', { uri: 'test1.mp3' });
      await preload('test2', { uri: 'test2.mp3' });
      
      expect(getCachedKeys()).toEqual(['test1', 'test2']);
      
      await unloadAll();
      
      expect(getCachedKeys()).toEqual([]);
    });

    it('should handle unload errors for individual files', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Create two sounds, one that fails to unload
      const failingSound = {
        ...mockSound,
        unloadAsync: jest.fn().mockRejectedValue(new Error('Unload failed')),
      };
      
      (Audio.Sound as jest.Mock).mockImplementationOnce(() => mockSound);
      await preload('test1', { uri: 'test1.mp3' });
      
      (Audio.Sound as jest.Mock).mockImplementationOnce(() => failingSound);
      await preload('test2', { uri: 'test2.mp3' });
      
      await unloadAll();
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to unload audio test2:', expect.any(Error));
      expect(getCachedKeys()).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('utility functions', () => {
    it('should return cached keys', async () => {
      await preload('test1', { uri: 'test1.mp3' });
      await preload('test2', { uri: 'test2.mp3' });
      
      const keys = getCachedKeys();
      expect(keys).toContain('test1');
      expect(keys).toContain('test2');
    });

    it('should check if audio is cached', async () => {
      expect(isCached('test')).toBe(false);
      
      await preload('test', { uri: 'test.mp3' });
      
      expect(isCached('test')).toBe(true);
    });
  });

  describe('default export', () => {
    it('should have all expected methods', () => {
      expect(typeof audio.initialize).toBe('function');
      expect(typeof audio.preload).toBe('function');
      expect(typeof audio.play).toBe('function');
      expect(typeof audio.stop).toBe('function');
      expect(typeof audio.unload).toBe('function');
      expect(typeof audio.unloadAll).toBe('function');
      expect(typeof audio.getCachedKeys).toBe('function');
      expect(typeof audio.isCached).toBe('function');
    });
  });
});