declare module 'expo-av' {
  export namespace Audio {
    type PlaybackStatus = {
      isLoaded?: boolean;
      isPlaying?: boolean;
      didJustFinish?: boolean;
      error?: string | null;
      [key: string]: any;
    };

    class Sound {
      constructor();
      /**
       * Load a source. Second param is optional initial status/options.
       */
      loadAsync(source: any, initialStatus?: any): Promise<PlaybackStatus>;

      /**
       * Get current playback status
       */
      getStatusAsync(): Promise<PlaybackStatus>;

      /**
       * Set playback position in milliseconds
       */
      setPositionAsync(positionMillis: number): Promise<void>;

      /**
       * Play from current position
       */
      playAsync(): Promise<void>;

      /**
       * Replay (seek to 0 and play)
       */
      replayAsync(): Promise<void>;

      /**
       * Stop playback
       */
      stopAsync(): Promise<void>;

      /**
       * Unload resources
       */
      unloadAsync(): Promise<void>;

      /**
       * Set looping flag
       */
      setIsLoopingAsync(isLooping: boolean): Promise<void>;

      /**
       * Register a callback for playback status updates
       */
      setOnPlaybackStatusUpdate(callback: (status: PlaybackStatus) => void): void;
    }
  }
}
